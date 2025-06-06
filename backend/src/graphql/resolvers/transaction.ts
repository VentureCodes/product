import { ApolloServerErrorCode } from '@apollo/server/errors'
import { isAddress } from 'ethers'
import { GraphQLError } from 'graphql'
import { arg, extendType, intArg } from 'nexus'
import {
  MamlakaCurrencyEnum,
  MamlakaWrapper,
  getSessionToken,
  sendSMS,
} from '../../utils'
import { handlePrismaError, removeEmpty } from '../helper'

export const TransactionQuery = extendType({
  type: 'Query',
  definition: (t) => {
    t.nonNull.list.nonNull.field('transactions', {
      type: 'Transaction',
      args: {
        where: arg({
          type: 'TransactionWhereInput',
        }),
        take: intArg(),
        skip: intArg(),
        orderBy: arg({
          type: 'TransactionOrderByInput',
        }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where, take, skip, orderBy } = removeEmpty(args)

        try {
          return await prisma.transaction.findMany({
            where,
            take,
            skip,
            orderBy,
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.nullable.field('transaction', {
      type: 'Transaction',
      args: {
        where: arg({
          type: 'TransactionWhereUniqueInput',
        }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where } = removeEmpty(args)

        try {
          return await prisma.transaction.findUnique({ where })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})

export const TransactionMutation = extendType({
  type: 'Mutation',
  definition: (t) => {
    t.field('createTransaction', {
      type: 'TransactionCreateResponse',
      args: {
        data: arg({
          type: 'TransactionCreateInput',
        }),
      },
      resolve: async (_, args, context) => {
        if (!isAddress(args.data?.receiverAddress || '')) {
          console.log('Invalid receiver address')
          throw new GraphQLError('Invalid receiver address', {
            extensions: {
              code: ApolloServerErrorCode.BAD_USER_INPUT,
              http: { status: 400 },
            },
          })
        }

        const { data } = removeEmpty(args)
        let receiver, paymentMethod, ad, transaction

        // Retrieve receiver
        try {
          receiver = await context.prisma.user.findUnique({
            where: { id: args.data?.receiverId },
          })
          if (!receiver) throw new Error('Receiver account not found')
        } catch (error: any) {
          console.error('Failed to get receiver:', error.message, error.stack)
          return handlePrismaError(error)
        }

        // Retrieve payment method
        try {
          paymentMethod = await context.prisma.paymentMethod.findUnique({
            where: { id: args.data?.paymentMethodId },
          })
          if (!paymentMethod) throw new Error('Invalid payment method')
        } catch (error: any) {
          console.error(
            'Failed to get Payment Method:',
            error.message,
            error.stack,
          )
          return handlePrismaError(error)
        }

        // Retrieve ad details
        try {
          ad = await context.prisma.ad.findFirst({
            where: { id: args.data?.adId },
            include: { fiat: { select: { symbol: true } } },
          })
          if (!ad) throw new Error('Ad not found')
        } catch (error: any) {
          console.error('Failed to get ad:', error.message, error.stack)
          return handlePrismaError(error)
        }

        // Create transaction
        try {
          data.phone = receiver.phone
          data.quantity = parseInt(data.amount) / ad.price
          data.fiatId = ad.fiatId
          data.coinId = ad.coinId
          transaction = await context.prisma.transaction.create({ data })
        } catch (error: any) {
          console.error(
            'Failed to create transaction:',
            error.message,
            error.stack,
          )
          return handlePrismaError(error)
        }

        // Payment Processing
        try {
          let { phone: payerPhone, id: externalId, amount } = transaction
          if (context.mamlakaSession.expiresAt < new Date()) {
            const session = await getSessionToken({
              baseUrl: process.env.MAM_LAKA_BASE_URL!,
              username: process.env.MAM_LAKA_USERNAME!,
              password: process.env.MAM_LAKA_PASSWORD!,
            })
            if (!session || session.error)
              throw new Error('Failed to get session token')
            context.mamlakaSession.session = session.accessToken
            context.mamlakaSession.expiresAt = new Date(session.expiresDate)
          }

          const mamlaka = new MamlakaWrapper(
            process.env.MAM_LAKA_BASE_URL!,
            process.env.MAM_LAKA_USERNAME!,
            context.mamlakaSession.session,
          )

          let success, message
          const callbackUrl = `${process.env.BASE_URL}/mamlaka/callback`

          switch (paymentMethod.name.toLowerCase()) {
            case 'm-pesa': {
              let response = await mamlaka.initiateMobilePayment({
                currency: ad.fiat.symbol as MamlakaCurrencyEnum,
                payerPhone,
                externalId,
                amount,
                callbackUrl,
              })
              if (!response || response.error)
                throw new Error('Failed to initiate M-Pesa payment')

              await context.prisma.transaction.update({
                where: { id: transaction.id },
                data: { paymentSecureId: response.sid },
              })
              success = !response.error
              message = response.message
              break
            }

            case 'card': {
              let response = await mamlaka.generateCardPaymentLink({
                impalaMerchantId: process.env.MAM_LAKA_USERNAME!,
                currency: ad.fiat.symbol as MamlakaCurrencyEnum,
                amount: amount.toString(),
                externalId,
                callbackUrl,
                redirectUrl: process.env.MAM_LAKA_REDIRECT_URL!,
              })
              if (!response || response.error)
                throw new Error('Failed to initiate card payment')

              await context.prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                  paymentSecureId: response.sid,
                  paymentUrl: response.paymentUrl,
                },
              })
              success = !response.error
              message = response.message
              break
            }

            case 'wallet': {
              const receiverWallet = await context.prisma.fiatWallet.findFirst({
                where: { userId: receiver.id },
              })
              if (!receiverWallet || receiverWallet.balance < amount)
                throw new Error('Insufficient balance in receiver wallet')

              await context.prisma.fiatWallet.update({
                where: { id: receiverWallet.id },
                data: { balance: receiverWallet.balance - amount },
              })
              success = true
              message = 'Transaction completed successfully'
              break
            }

            default:
              throw new Error('Unsupported payment method')
          }

          return { success, message, transaction }
        } catch (error: any) {
          console.error(
            'Failed to process payment:',
            error.message,
            error.stack,
          )
          throw new GraphQLError('Unexpected error occurred', {
            extensions: {
              code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
              http: { status: 500 },
            },
          })
        }
      },
    })

    t.field('updateTransaction', {
      type: 'Transaction',
      args: {
        where: arg({
          type: 'TransactionWhereUniqueInput',
        }),
        data: arg({
          type: 'TransactionUpdateInput',
        }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where, data } = removeEmpty(args)

        try {
          return await prisma.transaction.update({
            where,
            data,
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.field('deleteTransaction', {
      type: 'Transaction',
      args: {
        where: arg({
          type: 'TransactionWhereUniqueInput',
        }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where } = removeEmpty(args)

        try {
          return await prisma.transaction.delete({
            where,
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.field('notifyTransaction', {
      type: 'Transaction',
      args: {
        where: arg({
          type: 'TransactionWhereUniqueInput',
        }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where } = removeEmpty(args)

        let transaction
        try {
          transaction = await prisma.transaction.findUnique({
            where,
            include: {
              receiver: {
                select: {
                  phone: true,
                  firstName: true,
                  lastName: true,
                },
              },
              ad: {
                select: {
                  advertiser: {
                    select: {
                      phone: true,
                    },
                  },
                },
              },
              coin: {
                select: {
                  symbol: true,
                },
              },
              fiat: {
                select: {
                  symbol: true,
                },
              },
            },
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }

        if (!transaction) {
          throw new GraphQLError('Transaction not found', {
            extensions: {
              code: ApolloServerErrorCode.BAD_USER_INPUT,
              http: {
                status: 404,
              },
            },
          })
        }

        try {
          let { amount, fiat } = transaction

          let name =
            `${transaction.receiver.firstName} ${transaction.receiver.lastName}`.trim()

          name = name ? name : transaction.phone

          const message = `${name}, has sent you ${fiat.symbol}. ${amount}  Login to your account and send them ${transaction.quantity} ${transaction.coin.symbol} to complete the transaction.`

          // let smsResponse = await sendSMS(
          //   process.env.AFRICA_TALKING_NOW_KEY!,
          //   process.env.AFRICA_TALKING_NOW_USERNAME!,
          //   [transaction.ad.advertiser.phone],
          //   message,
          // )

          let smsResponse = await sendSMS({
            phone: `+${transaction.ad.advertiser.phone}`,
            message: message,
          })

          console.log({ smsResponse })

          return transaction
        } catch (error: any) {
          console.error('Failed to send notification', error)

          throw new GraphQLError('Failed to send notification', {
            extensions: {
              code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
              http: {
                status: 500,
              },
            },
          })
        }
      },
    })
  },
})
