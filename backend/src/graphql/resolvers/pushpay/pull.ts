import { GraphQLError } from 'graphql'
import { arg, extendType, nonNull } from 'nexus'
import { handlePrismaError, removeEmpty } from '../../helper'
import {
  formatPhoneNumberWithCountryCode,
  generateInvoiceNumber,
  humanizeAmounts,
  randomUser,
  sendEmail,
  sendSMS,
} from '../../../utils'
import { HdWallet } from '../../../utils/crypto'
import {
  TransactionDirection,
  TransactionInfo,
  TransactionStatus,
  TransactionType,
} from 'nexus-prisma'
import { pushLink, PushLinkType } from '../../../utils/generateLink'
import { formatDate } from '../../../utils'
import { convertCurrencyOrCrypto } from '../../../utils/currencyApi/converter'
import { Notification } from '../../../utils/notification'

export const PushPayPullQuery = extendType({
  type: 'Query',
  definition(_t) {},
})

export const PushPayPullMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('payPull', {
      type: 'PushPayResponse',
      description: 'User to request for a payment',
      args: {
        data: nonNull(arg({ type: 'PushPayPullWhereInput' })),
      },
      resolve: async (_, args, { prisma, user, req }) => {
        const { data } = removeEmpty(args)
        let { phone, amount, name, currency, email, description, token } = data

        const formattedPhone = formatPhoneNumberWithCountryCode(phone)

        const method = data.method as PushLinkType
        if (!method) {
          throw new GraphQLError('Method is required.', {
            extensions: {
              message: 'METHOD_FIELD_REQUIRED',
            },
          })
        }

        if (!user) {
          throw new GraphQLError(
            'Unauthorized!. You are not allowed to access this page.',
            {
              extensions: {
                message: 'UNAUTHORIZED',
              },
            },
          )
        }
        let HOST_URI = `https://${req.hostname?.replaceAll(
          'api.',
          'app.',
        )}/transfer2?isPullModal=true`

        //who is supposed to send the money --> check if the the sender by phone or email exists
        let sender = await prisma.user.findFirst({
          where: { phone: formattedPhone },
        })

        let senderCrypto, senderWallet, senderCryptoAccount
        // if not, create a new user=>wallet=>account
        if (!sender) {
          try {
            const username = randomUser()
            sender = await prisma.user.create({
              data: {
                phone: formattedPhone,
                isActive: false,
                username,
              },
            })
          } catch (error: any) {
            return handlePrismaError(error)
          }

          //TODO: Add fiat dynamically not KES by default
          try {
            senderWallet = await prisma.fiatWallet.create({
              data: {
                user: { connect: { id: sender.id } },
                balance: 0,
                fiat: { connect: { symbol: 'KES' } },
              },
            })
            // Create Cryto Account
            const cryptoWalletData = new HdWallet().create()

            senderCrypto = await prisma.cryptoWallet.create({
              data: {
                userId: sender.id,
                networkId: 1,
                mnemonic: cryptoWalletData.mnemonic?.phrase!,
              },
            })

            senderCryptoAccount = await prisma.cryptoAccount.create({
              data: {
                cryptoWalletId: senderCrypto.id,
                address: cryptoWalletData.address!,
                privateKey: cryptoWalletData.privateKey!,
              },
            })
          } catch (error: any) {
            return handlePrismaError(error)
          }
        } else {
          // if sender exists, get the walletId and accountId
          senderWallet = await prisma.fiatWallet.findFirst({
            where: { userId: sender.id },
            include: {
              fiat: true,
            },
          })

          senderCrypto = await prisma.cryptoWallet.findFirst({
            where: { userId: sender.id },
          })

          senderCryptoAccount = await prisma.cryptoAccount.findFirst({
            where: { cryptoWalletId: senderCrypto!.id },
          })
        }

        // If exists, get the walletId and accountId

        // the user claiming

        // Get the reciver infromastion
        const userWallet = await prisma.fiatWallet.findFirst({
          where: { userId: user!.id },
          include: {
            fiat: true,
          },
        })

        const userCrypto = await prisma.cryptoWallet.findFirst({
          where: { userId: user!.id },
        })

        const userCryptoAccount = await prisma.cryptoAccount.findFirst({
          where: { cryptoWalletId: userCrypto!.id },
        })

        if (!userWallet || !userCrypto || !userCryptoAccount) {
          throw new GraphQLError('Your wallet not found', {
            extensions: {
              message: 'USER_WALLET_NOT_FOUND',
            },
          })
        }

        if (!senderWallet || !senderCrypto || !senderCryptoAccount) {
          throw new GraphQLError('Sender wallet not found', {
            extensions: {
              message: 'SENDER_WALLET_NOT_FOUND',
            },
          })
        }

        if (method === 'wallet') {
          if (!currency) {
            currency = userWallet.fiat.symbol
          }

          // Convert amount from USD to the sender's fiat currency
          let convertedUserAmount = data.amount
          if (userWallet.fiat.symbol !== 'USD') {
            const {
              data: { value },
            } = await convertCurrencyOrCrypto({
              base_currency: 'USD',
              currency: userWallet.fiat.symbol,
              value: data.amount,
            })
            console.log('convertedAmount', value)

            convertedUserAmount = value
          }

          //TODO: should fee be in usd or fiat
          // check if the user has enount crypto wallet depending on the amount they have request
          const fee = parseFloat(convertedUserAmount) * 0.01 // Calculate 1% of the amount
          console.log('pull fee', fee)
          const totalAmount = parseFloat(convertedUserAmount) + fee
          console.log('pull total amount', totalAmount)

          //TODO: send fee to cashier

          let senderFiat = await prisma.fiat.findFirst({
            where: { id: senderWallet.fiatId },
          })
          if (!senderFiat) {
            throw new GraphQLError('FiatWallet not found')
          }
          // If the sender's wallet is in a different currency, convert the amount
          let convertedTotalAmount = totalAmount
          if (senderFiat.symbol !== userWallet.fiat.symbol) {
            const {
              data: { value },
            } = await convertCurrencyOrCrypto({
              base_currency: userWallet.fiat.symbol,
              currency: senderFiat.symbol,
              value: totalAmount.toString(),
            })
            console.log('total amount conversion', value)

            convertedTotalAmount = value
          }

          // depending of the method of sending
          let pullLink = ''
          let senderMessage = ''
          let receiverMessage = ''

          try {
            let senderInvoiceNumber = generateInvoiceNumber()

            // create sender transaction
            await prisma.fiatTransaction.create({
              data: {
                fiat: {
                  connect: { id: senderWallet!.fiatId },
                },
                amount: parseFloat(convertedTotalAmount.toString()),
                user: {
                  connect: { id: sender!.id },
                },
                narations: description || 'Payment Request',
                type: TransactionType.members[7],
                status: TransactionStatus.members[0],
                invoiceNumber: senderInvoiceNumber,
                phone: user.phone,
                direction: TransactionDirection.members[1],
                transactionInfo: TransactionInfo.members[0],
              },
            })

            let receiverInvoiceNumber = generateInvoiceNumber()

            // create pull link for the sender of the funds
            pullLink = await pushLink({
              host: HOST_URI,
              senderPhone: formattedPhone,
              receiverPhone: user.phone!,
              type: PushLinkType.WALLET,
              receiverInvoiceId: receiverInvoiceNumber,
              senderInvoiceId: senderInvoiceNumber,
            })

            // send sms to the sender
            senderMessage = `Hi ${name ? name : `+${formattedPhone}`},
          ${senderInvoiceNumber}. ${
              user.firstName && user.lastName
                ? user.firstName + ' ' + user.lastName
                : '+' + user.phone
            } has requested a payment of 
              ${amount} USD,
              at ${formatDate(new Date().toISOString())} EAT.
          Make the payment with the following request link, ${pullLink}.`

            // Save the transaction
            // sender
            try {
              await sendSMS({
                phone: `+${formattedPhone}`,
                message: senderMessage,
              })
            } catch (err) {
              throw new GraphQLError('Failed to send sms', {
                extensions: {
                  message: 'FAILED_TO_SEND_SMS',
                },
              })
            }

            // Try to send the pulllink via email too if user has email updated
            if (sender.email) {
              try {
                await sendEmail(
                  sender.email,
                  'Dollar App PushPay Pull Request Link',
                  senderMessage,
                )
                console.log(`Pulllink email sent to ${sender.email}`)
              } catch (err: any) {
                console.error(
                  `Sending Pulllink email to ${sender.email} failed:`,
                  err.message,
                )
                // Continue the flow even if the email sending fails
              }
            }

            // Sender InApp Notification
            new Notification(
              sender?.id!,
              '',
              'Pull Notification',
              { message: senderMessage },
              'Unread',
              'Transaction',
              'InApp',
            ).sendInAppNotification()

            // Receiver Message
            receiverMessage = `Hi ${
              user.firstName && user.lastName
                ? user.firstName + ' ' + user.lastName
                : '+' + user.phone
            },
          ${receiverInvoiceNumber}. You have requested ${
              sender.firstName && sender.lastName
                ? sender.firstName + ' ' + sender.lastName
                : '+' + sender.phone
            } a payment of ${amount} USD at ${formatDate(
              new Date().toISOString(),
            )}. Please await release by the other party.`

            // create receiver transaction
            await prisma.fiatTransaction.create({
              data: {
                fiat: {
                  connect: { id: userWallet!.fiatId },
                },
                amount: parseFloat(convertedUserAmount),
                user: {
                  connect: { id: user!.id },
                },
                narations: receiverMessage,
                type: TransactionType.members[7],
                status: TransactionStatus.members[0],
                invoiceNumber: receiverInvoiceNumber,
                phone: sender.phone,
                transactionInfo: TransactionInfo.members[0],
              },
            })

            // notifiy the receiver
            try {
              await sendSMS({
                phone: `+${user!.phone}`,
                message: receiverMessage,
              })
            } catch (err) {
              throw new GraphQLError('Failed to send SMS', {
                extensions: {
                  message: 'FAILED_TO_SEND_SMS',
                },
              })
            }

            // Try to send the pulllink via email too if user has email updated
            if (user!.email) {
              try {
                await sendEmail(
                  user!.email,
                  'Dollar App PushPay Pull Request Link',
                  receiverMessage,
                )
                console.log(`Pulllink email sent to ${user!.email}`)
              } catch (err: any) {
                console.error(
                  `Sending Pulllink email to ${user!.email} failed:`,
                  err.message,
                )
                // Continue the flow even if the email sending fails
              }
            }

            // Receiver InApp Notification
            new Notification(
              user?.id!,
              '',
              'Pull Notification',
              { message: receiverMessage },
              'Unread',
              'Transaction',
              'InApp',
            ).sendInAppNotification()
          } catch (error: any) {
            throw new GraphQLError('Error sending pull request', {
              extensions: {
                message: 'ERROR_SENDING_PULL_REQUEST',
              },
            })
          }
          return {
            message: senderMessage,
            name: name,
            phone: sender.phone,
            amount: amount,
            email: sender.email ? sender.email : email,
            link: pullLink,
          }
        }

        if (method === 'crypto') {
          // depending of the method of sending
          let pullLink = ''
          let senderMessage = ''
          let receiverMessage = ''

          if (!token) {
            throw new GraphQLError('Token not provided', {
              extensions: {
                message: 'TOKEN_NOT_PROVIDED',
              },
            })
          }

          try {
            let senderInvoiceNumber = generateInvoiceNumber()

            // TODO: currency conversations  -->  TODO: tomorrow
            await prisma.fiatTransaction.create({
              data: {
                fiat: {
                  connect: { id: senderWallet!.fiatId },
                },
                amount: parseFloat(amount),
                user: {
                  connect: { id: sender!.id },
                },
                narations: description || 'Payment Request',
                type: TransactionType.members[7],
                status: TransactionStatus.members[1],
                invoiceNumber: senderInvoiceNumber,
                transactionInfo: TransactionInfo.members[0],
              },
            })
            // send sms to the sender

            senderMessage = `Hi ${name ? name : `+${sender.phone}`},
                  ${senderInvoiceNumber}. ${
              user.firstName && user.lastName
                ? user.firstName + ' ' + user.lastName
                : '+' + user.phone
            } has requested a payment of ${humanizeAmounts(
              amount,
              currency.toUpperCase(),
            )} at ${formatDate(new Date().toISOString())} EAT.
                  Make the payment with the following request link, ${pullLink}.`
            // Save the transaction
            // sender
            try {
              await sendSMS({
                phone: `+${sender!.phone}`,
                message: senderMessage,
              })
            } catch (err) {
              throw new GraphQLError('Failed to send sms', {
                extensions: {
                  message: 'FAILED_TO_SEND_SMS',
                },
              })
            }

            // Try to send the pulllink via email too if user has email updated
            if (sender.email) {
              try {
                await sendEmail(
                  sender.email,
                  'Dollar App PushPay Pull Request Link',
                  senderMessage,
                )
                console.log(`Pulllink email sent to ${sender.email}`)
              } catch (err: any) {
                console.error(
                  `Sending Pulllink email to ${sender.email} failed:`,
                  err.message,
                )
                // Continue the flow even if the email sending fails
              }
            }

            let receiverInvoiceNumber = generateInvoiceNumber()

            // create pull link for the receiver
            pullLink = await pushLink({
              host: HOST_URI,
              senderPhone: user.phone!,
              type: PushLinkType.CRYPTO,
              receiverPhone: sender.phone!,
              receiverInvoiceId: receiverInvoiceNumber,
              senderInvoiceId: senderInvoiceNumber,
              token: currency ? currency : 'KES',
            })

            // Receiver Message
            receiverMessage = `Hi ${
              user.firstName && user.lastName
                ? user.firstName + ' ' + user.lastName
                : '+' + user.phone
            },
                  ${receiverInvoiceNumber}. You have requested ${
              sender.firstName && sender.lastName
                ? sender.firstName + ' ' + sender.lastName
                : '+' + sender.phone
            } a payment of ${humanizeAmounts(
              amount,
              currency.toUpperCase(),
            )} at ${formatDate(new Date().toISOString())} EAT.
                  This is the payment link, ${pullLink}`

            console.log('receiverMessage', receiverMessage)

            await prisma.fiatTransaction.create({
              data: {
                fiat: {
                  connect: { id: userWallet!.fiatId },
                },
                amount: parseFloat(amount),
                user: {
                  connect: { id: user!.id },
                },
                narations: receiverMessage,
                type: TransactionType.members[7],
                status: TransactionStatus.members[1],
                invoiceNumber: receiverInvoiceNumber,
                transactionInfo: TransactionInfo.members[0],
              },
            })

            // notifiy the receiver
            try {
              await sendSMS({
                phone: `+${user!.phone}`,
                message: receiverMessage,
              })
            } catch (err) {
              throw new GraphQLError('Failed to send sms', {
                extensions: {
                  message: 'FAILED_TO_SEND_SMS',
                },
              })
            }

            // Try to send the pulllink via email too if user has email updated
            if (user!.email) {
              try {
                await sendEmail(
                  user!.email,
                  'Dollar App PushPay Pull Request Link',
                  receiverMessage,
                )
                console.log(`Pulllink email sent to ${user!.email}`)
              } catch (err: any) {
                console.error(
                  `Sending Pulllink email to ${user!.email} failed:`,
                  err.message,
                )
                // Continue the flow even if the email sending fails
              }
            }
          } catch (error) {
            console.log('Check the Error: ', error)
            throw new GraphQLError('Error sending token', {
              extensions: {
                message: 'ERROR_SENDING_TOKEN',
              },
            })
          }
        }
        return {
          name: name,
          phone: sender.phone,
          amount: amount,
          email: sender.email ? sender.email : email,
        }
      },
    })
  },
})
