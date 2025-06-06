// CALLBACK CODE
import { Request, Response, Router } from 'express'
import { prisma } from '../../context'
import { GraphQLError } from 'graphql'
import { TransactionStatus } from 'nexus-prisma'
import { CallbackItem, getItemValue } from './helpers'
import { Notification } from '../../../utils/notification'

const router = Router()

router.post('/mps/c2b-callback', async (req: Request, res: Response) => {
  const stkCallback = req.body.Body.stkCallback

  const {
    MerchantRequestID,
    CheckoutRequestID,
    ResultCode,
    ResultDesc,
    CallbackMetadata,
  } = stkCallback

  if (ResultCode !== 0) {
    console.log('C2B Transaction Failed', JSON.stringify(req.body))

    // UPDATE PENDING DEPOSIT TO FAILED
    const transaction = await prisma.fiatTransaction.findUnique({
      where: {
        invoiceNumber: CheckoutRequestID,
      },
      include: {
        user: true,
      },
    })

    if (!transaction) {
      throw new GraphQLError('Transaction not found')
    }

    const phoneNumber: string =
      getItemValue(
        stkCallback.CallbackMetadata.Item,
        'PhoneNumber',
      )?.toString() || ''
    // Update the transaction status to failed
    const updatedTransaction = await prisma.fiatTransaction
      .update({
        where: {
          id: transaction!.id,
        },
        data: {
          status: TransactionStatus.members[3],
          phone: phoneNumber,
          extra_data: JSON.stringify({ CallbackMetadata }),
          narations: `Mpesa C2B Deposit Transaction Cancelled: ${JSON.stringify(
            ResultDesc,
          )}`,
        },
      })
      .catch((error) => {
        console.log(
          'Error updating Cancelled mpesa transaction status: ',
          error,
        )
        return new GraphQLError('Error updating transaction status')
      })

    console.log('Updated CANCELLED MPESA Transaction: ', updatedTransaction)

    return res.status(201).json({
      msg: 'Cancelled Mpesa C2B STK Transaction',
      data: stkCallback,
    })
  }

  if (ResultCode === 0) {
    console.log(
      `🎅 C2B Transaction Successfull 🎅 `,
      JSON.stringify(stkCallback),
    )

    console.log({
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    })

    // TODO Update the transaction status to completed

    const { MpesaReceiptNumber, TransactionDate } =
      stkCallback.CallbackMetadata.Item.reduce(
        (acc: any, item: CallbackItem) => {
          acc[item.Name] = item.Value
          return acc
        },
        {},
      )
    const phoneNumber: string =
      getItemValue(
        stkCallback.CallbackMetadata.Item,
        'PhoneNumber',
      )?.toString() || ''

    // Query the transaction by OriginatorConversationID
    const transaction = await prisma.fiatTransaction.findUnique({
      where: {
        invoiceNumber: CheckoutRequestID,
      },
      include: {
        user: true,
      },
    })

    if (!transaction) {
      throw new GraphQLError('Transaction not found')
    }

    // Update the transaction status to completed
    const updatedTransaction = await prisma.fiatTransaction
      .update({
        where: {
          id: transaction!.id,
        },
        data: {
          status: TransactionStatus.members[1],
          phone: phoneNumber,
          extra_data: JSON.stringify({ CallbackMetadata }),
          narations: `Mpesa C2B Deposit Transaction at ${TransactionDate}: ${JSON.stringify(
            ResultDesc,
          )}`,
          paymentSecureId: MpesaReceiptNumber,
        },
      })
      .catch((error) => {
        console.log('Error updating transaction status: ', error)
        return new GraphQLError('Error updating transaction status')
      })

    console.log('Updated Transaction: ', updatedTransaction)

    // TODO Deduct fees and update the User Balance

    // Deduct the fees from the transaction amount
    const amountLessFee = transaction.amount - transaction.amount * 0.01
    const userBalance = await prisma.fiatWallet.findFirst({
      where: {
        userId: transaction.user!.id,
      },
    })

    const user = await prisma.user.findUnique({
      where: {
        id: userBalance!.userId,
      },
    })
    console.log('User Balance: ', userBalance)

    // Upsert the user balance
    const updatedUserBalance = await prisma.fiatWallet
      .update({
        where: {
          id: userBalance!.id,
        },
        data: {
          balance: (userBalance!.balance += amountLessFee),
        },
      })
      .catch((error) => {
        console.log('Error updating user balance: ', error)
        return new GraphQLError('Error updating user balance')
      })

    console.log('Updated User Balance: ', updatedUserBalance)

    // TODO Send User Notifications
    const userDetails =
      (user?.firstName && user?.lastName) == null
        ? user?.phone
        : `${user?.firstName} ${user?.lastName}`
    const mpesaDepositMsg = `Dear ${userDetails}, Mpesa Deposit of Ksh. ${transaction.amount} was successful. You have received USD Assets in your Dollars App Wallet. \n Transaction ID: ${MpesaReceiptNumber}`

    // Send User Notification
    new Notification(
      user!.id,
      transaction.id,
      'Mpesa Deposit',
      { message: mpesaDepositMsg, additionalData: { MpesaReceiptNumber } },
      'Unread',
      'Transaction',
      'InApp',
    ).sendInAppNotification()

    new Notification(
      user!.id,
      transaction.id,
      'Dollars App Mpesa Deposit',
      { message: mpesaDepositMsg, additionalData: { MpesaReceiptNumber } },
      'Sent',
      'Transaction',
      'Email',
    ).sendEmailNotification()

    if (user?.phone) {
      new Notification(
        user!.id,
        transaction.id,
        'Dollars App Mpesa Deposit',
        { message: mpesaDepositMsg },
        'Sent',
        'Transaction',
        'SMS',
      ).sendSMSNotification(user.phone)
    }

    return res.send({
      msg: 'Success Mpesa C2B STK Transaction',
      data: transaction,
    })
  }
  return res.send({
    msg: 'Failed Mpesa C2B STK Transaction',
    data: stkCallback,
  })
})

// TIMEOUT ROUTER API
router.post('/mps/c2b-callback-test', async (req: Request, res: Response) => {
  console.log('C2B Callback: ', req.body)
  res.send('C2B Callback')
})

export { router as c2bCallbackRouter }
