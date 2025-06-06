import { TransactionType } from '@prisma/client'
import { GraphQLError } from 'graphql'
import { arg, extendType, intArg, nonNull } from 'nexus'
import { handlePrismaError, removeEmpty } from '../helper'
import {
  MamlakaCurrencyEnum,
  MamlakaWrapper,
  formatDate,
  formatNumber,
  formatPhoneNumberWithCountryCode,
  generateInvoiceNumber,
  roundToMaxDecimals,
  sendEmail,
  sendSMS,
} from './../../utils'
import {
  TransactionDirection,
  TransactionStatus,
  TransactionInfo,
} from 'nexus-prisma'

import { TransferMethod } from '@prisma/client'

import {
  allowedTokens,
  erc20Wrapper,
  getBNBCurrentPriceInUSD,
  walletWithProvider,
} from './../../utils/erc-wallet'
import { ethers } from 'ethers'
import { getAssetPrice } from './../../utils/coinMarketCap'
import { convertCurrencyOrCrypto } from '../../utils/currencyApi/converter'
import { Cryptocurrency } from '../../typings/coinmarket'

export const FiatWallletQuery = extendType({
  type: 'Query',
  definition: (t) => {
    t.field('fiatWallet', {
      type: 'FiatWallet',
      args: {},
      resolve: async (_, __, { prisma, user }) => {
        try {
          const wallet = await prisma.fiatWallet.findMany({
            where: { userId: user?.id! },
            orderBy: {
              createdAt: 'desc',
            },
          })

          if (!wallet) {
            throw new GraphQLError("You don't have wallet")
          }
          if (wallet.length === 0) {
            throw new GraphQLError("You don't have wallet")
          }

          return wallet[wallet.length - 1]
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
    t.field('getFiatTransaction', {
      type: 'FiatTransaction',
      args: {
        data: nonNull(arg({ type: 'GetFiatTransaction' })),
      },
      resolve: async (_, args, { prisma }) => {
        const { data } = removeEmpty(args)

        try {
          const transaction = await prisma.fiatTransaction.findUnique({
            where: {
              id: data.id,
            },
            include: {
              paymentLines: true,
              user: true,
              fiat: true,
            },
          })
          if (!transaction) {
            throw new GraphQLError('Transaction not found', {
              extensions: {
                message: 'TRANSACTION_NOT_FOUND',
              },
            })
          }
          return transaction
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    }),
      t.nonNull.list.nonNull.field('myCryptoWallet', {
        type: 'AllowedTokensResponse',
        args: {},
        resolve: async (_, __, { prisma, user }) => {
          try {
            // transfer crypto from user to trader
            const cyrptoWallet = await prisma.cryptoWallet.findFirst({
              where: {
                userId: user?.id,
              },
            })

            if (!cyrptoWallet) {
              throw new GraphQLError(
                "You don't have a wallet. please contact customer care",
                {
                  extensions: {
                    message: 'WALLET_NOT_FOUND',
                  },
                },
              )
            }
            // get the testnest
            const testnet =
              process.env.BLOCKCHAIN_NETWORK === 'testnet' ? true : false
            // check if the user has enount crypto wallet depending on the amount they have request
            const { ercWrapper, wallet } = await walletWithProvider(
              testnet,
              cyrptoWallet.mnemonic,
            )

            if (!wallet || !ercWrapper) {
              throw new GraphQLError(
                "You don't have a wallet. please contact customer care",
                {
                  extensions: {
                    message: 'WALLET_NOT_FOUND',
                  },
                },
              )
            }

            console.log('Wallet', wallet)

            const tokens = allowedTokens(testnet)

            // Fetch all token prices at once before iterating
            const priceMap = await Promise.all(
              tokens.map(async (token) => {
                const assetPrice = await getAssetPrice(token.symbol)
                return {
                  symbol: token.symbol,
                  info: assetPrice || {
                    name: token.symbol,
                    symbol: token.symbol,
                    circulating_supply: 0,
                    total_supply: 0,
                    max_supply: 0,
                    cmc_rank: 0,
                    price: 0,
                    volume_24h: 0,
                    market_cap: 0,
                    percent_change_1h: 0,
                    percent_change_24h: 0,
                    percent_change_7d: 0,
                    percent_change_30d: 0,
                  }, // Default values to match the full Cryptocurrency type
                }
              }),
            )

            // Convert to an easy lookup object
            const tokenPrices = priceMap.reduce((acc, { symbol, info }) => {
              acc[symbol] = info
              return acc
            }, {} as Record<string, Cryptocurrency>)

            // Get the BNB price in USD once to ensure consistency
            const singleBNBPriceInUsd =
              tokenPrices['BNB']?.price || (await getBNBCurrentPriceInUSD())

            // Loop through tokens and assign balances

            for (const token of tokens) {
              token.info = tokenPrices[token.symbol] // Use full asset price object

              if (token.symbol === 'BNB' || token.symbol === 'WBNB') {
                const balance = await ercWrapper.getEthBalance()
                token.balance = Number(balance).toString()
                token.amountInUsd = (
                  Number(balance) * singleBNBPriceInUsd
                ).toString()
              } else {
                const balance = await ercWrapper.getTokenBalance(token.address)
                token.balance = Number(balance).toString()
                token.amountInUsd = (
                  Number(balance) * tokenPrices[token.symbol]?.price || 0
                ).toString()
              }
            }

            return tokens
            // const tokens = allowedTokens(testnet)
            // // loop through the tokens and get the balance
            // for (let i = 0; i < tokens.length; i++) {
            //   const token = tokens[i]

            //   token.info = await getAssetPrice(token.symbol)
            //   if (token.symbol === 'BNB' || token.symbol === 'WBNB') {
            //     const balance = await ercWrapper.getEthBalance()
            //     token.balance = Number(balance).toString()
            //     const singleBNBPriceInUsd = await getBNBCurrentPriceInUSD()
            //     token.amountInUsd = (
            //       Number(balance) * singleBNBPriceInUsd
            //     ).toString()
            //     console.log(
            //       `token: ${token.symbol}, balance: ${balance}, tk: ${token.address}  Balance in USd: ${token.amountInUsd}`,
            //     )
            //   } else {
            //     const balance = await ercWrapper.getTokenBalance(token.address)
            //     token.balance = Number(balance).toString()
            //     token.amountInUsd = Number(balance).toString()
            //     console.log(
            //       `token: ${token.symbol}, balance: ${balance}, tk: ${token.address} Balance in USd: ${token.amountInUsd}`,
            //     )

            //     if (!['USDC', 'USDT'].includes(token.symbol)) {
            //       // TODO:  get how to calculate the token price tokens which are not stable tokens
            //       // TODO: Get the best way of gettting the usd value of the token in usd give the price of bnb in usd
            //       token.balance = Number(balance).toString()

            //       console.log(
            //         `token: ${token.symbol}, balance: ${balance}, tk: ${token.address} Balance in USd: ${token.amountInUsd}`,
            //       )
            //     }
            //   }
            // }

            // return tokens
          } catch (error: any) {
            return handlePrismaError(error)
          }
        },
      }),
      t.nonNull.list.nonNull.field('fiatTransactions', {
        type: 'FiatTransaction',
        args: {
          where: arg({
            type: 'FiatTransactionWhereInput',
          }),
          orderBy: arg({
            type: 'FiatTransactionOrderByInput',
          }),
          take: intArg(),
          skip: intArg(),
        },
        resolve: async (_, args, { prisma, user }) => {
          const { where, orderBy, take, skip } = removeEmpty(args)

          if (!user) {
            throw new GraphQLError('not authorized', {
              extensions: { code: 'USER_NOT_FOUND' },
            })
          }

          try {
            console.log(
              `CASHIER: ${user.userType?.toLowerCase()} === 'cashier'`,
            )
            if (user.userType?.toLowerCase() === 'cashier') {
              return await prisma.fiatTransaction.findMany({
                where: {
                  ...where,
                },
                take,
                skip,
                orderBy: {
                  createdAt: 'desc',
                },
                include: {
                  paymentLines: true,
                  user: true,
                  fiat: true,
                },
              })
            }

            return await prisma.fiatTransaction.findMany({
              where: {
                userId: user?.id!,
                ...where,
              },
              take,
              skip,
              orderBy: orderBy || { createdAt: 'desc' },
              include: {
                paymentLines: true,
                user: true,
                fiat: true,
              },
            })
          } catch (error: any) {
            return handlePrismaError(error)
          }
        },
      }),
      t.nonNull.list.nonNull.field('GetAllTransactions', {
        type: 'FiatTransaction',
        args: {
          where: arg({
            type: 'FiatTransactionWhereInput',
          }),
          orderBy: arg({
            type: 'FiatTransactionOrderByInput',
          }),
          take: intArg(),
          skip: intArg(),
        },
        resolve: async (_, args, { prisma, user }) => {
          const { where, orderBy, take, skip } = removeEmpty(args)

          if (!user) {
            throw new GraphQLError('not authorized', {
              extensions: { code: 'USER_NOT_FOUND' },
            })
          }

          try {
            return await prisma.fiatTransaction.findMany({
              where: {
                ...where,
              },
              take,
              skip,
              orderBy: orderBy || { createdAt: 'desc' },
              include: {
                paymentLines: true,
                user: true,
                fiat: true,
              },
            })
          } catch (error: any) {
            return handlePrismaError(error)
          }
        },
      })
  },
})

export const FiatWalletMutation = extendType({
  type: 'Mutation',
  definition: (t) => {
    t.field('loadFiatWalletWithMpesa', {
      type: 'Response',
      args: {
        data: nonNull(arg({ type: 'LoadFiatWalletMpesaInput' })),
      },
      resolve: async (_, args, { prisma, mamlakaSession, user }) => {
        const { data } = removeEmpty(args)
        let phone = formatPhoneNumberWithCountryCode(data.phone)
        const walletOwner = await prisma.user.findUnique({
          where: { id: user?.id },
        })
        if (!walletOwner) {
          throw new GraphQLError('User not found')
        }

        const wallet = await prisma.fiatWallet.findFirst({
          where: { userId: walletOwner.id },
        })

        if (!wallet) {
          throw new GraphQLError("You don't have wallet")
        }

        const mamlakaWrapper = new MamlakaWrapper(
          process.env.MAM_LAKA_BASE_URL! as string,
          process.env.MAM_LAKA_USERNAME! as string,
          mamlakaSession.session!,
        )

        // const host =
        //   process.env.NODE_ENV === 'development'
        //     ? process.env.BASE_PAYMENT_CALLBAK_URL!
        //     : `https://${req.get('host')}`
        const callbackUrl = `https://api.dollarapp.me/payments/mam-laka/load-fiat-wallet/callbackurl`

        console.log('Initiate Payment Callback URL: ', callbackUrl)

        try {
          const intiateMobilePayment =
            await mamlakaWrapper.initiateMobilePayment({
              amount: Number(data.amount),
              payerPhone: phone,
              callbackUrl: callbackUrl,
              externalId: 'DollarApp',
              currency: MamlakaCurrencyEnum.KES,
            })

          if (!intiateMobilePayment) {
            throw new GraphQLError(
              'Failed to initiate payment. Please try again.',
            )
          }
          if (intiateMobilePayment && !intiateMobilePayment.error) {
            await prisma.fiatTransaction.create({
              data: {
                fiat: { connect: { symbol: 'KES' } },
                user: {
                  connect: {
                    id: walletOwner.id,
                  },
                },
                amount: Number(data.amount),
                paymentSecureId: intiateMobilePayment.sid,
                type: TransactionType.Deposit,
                phone: phone,
                transactionInfo: TransactionInfo.members[1],
              },
            })
            return {
              msg: 'Payment initiated successfully. Please proceed to your phone to enter pin',
              status: 'success',
            }
          }
        } catch (error) {
          throw new GraphQLError(
            'Failed to initiate payment. Please try again.',
          )
        }

        return {
          msg: 'Failed to initiate payment. Please try again.',
          status: 'error',
        }
      },
    }),
      t.field('loadFiatWalletWithCard', {
        type: 'AuthResponse',
        args: {
          data: nonNull(arg({ type: 'LoadFiatWalletWithCardInput' })),
        },
        resolve: async (_, args, { prisma, req, mamlakaSession, user }) => {
          const { data } = removeEmpty(args)
          const userExist = await prisma.user.findFirst({
            where: { id: user?.id },
          })
          if (!userExist) {
            throw new GraphQLError('User not found')
          }
          const wallet = await prisma.fiatWallet.findFirst({
            where: { userId: userExist?.id! },
          })

          if (!wallet) {
            throw new GraphQLError("You don't have wallet")
          }

          const mamlakaWrapper = new MamlakaWrapper(
            process.env.MAM_LAKA_BASE_URL! as string,
            process.env.MAM_LAKA_USERNAME! as string,
            mamlakaSession.session!,
          )

          const host =
            process.env.NODE_ENV === 'development'
              ? process.env.BASE_PAYMENT_CALLBAK_URL!
              : `https://${req.get('host')}`
          const callbackUrl = `https://api.dollarapp.me/payments/mam-laka/load-fiat-wallet-with-card/callbackurl`

          console.log('Generate Card Payment Callback URL: ', callbackUrl)

          try {
            const generateCardPaymentLink =
              await mamlakaWrapper.generateCardPaymentLink({
                amount: data.amount,
                callbackUrl,
                impalaMerchantId: process.env.MAM_LAKA_USERNAME!,
                redirectUrl: `${host.replaceAll('api.', '')}/wallet`,
                externalId: 'DollarApp',
                currency: MamlakaCurrencyEnum.KES,
              })

            console.log('generateCardPaymentLink', generateCardPaymentLink)
            if (!generateCardPaymentLink) {
              throw new GraphQLError(
                'Failed to generate card payment link. Please try again.',
              )
            }
            if (generateCardPaymentLink && !generateCardPaymentLink.error) {
              await prisma.fiatTransaction.create({
                data: {
                  fiat: { connect: { symbol: 'KES' } },
                  user: {
                    connect: {
                      id: userExist?.id!,
                    },
                  },
                  amount: Number(data.amount),
                  paymentSecureId: generateCardPaymentLink.sid,
                  type: TransactionType.Deposit,
                  phone: userExist?.phone!,
                  transactionInfo: TransactionInfo.members[1],
                },
              })
              return {
                msg: generateCardPaymentLink.message,
                status: 'success',
                token: generateCardPaymentLink.paymentUrl,
              }
            }
          } catch (error) {
            throw new GraphQLError(
              'Failed to generate card payment link. Please try again.',
            )
          }
          return {
            msg: 'Failed to generate card payment link. Please try again.',
            status: 'error',
            token: '',
          }
        },
      })

    t.field('fiatWalletSendMoney', {
      type: 'Response',
      args: {
        data: nonNull(arg({ type: 'FiatWalletSendMoneyInput' })),
      },
      resolve: async (_, args, { prisma, user }) => {
        const { data } = removeEmpty(args)

        // Check if the user(sender wallet ->  current logged in user) has a wallet
        const sender = await prisma.user.findFirst({
          where: { id: user?.id },
        })
        if (!sender) {
          throw new GraphQLError('User Not Found', {
            extensions: { code: 'USER_NOT_FOUND' },
          })
        }

        // check that you are not sending to yourself
        if (sender.phone === formatPhoneNumberWithCountryCode(data.phone)) {
          throw new GraphQLError('You cannot send money to yourself', {
            extensions: { code: 'CANNOT_SEND_TO_SELF' },
          })
        }

        let message = ''

        // get sender wallet
        const senderWallet = await prisma.fiatWallet.findFirst({
          where: { userId: sender.id },
          include: {
            fiat: true,
          },
        })
        if (!senderWallet) {
          throw new GraphQLError('Sender has not Wallet', {
            extensions: {
              code: 'WALLET_NOT_FOUND',
            },
          })
        }
        // Check if the user(receiver wallet) has a wallet
        const receiver = await prisma.user.findFirst({
          where: { phone: formatPhoneNumberWithCountryCode(data.phone) },
        })

        if (!receiver) {
          throw new GraphQLError('Receiver Not Found', {
            extensions: { code: 'RECEIVER_NOT_FOUND' },
          })
        }

        if (!receiver.isActive) {
          throw new GraphQLError(
            'Receiving user has not activated his/her DollarApp account!',
            {
              extensions: { code: 'RECEIVER_NOT_ACTIVE' },
            },
          )
        }

        const receiverWallet = await prisma.fiatWallet.findFirst({
          where: { userId: receiver.id },
          include: {
            fiat: true,
          },
        })

        if (!receiverWallet) {
          throw new GraphQLError('Receiver has not wallet', {
            extensions: {
              code: 'WALLET_NOT_FOUND',
            },
          })
        }

        // Convert amount from USD to the sender's fiat currency
        let convertedSenderAmount = data.amount
        if (senderWallet.fiat.symbol !== 'USD') {
          const {
            data: { value },
          } = await convertCurrencyOrCrypto({
            base_currency: 'USD',
            currency: senderWallet.fiat.symbol,
            value: data.amount,
          })
          console.log('convertedAmount', value)

          convertedSenderAmount = value
        }

        // check it the sender has enough balance
        if (senderWallet.balance < Number(convertedSenderAmount)) {
          throw new GraphQLError('You have insufficient balance', {
            extensions: { code: 'INSUFFICIENT_BALANCE' },
          })
        }

        // Deduct from sender's balance in their local fiat currency
        let senderNewBalance =
          senderWallet.balance - parseFloat(convertedSenderAmount)

        // Deduct the amount from the sender wallet
        try {
          await prisma.fiatTransaction.create({
            data: {
              amount: Number(convertedSenderAmount),
              type: TransactionType.Transfer,
              fiatId: senderWallet.fiatId,
              userId: sender.id,
              phone: formatPhoneNumberWithCountryCode(receiver.phone!),
              status: TransactionStatus.members[1],
              direction: TransactionDirection.members[1],
              transactionInfo: TransactionInfo.members[1],
            },
          })

          await prisma.fiatWallet.update({
            where: { id: senderWallet.id },
            data: {
              balance: senderNewBalance,
            },
          })

          // Convert sender's new balance back to USD for the message
          let senderBalanceInUSD = senderNewBalance
          if (senderWallet.fiat.symbol !== 'USD') {
            const {
              data: { value },
            } = await convertCurrencyOrCrypto({
              base_currency: senderWallet.fiat.symbol,
              currency: 'USD',
              value: senderNewBalance.toString(),
            })
            console.log('balanceInUSD', value)

            senderBalanceInUSD = Number(value)
          }

          message = `You have sent USD ${
            data.amount
          } successfully to ${formatPhoneNumberWithCountryCode(
            receiver.phone!,
          )} at ${formatDate(
            new Date().toISOString(),
          )} EAT. Your new balance is USD.  ${senderBalanceInUSD}`

          await sendSMS({ phone: `+${sender.phone}`, message })
        } catch (error) {
          throw new GraphQLError(`Failed to send money to ${data.phone}`, {
            extensions: { code: 'FAILED_TO_DEDUCT_AMOUNT' },
          })
        }

        // Try to send the FiatWallet Transfer via email too if user has email updated
        if (sender!.email) {
          try {
            await sendEmail(
              sender!.email,
              'Dollar App FiatWallet Transfer',
              message,
            )
            console.log(`FiatWallet Transfer email sent to ${sender!.email}`)
          } catch (err: any) {
            console.error(
              `Sending FiatWallet Transfer email to ${sender!.email} failed:`,
              err.message,
            )
            // Continue the flow even if the email sending fails
          }
        }

        // Handle Receiver
        // Add the amount to the receiver wallet

        // If the receiver's wallet is in a different currency, convert the amount
        let convertedReceiverAmount = convertedSenderAmount
        if (receiverWallet.fiat.symbol !== senderWallet.fiat.symbol) {
          const {
            data: { value },
          } = await convertCurrencyOrCrypto({
            base_currency: senderWallet.fiat.symbol,
            currency: receiverWallet.fiat.symbol,
            value: convertedSenderAmount,
          })
          console.log('conversionForReceiver', value)

          convertedReceiverAmount = value
        }

        // Add to receiver's wallet balance in their local fiat currency
        let receiverNewBalance =
          receiverWallet.balance + parseFloat(convertedReceiverAmount)

        try {
          await prisma.fiatTransaction.create({
            data: {
              amount: Number(convertedReceiverAmount),
              type: TransactionType.Transfer,
              fiatId: receiverWallet.fiatId,
              userId: receiver.id,
              phone: formatPhoneNumberWithCountryCode(sender.phone!),
              status: TransactionStatus.members[1],
              transactionInfo: TransactionInfo.members[1],
            },
          })

          // add moeny to receiver wallet
          await prisma.fiatWallet.update({
            where: { id: receiverWallet.id },
            data: {
              balance: receiverNewBalance,
            },
          })

          // Convert receiver's new balance back to USD for the message
          let receiverBalanceInUSD = receiverNewBalance
          if (receiverWallet.fiat.symbol !== 'USD') {
            const {
              data: { value },
            } = await convertCurrencyOrCrypto({
              base_currency: receiverWallet.fiat.symbol,
              currency: 'USD',
              value: receiverNewBalance.toString(),
            })
            console.log('balanceForReceiver', value)

            receiverBalanceInUSD = Number(value)
          }

          message = `You have received USD ${
            data.amount
          } successfully. From  ${formatPhoneNumberWithCountryCode(
            sender.phone!,
          )} at ${formatDate(
            new Date().toISOString(),
          )} EAT. Your new balance is  USD. ${receiverBalanceInUSD}`

          // Receiver Message
          await sendSMS({ phone: `+${receiver.phone}`, message })
        } catch (error) {
          throw new GraphQLError(`Failed to send money to ${data.phone}`, {
            extensions: { code: 'FAILED_TO_ADD_AMOUNT' },
          })
        }

        // Try to send the FiatWallet Transfer via email too if user has email updated
        if (receiver!.email) {
          try {
            await sendEmail(
              receiver!.email,
              'Dollar App FiatWallet Transfer',
              message,
            )
          } catch (err: any) {
            console.error(
              `Sending FiatWallet Transfer email to ${receiver!.email} failed:`,
              err.message,
            )
            // Continue the flow even if the email sending fails
          }
        }

        return {
          msg: 'Money sent successfully',
          status: 'success',
        }
      },
    }),
      t.field('withdrawCrypto', {
        type: 'WithdrawCryptoResult',
        description: 'Withdraw crypto tokens',
        args: {
          data: nonNull(arg({ type: 'WithdrawCryptoInput' })),
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

          // check if the user has enount crypto wallet depending on the amount they have request

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

          // Find token information
          const tokenInfo = allowedTokens(testnet).find(
            (t) => t.address.toLowerCase() === data.token.toLowerCase(),
          )

          if (!tokenInfo) {
            throw new GraphQLError('Token not supported', {
              extensions: { message: 'TOKEN_NOT_SUPPORTED' },
            })
          }

          const tokenSymbol = tokenInfo.symbol

          // Fetch and calculate token balances
          if (tokenSymbol === 'BNB' || tokenSymbol === 'WBNB') {
            const balance = await ercWrapper.getEthBalance()
            tokenInfo.balance = Number(balance).toString()

            const singleBNBPriceInUsd = await getBNBCurrentPriceInUSD()
            tokenInfo.amountInUsd = (
              Number(balance) * singleBNBPriceInUsd
            ).toString()

            console.log(
              `About to withdraw Token: ${tokenSymbol}, Balance: ${balance}, Balance in USD: ${tokenInfo.amountInUsd}`,
            )

            if (Number(balance) < Number(data.amount)) {
              throw new GraphQLError('Insufficient BNB balance', {
                extensions: { message: 'INSUFFICIENT_BALANCE' },
              })
            }
          } else {
            const balance = await ercWrapper.getTokenBalance(data.token)
            tokenInfo.balance = Number(balance).toString()

            if (Number(balance) < Number(data.amount)) {
              throw new GraphQLError('Insufficient token balance', {
                extensions: { message: 'INSUFFICIENT_BALANCE' },
              })
            }
          }

          // Calculate fees and net amount
          const amount = parseFloat(data.amount)
          const feePercentage = 0.01
          const fee = amount * feePercentage
          const netAmount = amount - fee
          const roundedAmount = roundToMaxDecimals(netAmount)

          if (netAmount <= 0) {
            throw new GraphQLError(
              'Amount is too small to process after deducting the fee.',
              {
                extensions: { message: 'INSUFFICIENT_AMOUNT' },
              },
            )
          }

          // Transfer the fee to the disbursement wallet
          // try {
          //   let iis_eth = false
          //   if (
          //     allowedTokens(testnet).findIndex(
          //       (token) => token.symbol === 'BNB' || token.symbol === 'TBNB',
          //     ) === -1
          //   ) {
          //     iis_eth = true
          //   }

          //   const feeTransferResult = await ercWrapper.send(
          //     process.env.DISBURSEMENT_WALLET_ADDRESS!,
          //     fee.toString(),
          //     data.token,
          //     iis_eth,
          //   )

          //   if (feeTransferResult.status !== 'success') {
          //     throw new Error(feeTransferResult.message)
          //   }
          // } catch (error) {
          //   throw new GraphQLError('Fee transfer failed', {
          //     extensions: {
          //       message: 'FEE_TRANSFER_FAILED',
          //     },
          //   })
          // }

          // Transfer the net amount to the recipient
          try {
            // let is_eth = false
            // if (
            //   data.token === 'BNB' ||
            //   allowedTokens(testnet).some(
            //     (token) =>
            //       token.symbol === 'BNB' && token.address === data.token,
            //   )
            // ) {
            //   is_eth = true

            let is_eth = false
            if (
              allowedTokens(testnet).findIndex(
                (token) => token.symbol === 'BNB' || token.symbol === 'TBNB',
              ) === -1
            ) {
              is_eth = true
            }
            const { message, status, transaction } = await ercWrapper.send(
              data.to,
              roundedAmount.toString(),
              data.token,
              is_eth,
            )
            if (status !== 'success' || !transaction) {
              throw new Error(message || 'Transaction failed')
            }

            console.log('Transaction receipt:', transaction)
            if (transaction.status !== 1) {
              throw new GraphQLError(
                'Withdraw Transaction failed or reverted',
                {
                  extensions: { message: 'WITHDRAW_TRANSACTION_FAILED' },
                },
              )
            }

            let withdrawTransaction

            try {
              withdrawTransaction = await prisma.cryptoTransaction.create({
                data: {
                  hash: transaction.hash,
                  blockNumber: transaction.blockNumber?.toString() || '',
                  timeStamp: new Date().toISOString(),
                  from: wallet.address,
                  to: data.to,
                  value: parseFloat(roundedAmount),
                  gas: transaction.gasUsed?.toString() || '',
                  gasPrice: transaction.gasPrice?.toString() || '',
                  fee: fee,
                  txreceipt_status: transaction.status.toString(),
                  tokenSymbol: tokenSymbol,
                  tokenAddress: data.token,
                  type: TransactionType.Withdrawal,
                  status: TransactionStatus.members[1],
                  transferMethod: TransferMethod.INTERNAL,
                  user: { connect: { id: user?.id! } },
                },
              })

              console.log('Withdraw Transaction:', withdrawTransaction)
            } catch (error) {
              console.error('Error saving transaction to DB:', error)
              throw new GraphQLError(
                'Transaction was successful but could not be recorded in the database.',
                {
                  extensions: { message: 'DATABASE_SAVE_ERROR' },
                },
              )
            }

            return {
              transaction: withdrawTransaction,
              response: {
                msg: 'Withdraw successful',
                status: 'success',
                fee: fee.toString(),
                netAmount: netAmount.toString(),
              },
            }
          } catch (error) {
            console.error('Error during transaction:', error)
            throw new GraphQLError('Transaction failed', {
              extensions: { message: 'TRANSACTION_FAILED' },
            })
          }
        },
      })
    t.field('swapTokens', {
      type: 'Response',
      description: 'Swap token for another token',
      args: {
        data: nonNull(arg({ type: 'SwapTokenInput' })),
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

        // check if the user has enount crypto wallet depending on the amount they have request

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
        // swap tokens

        const { message, status } = await erc20Wrapper.swapTokens(
          data.tokenIn,
          data.tokenOut,
          data.amountIn,
        )

        if (status !== 'success') {
          throw new GraphQLError(message, {
            extensions: {
              message: 'TRANSACTION_FAILED',
            },
          })
        }

        return {
          msg: 'transfer successfully',
          status: 'success',
        }
      },
    })

    // V1 - 0.0.1
    t.field('userRequestOnFiatWallet', {
      type: 'FiatTransaction',
      description: 'Mark a transaction as loaded wallet',
      args: {
        data: nonNull(arg({ type: 'WalletLoadWhereInput' })),
      },

      resolve: async (_root, args, { prisma, user }) => {
        const { data } = removeEmpty(args)

        // check if the token address is valid

        const { amount, phone, requestAction } = data

        let CURRENCY = 'KES'
        if (phone.startsWith('+254') || phone.startsWith('254')) {
          CURRENCY = 'KES'
        } else if (phone.startsWith('+255') || phone.startsWith('255')) {
          CURRENCY = 'TZS'
        } else if (phone.startsWith('+256') || phone.startsWith('256')) {
          CURRENCY = 'UGX'
        } else if (phone.startsWith('+250') || phone.startsWith('250')) {
          CURRENCY = 'RWF'
        }

        let message = ''

        const transaction = await prisma.fiatTransaction.create({
          data: {
            amount: Number(amount),
            phone: formatPhoneNumberWithCountryCode(phone),
            fiat: { connect: { symbol: CURRENCY } },
            user: { connect: { id: user?.id! } },
            extra_data: data.phone,
            type:
              requestAction === 'deposit'
                ? TransactionType.Deposit
                : TransactionType.Withdrawal,
            narations: 'Wallet Load',
            invoiceNumber: generateInvoiceNumber(),
            status: TransactionStatus.members[0],
            transactionInfo: TransactionInfo.members[1],
          },
        })

        message = `Your request to ${
          requestAction == 'deposit' ? 'load wallet' : 'withdrawal'
        } with ${CURRENCY} ${formatNumber(amount)} at ${formatDate(
          new Date().toISOString(),
        )} has been received. Please wait for confirmation, it may take upto 1 hour.`

        // send sms to the user
        try {
          ;({ phone: `+${user?.phone}`, message })
        } catch (error) {
          throw new GraphQLError('Failed to send SMS', {
            extensions: {
              message: 'FAILED_TO_SEND_SMS',
            },
          })
        }

        message = `Hi,
            ${user?.firstName} ${user?.firstName} has request to ${
          requestAction == 'deposit' ? 'load wallet' : 'withdrawal'
        } ${CURRENCY} ${formatNumber(amount)} at ${formatDate(
          new Date().toISOString(),
        )}. Please  process within 15 minutes.`

        // send the cashier an sms  and notification
        try {
          ;({ phone: `+${data.phone}`, message })
        } catch (error) {
          throw new GraphQLError('Failed to send SMS', {
            extensions: {
              message: 'FAILED_TO_SEND_SMS',
            },
          })
        }

        return transaction
      },
    }),
      t.field('adminMarkFiatWalletRequestAsCompleted', {
        type: 'FiatTransaction',
        description: 'Only Admin. Mark a transaction as loaded wallet',
        args: {
          data: nonNull(arg({ type: 'CompleteWalletLoadWhereInput' })),
        },
        resolve: async (_root, args, { prisma }) => {
          const { data } = removeEmpty(args)
          // get transactions by id
          let transaction = await prisma.fiatTransaction.findFirst({
            where: {
              id: data.id,
            },
            include: { fiat: true, user: true },
          })
          // if found update the transaction status to completed

          if (!transaction) {
            throw new GraphQLError('Transaction not found', {
              extensions: {
                message: 'TRANSACTION_NOT_FOUND',
              },
            })
          }

          // get user wallet
          const userWallet = await prisma.fiatWallet.findFirst({
            where: {
              userId: transaction.userId,
            },
          })

          if (!userWallet) {
            throw new GraphQLError('User wallet not found', {
              extensions: {
                message: 'WALLET_NOT_FOUND',
              },
            })
          }

          let message = ''

          // update  wallet balance depending on  deposit or withdrawal
          try {
            if (transaction.type === TransactionType.Deposit) {
              await prisma.fiatWallet.update({
                where: { id: userWallet.id },
                data: {
                  balance: userWallet.balance + transaction.amount,
                },
              })
            } else if (transaction.type === TransactionType.Withdrawal) {
              await prisma.fiatWallet.update({
                where: { id: userWallet.id },
                data: {
                  balance: userWallet.balance - transaction.amount,
                },
              })
            }
          } catch (error) {
            throw new GraphQLError('Failed to update wallet balance', {
              extensions: {
                message: 'FAILED_TO_UPDATE_WALLET_BALANCE',
              },
            })
          }

          try {
            transaction = await prisma.fiatTransaction.update({
              where: { id: transaction.id },
              data: {
                status: TransactionStatus.members[1],
              },

              include: {
                fiat: true,
                user: true,
              },
            })
          } catch (error) {
            throw new GraphQLError('Failed to update transaction status', {
              extensions: {
                message: 'FAILED_TO_UPDATE_TRANSACTION_STATUS',
              },
            })
          }

          message = `Your request to ${
            transaction.type == TransactionType.Deposit
              ? 'load wallet'
              : 'withdraw'
          }  ${transaction.fiat.symbol} ${formatNumber(
            transaction.amount,
          )} at ${formatDate(
            new Date().toISOString(),
          )} has been completed. Your new balance is ${formatNumber(
            userWallet.balance,
          )}`

          // send sms to user
          try {
            ;({ phone: `+${transaction.user.phone}`, message })
          } catch (error) {
            console.log('Error sending SMS', error)
            throw new GraphQLError('Failed to send SMS', {
              extensions: {
                message: 'FAILED_TO_SEND_SMS',
              },
            })
          }
          return transaction
        },
      })
  },
})
