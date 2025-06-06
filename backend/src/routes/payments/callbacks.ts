import { Request, Response, Router } from 'express'
import { prisma } from './../../graphql/context'
import { TransactionStatus } from '@prisma/client'
import { sendSMS } from './../../utils'

const router = Router()

router.post(
  '/payments/mam-laka/load-fiat-wallet/callbackurl',
  async (req: Request, res: Response) => {
    console.log('Received Request: ', req.body)

    if (req.body.transactionStatus === 'COMPLETED') {
      try {
        // Validate required fields
        if (!req.body.secureId || !req.body.amount) {
          console.error('Missing required fields in request body')
          return res.status(400).json({ message: 'Missing required fields' })
        }

        // Fetch the transaction
        const transaction = await prisma.fiatTransaction.findFirst({
          where: { paymentSecureId: req.body.secureId },
        })

        if (!transaction) {
          console.error(
            'Transaction not found for secureId:',
            req.body.secureId,
          )
          return res.status(404).json({ message: 'Transaction not found' })
        }

        // Fetch the user wallet
        const wallet = await prisma.fiatWallet.findFirst({
          where: { userId: transaction.userId },
        })

        if (!wallet) {
          console.error('Wallet not found for userId:', transaction.userId)
          return res.status(404).json({ message: 'Wallet not found' })
        }

        console.log('Wallet before update: ', wallet)

        // Update the wallet balance
        await prisma.fiatWallet.update({
          where: { id: wallet.id },
          data: { balance: { increment: Number(req.body.amount) } },
        })

        console.log('Wallet updated successfully')

        // Update the transaction status
        await prisma.fiatTransaction.update({
          where: { id: transaction.id },
          data: {
            status: TransactionStatus.Completed,
            amount: Number(req.body.amount),
          },
        })

        console.log('Transaction updated successfully')

        // Send notification to the user
        // await sendSMS(
        //   process.env.AFRICA_TALKING_NOW_KEY!,
        //   process.env.AFRICA_TALKING_NOW_USERNAME!,
        //   [`+${transaction.phone}`],
        //   `DollaApp Wallet has been credited with ${
        //     req.body.amount
        //   } KES successfully. Your new balance is ${(
        //     wallet.balance + Number(req.body.amount)
        //   ).toFixed(2)} KES.`,
        // )

        await sendSMS({
          phone: `+${transaction.phone}`,
          message: `DollaApp Wallet has been credited with ${
            req.body.amount
          } KES successfully. Your new balance is ${(
            wallet.balance + Number(req.body.amount)
          ).toFixed(2)} KES.`,
        })
        console.log('Notification sent successfully')

        // Respond to the client indicating success
        return res.status(200).json({ message: 'success' })
      } catch (error) {
        console.error('Error processing the callback:', error)
        // Respond with a server error
        return res
          .status(500)
          .json({ message: 'Internal Server Error', error: 'Error' })
      }
    } else {
      // Handle cases where the transactionStatus is not 'COMPLETED'
      console.warn(
        'Transaction status is not completed:',
        req.body.transactionStatus,
      )
      return res.status(400).json({ message: 'Invalid transaction status' })
    }
  },
)

