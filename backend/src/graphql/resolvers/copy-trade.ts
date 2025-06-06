import { arg, extendType, intArg, nonNull } from 'nexus'
import { handlePrismaError, removeEmpty } from '../helper'
import { GraphQLError } from 'graphql'
import { ethers } from 'ethers'
import { walletWithProvider } from './../../utils/erc-wallet'
import { getFees } from './../../utils/fees'
import axios from 'axios'
import { Notification } from '../../utils/notification'

export const CopyTradeQuery = extendType({
  type: 'Query',
  definition: (t) => {
    t.list.field('copyTrades', {
      type: 'CopyTrade',
      args: {
        take: intArg(),
        skip: intArg(),
        orderBy: arg({
          type: 'CopyTradeWhereOrderByInput',
        }),
      },
      resolve: async (_root, args, { prisma }) => {
        const { where, take, skip, orderBy } = removeEmpty(args)
        try {
          return await prisma.copyTrade.findMany({
            where,
            take,
            skip,
            orderBy,
            include: {
              shiller: true,
              user: true,
              TradeInformation: true,
            },
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.field('tradingFees', {
      type: 'TradingFee',
      args: {},
      resolve: async (_root, _args, _ctx) => {
        try {
          return await getFees()
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
    t.list.field('myCopyTrades', {
      type: 'CopyTrade',
      args: {
        take: intArg(),
        skip: intArg(),
        orderBy: arg({
          type: 'CopyTradeWhereOrderByInput',
        }),
        where: arg({
          type: 'CopyStatusInput',
        }),
      },
      resolve: async (_root, args, { prisma, user }) => {
        const { where, take, skip, orderBy } = removeEmpty(args)
        try {
          return await prisma.copyTrade.findMany({
            where: {
              userId: user?.id,
              ...where,
            },
            take,
            skip,
            orderBy,
            include: {
              shiller: true,
              user: true,
              TradeInformation: true,
            },
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    }),
      //Update my trades based on status
      t.nonNull.list.nonNull.field('shillers', {
        type: 'Shill',
        args: {
          take: intArg(),
          skip: intArg(),
          where: arg({
            type: 'ShillWhereOrderByInput',
          }),
        },
        resolve: async (_root, args, { prisma }) => {
          const { take, skip } = removeEmpty(args)
          try {
            return await prisma.shill.findMany({
              take,
              skip,
            })
          } catch (error: any) {
            return handlePrismaError(error)
          }
        },
      })
  },
})

export const CopyTradeMutation = extendType({
  type: 'Mutation',
  definition: (t) => {
    t.field('copyTheTrader', {
      type: 'CopyTradeResponse',
      description: 'Copy the profitable trader',
      args: {
        data: nonNull(arg({ type: 'CopyTradeWhereInput' })),
      },

      resolve: async (_root, args, { prisma, user }) => {
        const { data } = removeEmpty(args)

        // check if the token address is valid
        if (!ethers.isAddress(data.token)) {
          throw new GraphQLError(
            'Invalid token address. Valid should e.g 0x1212....abdisx',
            {
              extensions: {
                message: 'INVALID_TOKEN_ADDRESS',
              },
            },
          )
        }

        // transfer crypto from user to trader
        const cyrptoWallet = await prisma.cryptoWallet.findFirst({
          where: {
            userId: user?.id,
          },
        })

        if (!cyrptoWallet) {
          throw new GraphQLError(
            "You don't have a wallet. please contact customer care ...",
            {
              extensions: {
                message: 'WALLET_NOT_FOUND',
              },
            },
          )
        }

        // Fetch the user wallet
        const testnet =
          process.env.BLOCKCHAIN_NETWORK === 'testnet' ? true : false
        const { ercWrapper, wallet } = await walletWithProvider(
          testnet,
          cyrptoWallet.mnemonic,
        )

        if (!wallet || !ercWrapper) {
          throw new GraphQLError('Error getting user wallet information', {
            extensions: {
              message: 'WALLET_NOT_FOUND',
            },
          })
        }

        const { amount, leverage, traderId, period } = data

        // Fetch the Shiller/Trader Info
        let shiller = (await prisma.shill.findFirst({
          where: {
            id: traderId,
          },
          include: {
            CopyTrade: true,
            trades: true,
          },
        })) as any

        console.log({ shiller })
        //Add notification utility
        //Add exchange utility
        //Add trade functionality
        //Monitoring trade utility
        //Add trade history utility

        // TODO Refactor for Reverse(-Ve) Testing
        if (!shiller) {
          throw new GraphQLError('Trader not found', {
            extensions: {
              message: 'TRADER_NOT_FOUND',
            },
          })
        }
        // Fetch balance for the token
        const balance = await ercWrapper.getTokenBalance(data.token)
        console.log({ balance })

        // Check if user has enough balance
        if (parseFloat(balance) < parseFloat(data.amount)) {
          throw new GraphQLError('Insufficient balance', {
            extensions: {
              message: 'INSUFFICIENT_BALANCE',
            },
          })
        }

        // transfer the amount to the vault / Wallet Address

        // PARAMS
        // const _txParams = {
        //   to: '0x85f19Bf5f3F14f0890249003685cfaDCe7645519',
        //   amount: data.amount,
        //   token: data.token,
        //   isTestnet: testnet,
        // }

        // const { message, status, transaction } = await ercWrapper.send(
        //   _txParams.to,
        //   _txParams.amount,
        //   _txParams.token,
        //   _txParams.isTestnet,
        // )

        // console.log({ message, status, transaction })

        // const { message, status } = await erc20Wrapper.deposit(
        //   traderId,
        //   token,
        //   amount.toString(),
        //   user?.phone!,
        //   leverage,
        //   user?.id!,
        //   period,
        //   wallet.address,
        // )

        // TODO Refactor for Reverse(-Ve) Testing
        // if (status !== 'success' || !transaction) {
        //   throw new GraphQLError(message, {
        //     extensions: {
        //       message: 'TRANSACTION_FAILED',
        //       copyTrade: null,
        //     },
        //   })
        // }

        // save the copy trade & Link copyTrade to Trade Group
        const copyTrade = await prisma.copyTrade
          .create({
            data: {
              period: Number(data.period),
              amount: Number(data.amount),
              leverage: parseInt(data.leverage, 10),
              user: {
                connect: {
                  id: user?.id,
                },
              },
              shiller: {
                connect: {
                  id: shiller.id,
                },
              },
            },
          })
          .then((res) => {
            return res
          })
          .catch((error) => {
            console.error(error)
            return error
          })

        // console.log({ copyTrade, shiller, transaction })

        // NOTIFICATIONS
        const TgMessage = `\n Copy Trade ID: ${
          copyTrade.id
        } \n\n Copy Trade Info For ${user?.firstName || ''} ${
          user?.lastName || ''
        } - ${user?.id}.\n\n Trader Details: ${shiller?.name}- ${
          shiller?.id
        } \n\n Amount: ${amount} \n Leverage: ${leverage} \n Lock Period ${period} days.`
        const smsMessage = `\n${user?.firstName || ''} ${
          user?.lastName || ''
        } Your Copy Trade has been received by DollarsApp Trading Desk. Waiting Activation Signals. \nCopy Trade ID: ${
          copyTrade.id
        } \nTrade Details: \nTrader: ${
          shiller.name
        } \t Amount: ${amount} \t Leverage: ${leverage} \t Lock Period: ${period} days. \tAt ${new Date().toLocaleString(
          'en-GB',
          {
            timeZone: user?.timezone || 'Africa/Nairobi',
          },
        )} \nThank you for trading with DollarApp`

        const fetchImage = async (url: string) => {
          try {
            const response = await axios.get(url, {
              responseType: 'arraybuffer',
            })
            return Buffer.from(response.data, 'binary')
          } catch (error) {
            console.error(error)
            return null
          }
        }

        const img = await fetchImage(shiller.photo)

        new Notification(
          user!.id,
          '',
          'Copy Trade has been received by DollarsApp Trading Desk',
          {
            message: smsMessage,
          },
          'Sent',
          'Trade',
          'SMS',
        ).sendSMSNotification(user?.phone!)

        new Notification(
          user!.id,
          '',
          'Copy Trade has been received by DollarsApp Trading Desk',
          {
            message: smsMessage,
            additionalData: {
              copyTradeId: copyTrade.id,
            },
          },
          'Unread',
          'Trade',
          'InApp',
        ).sendInAppNotification()

        new Notification(
          user!.id,
          '',
          'Copy Trade has been received by DollarsApp Trading Desk',
          {
            message: smsMessage,
            additionalData: {
              copyTradeId: copyTrade.id,
            },
          },
          'Sent',
          'Trade',
          'Email',
        ).sendEmailNotification()

        new Notification(
          user!.id,
          '',
          'Copy Trade has been made',
          {
            message: TgMessage,
            additionalData: {},
          },
          'Sent',
          'Trade',
          'Telegram',
        ).sendTelegramNotification(img!)

        return {
          message: 'Trade copied successfully',
          copyTrade: copyTrade,
        }
      },
    })
  },
})
