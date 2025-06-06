import { GraphQLError } from 'graphql'
import { arg, extendType, nonNull } from 'nexus'
import { removeEmpty } from '../../helper'
import { allowedTokens, walletWithProvider } from '../../../utils/erc-wallet'
import { PushLinkType } from '../../../utils/generateLink'
import { sendSMS } from '../../../utils/sms'
import { TransactionStatus, TransactionType } from 'nexus-prisma'
import { formatPhoneNumberWithCountryCode } from '../../../utils/common'
import { formatDate, sendEmail } from '../../../utils'
import { convertCurrencyOrCrypto } from '../../../utils/currencyApi/converter'
import { Notification } from '../../../utils/notification'

export const PushClaimPayQuery = extendType({
  type: 'Query',
  definition(_t) {},
})

export const PushPayClaimMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('pushPayClaim', {
      type: 'PushPayClaimResponse',
      args: {
        data: nonNull(arg({ type: 'PushPayClaimWhereInput' })),
      },
      resolve: async (_, args, { prisma, user }) => {
        const { data } = removeEmpty(args)

        const {
          receiverPhone,
          senderPhone,
          senderInvoiceId,
          receiverInvoiceId,
          method,
        } = data

        // format the phone numbers
        const formattedReceiverPhone =
          formatPhoneNumberWithCountryCode(receiverPhone)

        const formattedSenderPhone =
          formatPhoneNumberWithCountryCode(senderPhone)

        if (!method || !Object.values(PushLinkType).includes(method)) {
          throw new GraphQLError('Method is required and must be valid.', {
            extensions: {
              message: 'METHOD_FIELD_REQUIRED',
            },
          })
        }

        let message = ''

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

        // get users
        const sender = await prisma.user.findFirst({
          where: { phone: formattedSenderPhone },
        })
        const receiver = await prisma.user.findFirst({
          where: { phone: formattedReceiverPhone },
        })

        //Get the sender transaction details with the invoice number
        const senderTransaction = await prisma.fiatTransaction.findFirst({
          where: { invoiceNumber: senderInvoiceId },
          include: {
            fiat: true,
          },
        })

        if (!senderTransaction) {
          throw new GraphQLError('Missing claim link', {
            extensions: {
              message: 'MISSING_CLAIM_LINK',
            },
          })
        }

        if (senderTransaction.isClaimed) {
          throw new GraphQLError('Link already claimed', {
            extensions: {
              message: 'LINK_CLAIMED',
            },
          })
        }

        //Get the sender transaction details with the invoice number
        const receiverTransaction = await prisma.fiatTransaction.findFirst({
          where: { invoiceNumber: receiverInvoiceId },
          include: {
            fiat: true,
          },
        })

        if (!receiverTransaction) {
          throw new GraphQLError('Missing claim link', {
            extensions: {
              message: 'MISSING_CLAIM_LINK',
            },
          })
        }

        if (receiverTransaction.isClaimed) {
          throw new GraphQLError('Link already claimed', {
            extensions: {
              message: 'LINK_CLAIMED',
            },
          })
        }

        //Update the locked balances
        const senderWallet = await prisma.fiatWallet.findFirst({
          where: { userId: senderTransaction!.userId },
          include: {
            fiat: true,
          },
        })

        if (!senderWallet) {
          throw new GraphQLError('Sender Wallet not found', {
            extensions: {
              message: 'SENDER_WALLET_NOT_FOUND',
            },
          })
        }

        const receiverWallet = await prisma.fiatWallet.findFirst({
          where: { userId: receiver?.id },
          include: {
            fiat: true,
          },
        })

        if (!receiverWallet) {
          throw new GraphQLError('Receiver Wallet not found', {
            extensions: {
              message: 'RECEIVER_WALLET_NOT_FOUND',
            },
          })
        }

        // check the method
        if (method === PushLinkType.CRYPTO) {
          // wallet

          if (!data.token) {
            throw new GraphQLError('Token not found', {
              extensions: {
                message: 'TOKEN_NOT_FOUND',
              },
            })
          }

          const receiverCryptoWallet = await prisma.cryptoWallet.findFirst({
            where: { userId: sender?.id },
          })

          if (!receiverCryptoWallet) {
            throw new GraphQLError('Crypto Wallet not found')
          }
          // get the ERC wrapper
          const testnet =
            process.env.BLOCKCHAIN_NETWORK === 'testnet' ? true : false
          const { ercWrapper, wallet } = await walletWithProvider(
            testnet,
            receiverCryptoWallet!.mnemonic,
          )

          const cryptoTokenBalance = ercWrapper?.getTokenBalance(data.token)

          const tokenInfo = allowedTokens().find(
            (t) =>
              t.address.toLocaleLowerCase() === data.token.toLocaleLowerCase(),
          )

          if (!tokenInfo) {
            throw new GraphQLError('Token not supported', {
              extensions: {
                message: 'TOKEN_NOT_SUPPORTED',
              },
            })
          }
          message = ` ${
            receiver?.phone
          }, you have successfully claimed ${cryptoTokenBalance} ${
            tokenInfo.symbol
          } at ${formatDate(
            new Date().toISOString(),
          )}. Please check your crypto wallet, OR click on 
          https://bscscan.com/address/${data.token}?a=${wallet?.address}`
          return {
            message,
          }
        }

        if (method === PushLinkType.WALLET) {
          // if the transaction is a push Request TransactionType.members[2]
          if (senderTransaction.type == TransactionType.members[2]) {
            if (user?.phone !== formattedReceiverPhone) {
              throw new GraphQLError(
                'Unauthorized!. You are not allowed to access this page.',
                {
                  extensions: {
                    message: 'UNAUTHORIZED',
                  },
                },
              )
            }
            // generate the link
            if (!receiverInvoiceId) {
              throw new GraphQLError(
                'Invalid claim link. Missing receiverInvoiceId',
                {
                  extensions: {
                    message: 'INVALID_CLAIM_LINK_MISSING_RECEIVERINVOICEID',
                  },
                },
              )
            }

            const receiverTransaction = await prisma.fiatTransaction.findFirst({
              where: {
                invoiceNumber: data.receiverInvoiceId,
              },
              include: {
                fiat: true,
              },
            })

            if (!receiverTransaction) {
              throw new GraphQLError(
                'Invalid claim link, cannot find receiverTransaction',
                {
                  extensions: {
                    message:
                      'INVALID_CLAIM_LINK_CANNOT_FIND_RECEIVERTRANSACTION',
                  },
                },
              )
            }

            let fiatFee = senderTransaction.amount * 0.01
            let totalFiatSenderAmount = senderTransaction.amount + fiatFee

            // update the sender wallet
            try {
              await prisma.fiatWallet.update({
                where: { id: senderWallet?.id },
                data: {
                  lockedBal: {
                    decrement: totalFiatSenderAmount,
                  },
                },
              })
            } catch (error) {
              throw new GraphQLError('Error updating sender wallet', {
                extensions: {
                  message: 'ERROR_UPDATING_SENDER_WALLET',
                },
              })
            }

            // If the receiver's wallet is in a different currency, convert the amount
            let convertedReceiverAmount = senderTransaction!.amount
            if (receiverWallet.fiat.symbol !== senderWallet.fiat.symbol) {
              const {
                data: { value },
              } = await convertCurrencyOrCrypto({
                base_currency: senderWallet.fiat.symbol,
                currency: receiverWallet.fiat.symbol,
                value: senderTransaction!.amount.toString(),
              })
              console.log('conversionForReceiver', value)

              convertedReceiverAmount = value
            }

            // update the receiver wallet
            try {
              await prisma.fiatWallet.update({
                where: { id: receiverWallet?.id },
                data: {
                  balance: {
                    increment: convertedReceiverAmount,
                  },
                  lockedBal: {
                    decrement: convertedReceiverAmount,
                  },
                },
              })
            } catch (error) {
              throw new GraphQLError('Error updating receiver wallet', {
                extensions: {
                  message: 'ERROR_UPDATING_RECEIVER_WALLET',
                },
              })
            }

            //update transaction to claimed
            try {
              await prisma.fiatTransaction.update({
                where: { id: receiverTransaction.id },
                data: {
                  isClaimed: true,
                  status: TransactionStatus.members[1],
                },
              })
            } catch (error) {
              throw new GraphQLError('Error updating transaction', {
                extensions: {
                  message: 'ERROR_UPDATING_TRANSACTION',
                },
              })
            }

            //update transaction to claimed
            try {
              await prisma.fiatTransaction.update({
                where: { id: senderTransaction.id },
                data: {
                  isClaimed: true,
                  status: TransactionStatus.members[1],
                },
              })
            } catch (error) {
              throw new GraphQLError('Error updating transaction', {
                extensions: {
                  message: 'ERROR_UPDATING_TRANSACTION',
                },
              })
            }

            //Get the amount from transaction to deduct from the sender to receiver
            let USDSenderAmount = senderTransaction!.amount
            if (senderWallet.fiat.symbol !== 'USD') {
              const {
                data: { value },
              } = await convertCurrencyOrCrypto({
                base_currency: senderWallet.fiat.symbol,
                currency: 'USD',
                value: senderTransaction!.amount.toString(),
              })
              console.log('convertedAmount', value)

              USDSenderAmount = value
            }

            message = ` ${
              user?.phone
            }, you have successfully claimed ${USDSenderAmount} USD at ${formatDate(
              new Date().toISOString(),
            )}. Please check your dollar/Local Wallet.`

            console.log('sending sms to ', +user?.phone)
            //send message to the receiver that the transaction has been claimed and the sender has been debited
            try {
              await sendSMS({ phone: `+${user.phone}`, message })
            } catch (error: any) {
              console.error('error sending sms', error.message)
              throw new GraphQLError('Error sending message', {
                extensions: {
                  message: 'ERROR_SENDING_MESSAGE',
                },
              })
            }

            console.log('sending email to ', user?.email)
            // Try to send the pulllink via email too if user has email updated
            if (user!.email) {
              try {
                await sendEmail(
                  user!.email,
                  'Dollar App PushPay Claim Link',
                  message,
                )
                console.log(`Claimlink email sent to ${user!.email}`)
              } catch (err: any) {
                console.error(
                  `Sending Claimlink email to ${user!.email} failed:`,
                  err.message,
                )
                // Continue the flow even if the email sending fails
              }
            }

            // Receiver InApp Notification

            new Notification(
              user?.id!,
              '',
              'Claim Notification',
              { message: message },
              'Unread',
              'Transaction',
              'InApp',
            ).sendInAppNotification()

            //Send message to the sender that the transaction has been claimed
            message = `${formattedSenderPhone}, your transaction with invoice number ${senderInvoiceId} has been claimed by ${
              user?.phone
            } at ${formatDate(new Date().toISOString())} EAT.`

            console.log('sending sms to ', +formattedSenderPhone)

            try {
              await sendSMS({
                phone: `+${formattedSenderPhone}`,
                message,
              })
            } catch (error: any) {
              console.error('error sending sms', error.message)

              throw new GraphQLError('Error sending message', {
                extensions: {
                  message: 'ERROR_SENDING_MESSAGE',
                },
              })
            }

            // Try to send the pulllink via email too if user has email updated
            if (sender!.email) {
              try {
                await sendEmail(
                  sender!.email,
                  'Dollar App PushPay Claim Link',
                  message,
                )
                console.log(`Claimlink email sent to ${sender!.email}`)
              } catch (err: any) {
                console.error(
                  `Sending Claimlink email to ${sender!.email} failed:`,
                  err.message,
                )
                // Continue the flow even if the email sending fails
              }
            }

            new Notification(
              sender?.id!,
              '',
              'Claim Notification',
              { message: message },
              'Unread',
              'Transaction',
              'InApp',
            ).sendInAppNotification()
          }

          // if the transaction is a pull Request TransactionType.members[7]
          if (senderTransaction.type == TransactionType.members[7]) {
            if (user.phone !== formattedSenderPhone) {
              throw new GraphQLError(
                'Unauthorized!. You are not allowed to perform this action.',
                {
                  extensions: {
                    message: 'UNAUTHORIZED',
                  },
                },
              )
            }

            console.log('senderWallet', senderWallet)
            console.log('senderTransaction!.amount', senderTransaction)
            // check if user has enough balance to release requested amount
            if (senderWallet.balance < senderTransaction!.amount) {
              throw new GraphQLError(
                'Insufficient balance, please top up and try again.',
                {
                  extensions: {
                    message: 'INSUFFICIENT_BALANCE',
                  },
                },
              )
            }

            let fiatSenderAmountWithoutFee =
              senderTransaction!.amount / (1 + 0.01)
            console.log('totalFiatSenderAmount', fiatSenderAmountWithoutFee)

            console.log('senderTransaction', senderTransaction)
            //Get the amount from transaction to deduct from the sender to receiver
            let USDSenderAmount = fiatSenderAmountWithoutFee
            if (senderWallet.fiat.symbol !== 'USD') {
              const {
                data: { value },
              } = await convertCurrencyOrCrypto({
                base_currency: senderWallet.fiat.symbol,
                currency: 'USD',
                value: fiatSenderAmountWithoutFee.toString(),
              })
              console.log('convertedAmount', value)

              USDSenderAmount = value
            }

            // generate the link
            if (!receiverInvoiceId) {
              throw new GraphQLError(
                'Invalid claim link. Missing receiverInvoiceId',
                {
                  extensions: {
                    message: 'INVALID_CLAIM_LINK_MISSING_RECEIVERINVOICEID',
                  },
                },
              )
            }

            const receiverTransaction = await prisma.fiatTransaction.findFirst({
              where: {
                invoiceNumber: data.receiverInvoiceId,
              },
              include: {
                fiat: true,
              },
            })

            if (!receiverTransaction) {
              throw new GraphQLError(
                'Invalid claim link, cannot find receiverTransaction',
                {
                  extensions: {
                    message:
                      'INVALID_CLAIM_LINK_CANNOT_FIND_RECEIVERTRANSACTION',
                  },
                },
              )
            }

            // update the sender wallet
            try {
              await prisma.fiatWallet.update({
                where: { id: senderWallet?.id },
                data: {
                  balance: {
                    decrement: senderTransaction!.amount,
                  },
                },
              })
            } catch (error) {
              throw new GraphQLError('Error updating sender wallet', {
                extensions: {
                  message: 'ERROR_UPDATING_SENDER_WALLET',
                },
              })
            }

            // If the receiver's wallet is in a different currency, convert the amount
            let convertedReceiverAmount = fiatSenderAmountWithoutFee
            if (receiverWallet.fiat.symbol !== senderWallet.fiat.symbol) {
              const {
                data: { value },
              } = await convertCurrencyOrCrypto({
                base_currency: senderWallet.fiat.symbol,
                currency: receiverWallet.fiat.symbol,
                value: fiatSenderAmountWithoutFee.toString(),
              })
              console.log('conversionForReceiver', value)

              convertedReceiverAmount = value
            }

            // update the receiver wallet
            try {
              await prisma.fiatWallet.update({
                where: { id: receiverWallet?.id },
                data: {
                  balance: {
                    increment: convertedReceiverAmount,
                  },
                },
              })
            } catch (error) {
              throw new GraphQLError('Error updating receiver wallet', {
                extensions: {
                  message: 'ERROR_UPDATING_RECEIVER_WALLET',
                },
              })
            }

            //update sender transaction to claimed
            try {
              await prisma.fiatTransaction.update({
                where: { id: senderTransaction.id },
                data: {
                  isClaimed: true,
                  status: TransactionStatus.members[1],
                },
              })
            } catch (error) {
              throw new GraphQLError('Error updating transaction', {
                extensions: {
                  message: 'ERROR_UPDATING_TRANSACTION',
                },
              })
            }

            //update receiver transaction to claimed
            try {
              await prisma.fiatTransaction.update({
                where: { id: receiverTransaction.id },
                data: {
                  isClaimed: true,
                  status: TransactionStatus.members[1],
                },
              })
            } catch (error) {
              throw new GraphQLError('Error updating transaction', {
                extensions: {
                  message: 'ERROR_UPDATING_TRANSACTION',
                },
              })
            }

            message = ` ${
              user?.phone
            }, you have successfully released ${USDSenderAmount} USD to ${formattedReceiverPhone} at ${formatDate(
              new Date().toISOString(),
            )}`
            console.log('sending sms to ' + user?.phone)
            //send message to the receiver that the transaction has been claimed and the sender has been debited
            try {
              await sendSMS({
                phone: `+${user?.phone}`,
                message,
              })
            } catch (error) {
              throw new GraphQLError('Error sending message', {
                extensions: {
                  message: 'SENDING_SMS',
                },
              })
            }

            console.log('sending email to ' + user?.email)
            // Try to send the pulllink via email too if user has email updated
            if (user!.email) {
              try {
                await sendEmail(
                  user!.email,
                  'Dollar App PushPay Claim Link',
                  message,
                )
                console.log(`Claimlink email sent to ${user!.email}`)
              } catch (err: any) {
                console.error(
                  `Sending Claimlink email to ${user!.email} failed:`,
                  err.message,
                )
                // Continue the flow even if the email sending fails
              }
            }

            //Send message to the sender that the transaction has been claimed
            message = `${formattedReceiverPhone}, your pull request with invoice number ${receiverInvoiceId} has been released by ${
              user?.phone
            } at ${formatDate(
              new Date().toISOString(),
            )}. please check your dollar/Local Wallet.`

            console.log('sending sms to ' + formattedReceiverPhone)

            try {
              await sendSMS({
                phone: `+${formattedReceiverPhone}`,
                message,
              })
            } catch (error) {
              throw new GraphQLError('Error sending message', {
                extensions: {
                  message: 'ERROR_SENDING_MESSAGE',
                },
              })
            }
            console.log('sending email to ' + receiver!.email)

            // Try to send the pulllink via email too if user has email updated
            if (receiver!.email) {
              try {
                await sendEmail(
                  receiver!.email,
                  'Dollar App PushPay Claim Link',
                  message,
                )
                console.log(`Claimlink email sent to ${receiver!.email}`)
              } catch (err: any) {
                console.error(
                  `Sending Claimlink email to ${receiver!.email} failed:`,
                  err.message,
                )
                // Continue the flow even if the email sending fails
              }
            }
          }
        }
        // process of claming
        return {
          message,
        }
      },
    })
  },
})
