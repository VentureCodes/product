import { GraphQLError } from 'graphql'
import { arg, extendType, nonNull } from 'nexus'
import { handlePrismaError, removeEmpty } from '../../helper'
import {
  formatPhoneNumberWithCountryCode,
  generateInvoiceNumber,
  randomUser,
  sendEmail,
  sendSMS,
} from '../../../utils'
import { HdWallet } from '../../../utils/crypto'
import { allowedTokens, walletWithProvider } from '../../../utils/erc-wallet'
import {
  PlatformFeeType,
  TransactionDirection,
  TransactionInfo,
  TransactionStatus,
  TransactionType,
} from 'nexus-prisma'
import { pushLink, PushLinkType } from '../../../utils/generateLink'
import { formatDate } from '../../../utils'
import { convertCurrencyOrCrypto } from '../../../utils/currencyApi/converter'
import { Notification } from '../../../utils/notification'

export const PushPayQuery = extendType({
  type: 'Query',
  definition(_t) {},
})

export const PushPayMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('payPush', {
      type: 'PushPayResponse',
      args: {
        data: nonNull(arg({ type: 'PushPayWhereInput' })),
      },
      resolve: async (_, args, { prisma, user, req }) => {
        const { data } = removeEmpty(args)
        let { email, phone, amount, token, method, name } = data
        phone = formatPhoneNumberWithCountryCode(phone)

        if (!method) {
          throw new GraphQLError('Method is required', {
            extensions: {
              message: 'METHOD_FIELD_REQUIRED',
            },
          })
        }

        let HOST_URI = `https://${req.hostname?.replaceAll(
          'api.',
          'app.',
        )}/transfer2?isClaimModal=true`

        // check if the the receiver by phone or email exists
        let receiver = await prisma.user.findFirst({
          where: { OR: [{ phone }] },
        })

        let tokenLabel = ''

        let receiverCrypto, receiverWallet, receiverCryptoAccount
        // if not, create a new user=>wallet=>account
        if (!receiver) {
          try {
            const username = randomUser()
            receiver = await prisma.user.create({
              data: {
                phone: phone,
                isActive: false,
                username,
              },
            })
          } catch (error: any) {
            return handlePrismaError(error)
          }

          try {
            receiverWallet = await prisma.fiatWallet.create({
              data: {
                user: { connect: { id: receiver.id } },
                balance: 0,
                //TODOS:  change currency to USD or user currency
                fiat: { connect: { symbol: 'KES' } },
              },
            })

            // Create Cryto Account
            const cryptoWalletData = new HdWallet().create()

            receiverCrypto = await prisma.cryptoWallet.create({
              data: {
                userId: receiver.id,
                networkId: 1,
                mnemonic: cryptoWalletData.mnemonic?.phrase!,
              },
            })

            receiverCryptoAccount = await prisma.cryptoAccount.create({
              data: {
                cryptoWalletId: receiverCrypto.id,
                address: cryptoWalletData.address!,
                privateKey: cryptoWalletData.privateKey!,
              },
            })
          } catch (error: any) {
            return handlePrismaError(error)
          }
        } else {
          // if exists, get the walletId and accountId
          receiverWallet = await prisma.fiatWallet.findFirst({
            where: { userId: receiver.id },
            include: {
              fiat: true,
            },
          })
          receiverCrypto = await prisma.cryptoWallet.findFirst({
            where: { userId: receiver.id },
          })
          receiverCryptoAccount = await prisma.cryptoAccount.findFirst({
            where: { cryptoWalletId: receiverCrypto!.id },
          })
        }

        //Query cashier
        //TODO:  Filter multiple cashiers
        const cashier = await prisma.user.findFirst({
          where: { userType: 'CASHIER' },
        })

        // If exists, get the walletId and accountId

        // Get the sernder infromastion
        const senderWallet = await prisma.fiatWallet.findFirst({
          where: { userId: user!.id },
          include: {
            fiat: true,
          },
        })
        const senderCrypto = await prisma.cryptoWallet.findFirst({
          where: { userId: user!.id },
        })
        const senderCryptoAccount = await prisma.cryptoAccount.findFirst({
          where: { cryptoWalletId: senderCrypto!.id },
        })

        if (!senderWallet || !senderCrypto || !senderCryptoAccount) {
          throw new GraphQLError('Sender wallet not found', {
            extensions: {
              message: 'WALLET_NOT_FOUND',
            },
          })
        }

        if (!receiverWallet || !receiverCrypto || !receiverCryptoAccount) {
          throw new GraphQLError('Receiver wallet not found', {
            extensions: {
              message: 'WALLET_NOT_FOUND',
            },
          })
        }

        // depending of the method of sending
        let claimLink = '' // TODO:  generate the push link
        let senderMessage = ''
        let receiverMessage = ''

        let senderInvoiceNumber = generateInvoiceNumber()
        let receiverInvoiceNumber = generateInvoiceNumber()

        if (method === 'crypto') {
          if (!token) {
            throw new GraphQLError('Token not provided', {
              extensions: {
                message: 'TOKEN_NOT_PROVIDED',
              },
            })
          }

          // check if the user has enount crypto wallet depending on the amount they have request
          const testnet =
            process.env.BLOCKCHAIN_NETWORK === 'testnet' ? true : false
          const { ercWrapper, wallet } = await walletWithProvider(
            testnet,
            senderCrypto!.mnemonic,
          )

          if (!wallet || !ercWrapper) {
            throw new GraphQLError('Error getting user wallet information', {
              extensions: {
                message: 'WALLET_NOT_FOUND',
              },
            })
          }

          // Fetch balance for the token
          const balance = await ercWrapper.getTokenBalance(token)

          // Check if user has enough balance
          if (parseFloat(balance) < parseFloat(data.amount)) {
            throw new GraphQLError('Insufficient balance', {
              extensions: {
                message: 'INSUFFICIENT_BALANCE',
              },
            })
          }

          // send the token to  new user
          let txHash

          try {
            txHash = await ercWrapper.send(
              receiverCryptoAccount!.address,
              token,
              amount,
              testnet,
            )
            console.log(txHash)

            // create push link for the sender
            claimLink = await pushLink({
              host: HOST_URI,
              senderPhone: phone,
              receiverPhone: receiver.phone!,
              type: PushLinkType.CRYPTO,
              senderInvoiceId: senderInvoiceNumber,
              receiverInvoiceId: receiverInvoiceNumber,
              token: data.token,
            })

            const tokenInfo = allowedTokens(false).find(
              (item) =>
                item.address.toLocaleLowerCase() === token.toLocaleLowerCase(),
            )
            tokenLabel = tokenInfo ? tokenInfo.symbol?.toUpperCase() : token

            senderMessage = `${senderInvoiceNumber} You have successfully sent $${amount} of ${tokenLabel} to ${
              receiver.phone
            }. Claim Link: ${claimLink}, at ${formatDate(
              new Date().toISOString(),
            )}`
            // Save the transaction
            await prisma.fiatTransaction.upsert({
              where: { invoiceNumber: data.senderInvoiceId },
              create: {
                fiat: {
                  connect: { id: senderWallet!.fiatId },
                },
                amount: parseFloat(amount),
                user: {
                  connect: { id: user!.id },
                },
                narations: senderMessage,
                type: TransactionType.members[2],
                status: TransactionStatus.members[1],
                invoiceNumber: senderInvoiceNumber,
                transactionInfo: TransactionInfo.members[0],
              },
              update: { status: TransactionStatus.members[1] },
            })
            // send sms to the receiver, sender
            // sender
            try {
              await sendSMS({
                phone: `+${user!.phone}`,
                message: senderMessage,
              })
            } catch (err) {
              throw new GraphQLError('Failed to send OTP', {
                extensions: {
                  message: 'SENDING_SMS',
                },
              })
            }

            // Sender InApp Notification
            new Notification(
              user?.id!,
              '',
              'Push Notification',
              { message: senderMessage },
              'Unread',
              'Transaction',
              'InApp',
            ).sendInAppNotification()

            // Try to send the pushlink via email too if user has email updated
            if (user!.email) {
              try {
                await sendEmail(
                  user!.email,
                  'Dollar App PushPay Link',
                  senderMessage,
                )
                console.log(`Pushlink email sent to ${user!.email}`)
              } catch (err: any) {
                console.error(
                  `Sending Pushlink email to ${user!.email} failed:`,
                  err.message,
                )
                // Continue the flow even if the email sending fails
              }
            }

            // create push link for the receiver
            claimLink = await pushLink({
              host: HOST_URI,
              senderPhone: phone,
              receiverPhone: receiver.phone!,
              type: PushLinkType.CRYPTO,
              senderInvoiceId: senderInvoiceNumber,
              receiverInvoiceId: receiverInvoiceNumber,
              token: data.token,
            })

            receiverMessage = `${receiverInvoiceNumber} Successfully received $${amount}  
            of ${tokenLabel} to ${receiver.phone}
            Claim Link: ${claimLink}, at ${formatDate(
              new Date().toISOString(),
            )} EAT
            Hash: https://bscscan.com/tx/${txHash}`

            await prisma.fiatTransaction.upsert({
              where: { invoiceNumber: data.receiverInvoiceId },
              create: {
                fiat: {
                  connect: { id: receiverWallet!.fiatId },
                },
                amount: parseFloat(amount),
                user: {
                  connect: { id: receiver!.id },
                },
                narations: receiverMessage,
                type: TransactionType.members[2],
                status: TransactionStatus.members[1],
                invoiceNumber: senderInvoiceNumber,
                transactionInfo: TransactionInfo.members[0],
              },
              update: { status: TransactionStatus.members[1] },
            })
            // send sms to the receiver, sender
            // receiver
            try {
              // await sendSMS(
              //   process.env.AFRICA_TALKING_NOW_KEY!,
              //   process.env.AFRICA_TALKING_NOW_USERNAME!,
              //   [`+${receiver!.phone}`],
              //   receiverMessage,
              // )
              await sendSMS({
                phone: `+${receiver!.phone}`,
                message: senderMessage, // TODO Test this logic/msg
              })
            } catch (err) {
              throw new GraphQLError('Failed to send OTP', {
                extensions: {
                  message: 'SENDING_SMS',
                },
              })
            }

            // Try to send the pushlink via email too if user has email updated
            if (receiver!.email) {
              try {
                await sendEmail(
                  receiver.email,
                  'Dollar App PushPay Link',
                  receiverMessage,
                )
                console.log(`Pushlink email sent to ${receiver.email}`)
              } catch (err: any) {
                console.error(
                  `Sending Pushlink email to ${receiver.email} failed:`,
                  err.message,
                )
                // Continue the flow even if the email sending fails
              }
            }

            // notifiy the sender, receiver
          } catch (error) {
            throw new GraphQLError('Error sending token', {
              extensions: {
                message: 'ERROR_SENDING_TOKEN',
              },
            })
          }
          return {
            message: senderMessage,
            name: name,
            phone: receiver.phone,
            amount: amount,
            email: email,
            link: claimLink,
          }
        }
        tokenLabel = 'KES'

        if (method === 'wallet') {
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

          // check if the user has enough balance
          if (senderWallet.balance < parseFloat(convertedSenderAmount)) {
            throw new GraphQLError('Insufficient balance', {
              extensions: {
                message: 'INSUFFICIENT_BALANCE',
              },
            })
          }

          //sende the amount to the receiver wallet

          let receiverInvoiceNumber = generateInvoiceNumber()

          //Rate fee of 1% of the amount
          const fee = parseFloat(convertedSenderAmount) * 0.01
          console.log('Pushpay fee', fee)

          //TODO: check the math again
          const senderBalance = (senderWallet.balance -=
            parseFloat(convertedSenderAmount) + fee)
          const lockedBalance = (senderWallet.lockedBal += parseFloat(
            convertedSenderAmount,
          ))

          //create and credit platform fee
          try {
            await prisma.platformFee.create({
              data: {
                amount: fee,
                name: 'Push Fee',
                cashier: {
                  connect: { id: cashier!.id },
                },
                fee_type: PlatformFeeType.members[1],
                invoiceNumber: senderInvoiceNumber,
              },
            })
          } catch (error) {
            throw new GraphQLError('Error creating platform fee', {
              extensions: {
                message: 'ERROR_CREATING_PLATFORM_FEE',
              },
            })
          }

          //update the cashier wallet balance
          const cashierWallet = await prisma.fiatWallet.findFirst({
            where: { userId: cashier!.id },
          })

          if (!cashierWallet) {
            throw new GraphQLError('Cashier wallet not found', {
              extensions: {
                message: 'WALLET_NOT_FOUND',
              },
            })
          }
          console.log('Cashier before fee: ', cashierWallet.balance)

          const cashierBalance = (cashierWallet.balance += fee)

          console.log('Cashier Balance after fee: ', cashierBalance)

          try {
            await prisma.fiatWallet.update({
              where: {
                id: senderWallet!.id,
              },
              data: {
                balance: senderBalance,
                lockedBal: lockedBalance,
              },
            })
          } catch (error) {
            throw new GraphQLError('Error updating sender wallet', {
              extensions: {
                message: 'ERROR_UPDATING_SENDER_WALLET',
              },
            })
          }
          // update the receiver wallet
          let newBalance = (receiverWallet.lockedBal += parseFloat(
            convertedSenderAmount,
          ))
          try {
            await prisma.fiatWallet.update({
              where: {
                id: receiverWallet!.id,
              },
              data: {
                lockedBal: newBalance,
              },
            })
          } catch (error) {
            throw new GraphQLError('Error updating sender wallet', {
              extensions: {
                message: 'ERROR_UPDATING_SENDER_WALLET',
              },
            })
          }

          senderMessage = `${senderInvoiceNumber} You have successfully sent USD ${amount} to ${
            receiver.phone
          } at ${formatDate(new Date().toISOString())} EAT`

          try {
            // create transactions sender transactions
            await prisma.fiatTransaction.create({
              data: {
                fiat: {
                  connect: { id: senderWallet!.fiatId },
                },
                amount: parseFloat(convertedSenderAmount),
                user: {
                  connect: { id: user!.id },
                },
                narations: senderMessage,
                type: TransactionType.members[2],
                status: TransactionStatus.members[0],
                invoiceNumber: senderInvoiceNumber,
                phone: receiver.phone,
                direction: TransactionDirection.members[1],
                transactionInfo: TransactionInfo.members[0],
              },
            })
          } catch (error) {
            throw new GraphQLError('Error creating transaction Sender', {
              extensions: {
                message: 'ERROR_CREATING_TRANSACTION',
              },
            })
          }

          // sender
          try {
            await sendSMS({
              phone: `+${user!.phone}`,
              message: senderMessage,
            })
          } catch (err: any) {
            throw new GraphQLError('Failed to send OTP', {
              extensions: {
                message: 'SENDING_SMS',
              },
            })
          }

          // Try to send the pushlink via email too if user has email updated
          if (user!.email) {
            try {
              await sendEmail(
                user!.email,
                'Dollar App PushPay Link',
                senderMessage,
              )
              console.log(`Pushlink email sent to ${user!.email}`)
            } catch (err: any) {
              console.error(
                `Sending Pushlink email to ${user!.email} failed:`,
                err.message,
              )
              // Continue the flow even if the email sending fails
            }
          }

          // Try to send the pushlink via email too if user has email updated
          if (user!.email) {
            try {
              await sendEmail(
                user!.email,
                'Dollar App PushPay Link',
                senderMessage,
              )
              console.log(`Pushlink email sent to ${user!.email}`)
            } catch (err: any) {
              console.error(
                `Sending Pushlink email to ${user!.email} failed:`,
                err.message,
              )
              // Continue the flow even if the email sending fails
            }
          }

          // PushLink
          // considering the crypto, we don't use phone numbers
          claimLink = await pushLink({
            host: HOST_URI,
            senderPhone: user?.phone!,
            receiverPhone: receiver.phone!,
            type: PushLinkType.WALLET,
            senderInvoiceId: senderInvoiceNumber,
            receiverInvoiceId: receiverInvoiceNumber,
          })

          // Handle receiver

          receiverMessage = `${receiverInvoiceNumber} You have successfully received USD ${amount}  
          from ${user!.phone!.replace(
            /\d{3}$/,
            '***',
          )} Claim Link: ${claimLink} at ${formatDate(
            new Date().toISOString(),
          )}`
          try {
            // receiver transactions
            await prisma.fiatTransaction.create({
              data: {
                fiat: {
                  connect: { id: receiverWallet!.fiatId },
                },
                amount: parseFloat(convertedSenderAmount),
                user: {
                  connect: { id: receiver!.id },
                },
                narations: receiverMessage,
                type: TransactionType.members[2],
                status: TransactionStatus.members[0],
                invoiceNumber: receiverInvoiceNumber,
                phone: user?.phone,
                transactionInfo: TransactionInfo.members[0],
              },
            })
          } catch (error) {
            throw new GraphQLError('Error creating transaction', {
              extensions: {
                message: 'ERROR_CREATING_TRANSACTION',
              },
            })
          }
          // receiver
          try {
            await sendSMS({
              phone: `+${receiver!.phone}`,
              message: receiverMessage,
            })
          } catch (err) {
            throw new GraphQLError('Failed to send OTP', {
              extensions: {
                message: 'SENDING_SMS',
              },
            })
          }

          // Try to send the pushlink via email too if user has email updated
          if (receiver!.email) {
            try {
              await sendEmail(
                receiver.email,
                'Dollar App PushPay Link',
                receiverMessage,
              )
              console.log(`Pushlink email sent to ${receiver.email}`)
            } catch (err: any) {
              console.error(
                `Sending Pushlink email to ${receiver.email} failed:`,
                err.message,
              )
              // Continue the flow even if the email sending fails
            }
          }
        }

        return {
          message: senderMessage,
          name: name,
          phone: receiver.phone,
          amount: amount,
          email: email,
          link: claimLink,
        }
      },
    })
  },
})