router.post(
  '/payments/mam-laka/load-fiat-wallet-with-card/callbackurl',
  async (req: Request, res: Response) => {
    console.log('Received Request: ', req.body)

    try {
      // Check if transactionStatus is 'COMPLETED'
      if (req.body.transactionStatus === 'COMPLETED') {
        // Validate required fields
        if (!req.body.secureId || !req.body.amount) {
          console.error('Missing required fields in request body')
          return res.status(400).json({ message: 'Missing required fields' })
        }

        // Fetch the transaction
        const transaction = await prisma.fiatTransaction.findFirst({
          where: { paymentSecureId: req.body.secureId },
        })

        if (!transaction) {
          console.error(
            'Transaction not found for secureId:',
            req.body.secureId,
          )
          return res.status(404).json({ message: 'Transaction not found' })
        }

        // Fetch the user wallet
        const wallet = await prisma.fiatWallet.findFirst({
          where: { userId: transaction.userId },
        })

        if (!wallet) {
          console.error('Wallet not found for userId:', transaction.userId)
          return res.status(404).json({ message: 'Wallet not found' })
        }

        console.log('Wallet before update: ', wallet)

        // Update the wallet balance
        await prisma.fiatWallet.update({
          where: { id: wallet.id },
          data: { balance: { increment: Number(req.body.amount) } },
        })

        console.log('Wallet updated successfully')

        // Update the transaction status
        await prisma.fiatTransaction.update({
          where: { id: transaction.id },
          data: {
            status: TransactionStatus.Completed,
            amount: Number(req.body.amount),
          },
        })

        console.log('Transaction updated successfully')

        // Send notification to the user
        try {
          // await sendSMS(
          //   process.env.AFRICA_TALKING_NOW_KEY!,
          //   process.env.AFRICA_TALKING_NOW_USERNAME!,
          //   [`+${transaction.phone}`],
          //   `Loaded your wallet with ${
          //     req.body.amount
          //   } KES successfully. Your new balance is ${(
          //     wallet.balance + Number(req.body.amount)
          //   ).toFixed(2)} KES.`,
          // )
          await sendSMS({
            phone: `+${transaction.phone}`,
            message: `Loaded your wallet with ${
              req.body.amount
            } KES successfully. Your new balance is ${(
              wallet.balance + Number(req.body.amount)
            ).toFixed(2)} KES.`,
          })
          console.log(`Sent SMS to +${transaction.phone} successfully`)
        } catch (smsError) {
          console.error(`Failed to send SMS to +${transaction.phone}`, smsError)
          // Optionally, you can respond with a partial success or log it for future retries
        }

        // Respond with success
        return res.status(200).json({ message: 'success' })
      } else {
        // Handle cases where the transaction status is not 'COMPLETED'
        console.warn(
          'Transaction status is not completed:',
          req.body.transactionStatus,
        )
        return res.status(400).json({ message: 'Invalid transaction status' })
      }
    } catch (error) {
      console.error('Error processing the callback:', error)
      // Respond with a server error
      return res
        .status(500)
        .json({ message: 'Internal Server Error', error: 'error' })
    }
  },
)

router.post(
  '/payments/mam-laka/subscription/callbackurl',
  async (req: Request, res: Response) => {
    console.log('Received Request: ', req.body)

    try {
      // Check if transactionStatus is 'COMPLETED'
      if (req.body.transactionStatus === 'COMPLETED') {
        // Validate required fields
        if (!req.body.secureId || !req.body.amount) {
          console.error('Missing required fields in request body')
          return res.status(400).json({ message: 'Missing required fields' })
        }

        // Fetch the transaction
        const transaction = await prisma.fiatTransaction.findFirst({
          where: { paymentSecureId: req.body.secureId },
        })

        if (!transaction) {
          console.error(
            'Transaction not found for secureId:',
            req.body.secureId,
          )
          return res.status(404).json({ message: 'Transaction not found' })
        }

        // Update the transaction status and amount
        await prisma.fiatTransaction.update({
          where: { id: transaction.id },
          data: {
            status: TransactionStatus.Completed,
            amount: Number(req.body.amount),
          },
        })

        console.log('Transaction updated successfully')

        // Fetch the related subscription plan
        const subscription = await prisma.subscriptionPlan.findFirst({
          where: {
            fiatTransactionId: transaction.id,
          },
        })

        if (subscription) {
          // Update the subscription to active
          await prisma.subscriptionPlan.update({
            where: { id: subscription.id },
            data: {
              isActive: true,
            },
          })

          console.log('Subscription updated successfully')

          // Send notification to the user
          try {
            // await sendSMS(
            //   process.env.AFRICA_TALKING_NOW_KEY!,
            //   process.env.AFRICA_TALKING_NOW_USERNAME!,
            //   [`+${transaction.phone}`],
            //   `Your payment has been received and you have been subscribed to ${subscription.type} successfully. Your plan start date is ${subscription.startDate} through ${subscription.endDate}.`,
            // )
            await sendSMS({
              phone: `+${transaction.phone}`,
              message: `Your payment has been received and you have been subscribed to ${subscription.type} successfully. Your plan start date is ${subscription.startDate} through ${subscription.endDate}.`,
            })
            console.log(`Sent SMS to +${transaction.phone} successfully`)
          } catch (smsError) {
            console.error(
              `Failed to send SMS to +${transaction.phone}`,
              smsError,
            )
            // Optionally handle the SMS failure, log for retries, etc.
          }
        } else {
          console.warn(
            'Subscription plan not found for transactionId:',
            transaction.id,
          )
          // Optionally respond with partial success if subscription not found
        }

        // Respond with success
        return res.status(200).json({ message: 'success' })
      } else {
        // Handle cases where the transaction status is not 'COMPLETED'
        console.warn(
          'Transaction status is not completed:',
          req.body.transactionStatus,
        )
        return res.status(400).json({ message: 'Invalid transaction status' })
      }
    } catch (error) {
      console.error('Error processing the callback:', error)
      // Respond with a server error
      return res
        .status(500)
        .json({ message: 'Internal Server Error', error: 'Error' })
    }
  },
)

export { router as loadFiatWalletRouter }
