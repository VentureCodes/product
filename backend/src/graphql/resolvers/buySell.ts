import { TransactionType } from '@prisma/client'
import { GraphQLError } from 'graphql'
import { arg, extendType, nonNull } from 'nexus'
import { removeEmpty } from '../helper'
import { TransactionStatus } from 'nexus-prisma'
import { generateInvoiceNumber } from '../../utils'
import { getTokenPrice } from '../../utils/coinMarketCap'
import {
  allowedTokens,
  walletWithPrivateKey,
  walletWithProvider,
} from '../../utils/erc-wallet'
import { convertCurrencyOrCrypto } from '../../utils/currencyApi/converter'
import { ethers } from 'ethers'
import { Notification } from '../../utils/notification'

export const BuySellMutation = extendType({
  type: 'Mutation',
  definition: (t) => {
    t.field('BuySell', {
      type: 'BuySellResponse',
      args: {
        data: nonNull(
          arg({
            type: 'BuySellWhereInput',
          }),
        ),
      },
      resolve: async (_, args, { prisma, user }) => {
        const { data } = removeEmpty(args)

        const { amount, token, type } = data

        const currentUser = await prisma.user.findFirst({
          where: {
            id: user?.id,
          },
          select: {
            id: true,
            phone: true,
            cryptoWallet: {
              select: {
                accounts: {
                  select: {
                    address: true,
                  },
                },
              },
            },
          },
        })

        const cryptoWallet = await prisma.cryptoWallet.findFirst({
          where: {
            userId: user?.id,
          },
        })

        const cryptoWalletAddress = await prisma.cryptoAccount.findFirst({
          where: {
            cryptoWalletId: cryptoWallet?.id,
          },
        })

        console.log({ currentUser, cryptoWallet, cryptoWalletAddress })

        if (!currentUser) {
          throw new GraphQLError('User Not Found', {
            extensions: { code: 'USER_NOT_FOUND' },
          })
        }

        //validate the transaction type to be buy or sell
        if (!['BUY', 'SELL'].includes(type.toUpperCase())) {
          throw new GraphQLError(
            'Invalid Transaction Type.  Allowed types are: BUY or SELL.',
            {
              extensions: { code: 'INVALID_TRANSACTION_TYPE' },
            },
          )
        }

        const currentUserFiatWallet = await prisma.fiatWallet.findFirst({
          where: {
            userId: currentUser.id,
          },
          include: {
            fiat: true,
          },
        })

        console.log('currentUserFiatWallet', currentUserFiatWallet?.balance)

        if (!currentUserFiatWallet) {
          throw new GraphQLError('Wallet Not Found', {
            extensions: { code: 'WALLET_NOT_FOUND' },
          })
        }

        const amountNumber = parseFloat(amount)
        // Convert the balance from KSH to USD before checking the balance
        const conversionResult = await convertCurrencyOrCrypto({
          base_currency: 'USD',
          value: amount, // the amount in KSH to convert
          currency: 'KES', // target currency (USD)
        })

        const kesAmount = conversionResult.data.value // the converted amount in USD

        console.log('kesAmount when buying token', kesAmount)

        try {
          const tokenInfo = allowedTokens().find(
            (t) => t.address.toLocaleLowerCase() === token.toLocaleLowerCase(),
          )

          if (!tokenInfo) {
            throw new GraphQLError('Token not supported', {
              extensions: {
                message: 'TOKEN_NOT_SUPPORTED',
              },
            })
          }

          // Get the token symbol
          const tokenSymbol = tokenInfo.symbol

          // Fetch the live price of the token using the token symbol
          const tokenData = await getTokenPrice(tokenSymbol)
          if (!tokenData || !tokenData.price) {
            throw new GraphQLError('Unable to fetch price for token', {
              extensions: { code: 'TOKEN_PRICE_NOT_FOUND' },
            })
          }

          const feePercentage = 0.01
          const buyFee = kesAmount * feePercentage
          const buyFeeUsd = amountNumber * feePercentage
          const price = parseFloat(tokenData.price.toString())
          const buyQuantity = amountNumber / price
          const totalBuyQuantity = buyQuantity + buyFeeUsd

          console.log('Buyquantity', buyQuantity)
          console.log('totalQuantity', totalBuyQuantity)
          console.log('price', price)
          console.log('fee', buyFee)

          const fiatWalletBalanceUsd = await convertCurrencyOrCrypto({
            base_currency: 'KES', // base currency (KES)
            value: currentUserFiatWallet.balance.toString(), // the amount in KSH to convert
            currency: 'USD', // target currency (USD)
          })

          if (fiatWalletBalanceUsd.data.value < totalBuyQuantity) {
            throw new GraphQLError('Insufficient Balance', {
              extensions: { code: 'INSUFFICIENT_BALANCE' },
            })
          }

          let invoiceNumber = generateInvoiceNumber()

          //BUY
          if (type.toUpperCase() === 'BUY') {
            try {
              currentUserFiatWallet.balance -= kesAmount + buyFee

              await prisma.fiatWallet.update({
                where: { id: currentUserFiatWallet.id },
                data: { balance: currentUserFiatWallet.balance },
              })

              const newFiatTxn = await prisma.fiatTransaction.create({
                data: {
                  amountUSD: totalBuyQuantity,
                  amount: kesAmount,
                  type: TransactionType.Buy,
                  user: { connect: { id: currentUser.id } },
                  fiat: { connect: { id: currentUserFiatWallet.fiatId } },
                  status: TransactionStatus.members[1],
                  invoiceNumber,
                },
              })

              console.log(newFiatTxn, 'newFiatTxn')

              // Disbursement Wallet Logic for BUY
              try {
                const disbursementPrivateKey =
                  process.env.DISBURSEMENT_WALLET_PRIVATE_KEY!

                if (!disbursementPrivateKey) {
                  throw new Error('DISBURSEMENT_PRIVATE_KEY is not set')
                }

                const testnet = process.env.BLOCKCHAIN_NETWORK === 'testnet'

                const { ercWrapper, wallet } = await walletWithPrivateKey(
                  testnet,
                  disbursementPrivateKey,
                )

                if (!wallet || !ercWrapper) {
                  throw new Error('Failed to initialize disbursement wallet')
                }

                console.log(
                  'Current User Crypto Wallet',
                  currentUser.cryptoWallet?.accounts,
                )

                const userWalletAddress =
                  currentUser?.cryptoWallet?.accounts?.address

                console.log('User Wallet Address', userWalletAddress)

                if (!userWalletAddress) {
                  throw new Error('User wallet address not found')
                }

                const transferResult = await ercWrapper.send(
                  cryptoWalletAddress!.address,
                  amountNumber.toFixed(6),
                  tokenInfo.address,
                  testnet,
                )

                console.log('transferResult', transferResult)

                if (transferResult.status !== 'success') {
                  throw new Error(
                    `Failed to transfer tokens to user: ${transferResult.message}`,
                  )
                }
              } catch (error: any) {
                console.error('Disbursement wallet error (BUY):', error.message)
              }

              const smsMessage = `You have successfully bought ${buyQuantity.toFixed(
                6,
              )} ${tokenSymbol}.
              Login to your account to view transaction details.`

              const inAppMessage = `You have successfully bought ${buyQuantity.toFixed(
                6,
              )} ${tokenSymbol}.
              `

              new Notification(
                currentUser!.id,
                '',
                'Buy Crypto Transaction',
                {
                  message: smsMessage,
                  additionalData: {
                    invoiceNumber,
                  },
                },
                'Sent',
                'Transaction',
                'SMS',
              ).sendSMSNotification(currentUser?.phone!)

              //inapp notification
              new Notification(
                currentUser!.id,
                '',
                'Buy Crypto Transaction',
                {
                  message: inAppMessage,
                  additionalData: {
                    invoiceNumber,
                  },
                },
                'Sent',
                'Transaction',
                'InApp',
              ).sendInAppNotification()
            } catch (error: any) {
              throw new GraphQLError(
                `Failed to process BUY transaction: ${error.message}`,
                {
                  extensions: { code: 'BUY_TRANSACTION_FAILED' },
                },
              )
            }
            return {
              amount: amountNumber.toString(),
              tokenSymbol,
              price: price.toString(),
              fee: buyFeeUsd.toFixed(6),
              quantity: buyQuantity.toFixed(6),
              totalQuantity: totalBuyQuantity.toFixed(6),
              invoiceNumber,
            }
          } else if (type.toUpperCase() === 'SELL') {
            // check if the token address is valid
            if (!ethers.isAddress(token)) {
              throw new GraphQLError(
                'Invalid token address. Valid should e.g 0x1212....abdisx',
                {
                  extensions: {
                    message: 'INVALID_TOKEN_ADDRESS',
                  },
                },
              )
            }
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

            //Check crypto wallet if it has enough balance
            const balance = await ercWrapper.getTokenBalance(token)

            console.log('BUYSELL BALANCE', balance)

            //Get the Sell Amount in USD
            const sellAmountUsd = price * amountNumber
            const sellFee = feePercentage * amountNumber

            const totalSellQuantity = sellAmountUsd + sellFee

            console.log('sellAmountUsd in USD', sellAmountUsd)
            console.log('TotalSellQuantity in USD', totalSellQuantity)

            // Check if user has enough balance
            if (parseFloat(balance) < amountNumber + sellFee) {
              throw new GraphQLError('Insufficient balance', {
                extensions: {
                  message: 'INSUFFICIENT_BALANCE',
                },
              })
            }

            try {
              const sellAmountKes = await convertCurrencyOrCrypto({
                base_currency: 'USD', // base currency (KES)
                value: amountNumber.toString(), // the amount in KSH to convert
                currency: 'KES', // target currency (USD)
              })

              currentUserFiatWallet.balance += sellAmountKes.data.value

              await prisma.fiatWallet.update({
                where: { id: currentUserFiatWallet.id },
                data: { balance: currentUserFiatWallet.balance },
              })

              await prisma.fiatTransaction.create({
                data: {
                  amountUSD: totalSellQuantity,
                  amount: amountNumber,
                  type: TransactionType.Sell,
                  user: { connect: { id: currentUser.id } },
                  fiat: { connect: { id: currentUserFiatWallet.fiatId } },
                  status: TransactionStatus.members[1],
                  invoiceNumber,
                },
              })

              // Disbursement Wallet Logic for SELL
              try {
                const disbursementPrivateKey =
                  process.env.DISBURSEMENT_WALLET_PRIVATE_KEY!

                if (!disbursementPrivateKey) {
                  throw new Error('DISBURSEMENT_PRIVATE_KEY is not set')
                }

                const testnet = process.env.BLOCKCHAIN_NETWORK === 'testnet'

                const { ercWrapper, wallet } = await walletWithPrivateKey(
                  testnet,
                  disbursementPrivateKey,
                )

                if (!wallet || !ercWrapper) {
                  throw new Error('Failed to initialize disbursement wallet')
                }

                const disbursementWalletAddress = wallet.address

                const transferResult = await ercWrapper.send(
                  disbursementWalletAddress,
                  totalSellQuantity.toFixed(6),
                  tokenInfo.address,
                  testnet,
                )

                if (transferResult.status !== 'success') {
                  throw new Error(
                    `Failed to receive tokens from user: ${transferResult.message}`,
                  )
                }
              } catch (error: any) {
                console.error(
                  'Disbursement wallet error (SELL):',
                  error.message,
                )
              }

              //Notification
              const smsMessage = `You have successfully sold ${totalSellQuantity.toFixed(
                6,
              )} ${tokenSymbol}.`

              const inAppMessage = `You have successfully sold ${totalSellQuantity.toFixed(
                6,
              )} ${tokenSymbol}.`

              new Notification(
                currentUser!.id,
                '',
                'Sell Crypto Transaction',
                {
                  message: smsMessage,
                  additionalData: {
                    invoiceNumber,
                  },
                },
                'Sent',
                'Transaction',
                'SMS',
              ).sendSMSNotification(currentUser?.phone!)

              //inapp notification

              new Notification(
                currentUser!.id,
                '',
                'Sell Crypto Transaction',
                {
                  message: inAppMessage,
                  additionalData: {
                    invoiceNumber,
                  },
                },
                'Sent',
                'Transaction',
                'InApp',
              ).sendInAppNotification()
            } catch (error: any) {
              throw new GraphQLError(
                `Failed to process SELL transaction: ${error.message}`,
                {
                  extensions: { code: 'SELL_TRANSACTION_FAILED' },
                },
              )
            }
            return {
              amount: amountNumber.toString(),
              tokenSymbol,
              price: price.toString(),
              fee: sellFee.toFixed(6),
              quantity: sellAmountUsd.toFixed(6),
              totalQuantity: totalSellQuantity.toFixed(6),
              invoiceNumber,
            }
          }
          return null
        } catch (error: any) {
          throw new GraphQLError(`Transaction failed: ${error.message}`, {
            extensions: { code: 'TRANSACTION_FAILED' },
          })
        }
      },
    })
  },
})
