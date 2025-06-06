// MPESA DEPOSIT RESOLVER
import axios from 'axios'
import { extendType, arg, nonNull } from 'nexus'
import { removeEmpty } from '../../helper'
import {
  formatMpesaNumber,
  generateAuthToken,
  generatePassword,
} from './helpers'
import {
  TransactionDirection,
  TransactionInfo,
  TransactionStatus,
  TransactionType,
  TransferMethod,
} from 'nexus-prisma'
export const mpesaDeposit = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('mpesaDeposit', {
      type: 'MpesaDepositResponse',
      args: {
        data: nonNull(arg({ type: 'MpesaDepositWhereInput' })),
      },
      resolve: async (_, args, { prisma, user, req }) => {
        const { data } = removeEmpty(args)
        const { amount, phone } = data
        console.log('Mpesa Deposit Data: ', data, amount, phone, user?.id)

        if (!user) {
          throw new Error('User not Authenticated')
        }
        // Get Current User
        const currentUser = await prisma.user.findFirst({
          where: { OR: [{ id: user?.id }, { phone }] },
        })

        console.log('Current User: ', currentUser)

        // STK PUSH PARAMS

        const formatedPhone = formatMpesaNumber(phone)
        const _amount = Number(amount)
        const shortCode = process.env.SHORTCODE
        const { password, timestamp } = generatePassword()
        const accessTokenObj = await generateAuthToken()
        const accessToken = accessTokenObj.access_token

        // STK PUSH REQUEST
        const url = process.env.STK_PUSH_URL!
        const callbackURL = `https://${req.hostname}/mps/c2b-callback`

        console.log({
          accessToken,
          accessTokenObj,
          callbackURL,
          password,
          timestamp,
        })

        const stkPayload = {
          BusinessShortCode: shortCode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: _amount,
          PartyA: formatedPhone,
          PartyB: shortCode,
          PhoneNumber: formatedPhone,
          CallBackURL: callbackURL,
          AccountReference: 'Deposit',
          TransactionDesc: 'Deposit to DollarApp',
        }

        console.log('STK Push Params: ', stkPayload)
        try {
          const response = await axios.post(url, stkPayload, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          })

          console.log('STK Push Response: ', response.data)

          //           STK Push Response:  {
          //   MerchantRequestID: 'b9a4-46c2-be40-dbba6e69270c72305614',
          //   CheckoutRequestID: 'ws_CO_25122024110245247757607611',
          //   ResponseCode: '0',
          //   ResponseDescription: 'Success. Request accepted for processing',
          //   CustomerMessage: 'Success. Request accepted for processing'
          // }

          //TODO CHECK IF STK PUSH WAS SUCCESSFUL AND SAVE TO DB
          if (response.data.ResponseCode !== '0') {
            console.log('STK Push Failed: ', response.data.ResponseDescription)
            throw new Error(response.data.ResponseDescription)
          }
          // Get Fiat ID
          const fiat = await prisma.fiat.findFirst({
            where: { name: 'Kenyan Shilling', symbol: 'KES' },
          })
          if (!fiat) {
            throw new Error('Fiat not Supported')
          }

          const pendingDeposit = await prisma.fiatTransaction.create({
            data: {
              invoiceNumber: response.data.CheckoutRequestID,
              amount: _amount,
              type: TransactionType.members[0],
              direction: TransactionDirection.members[0],
              status: TransactionStatus.members[0],
              transactionInfo: TransactionInfo.members[1],
              narations: response.data.ResponseDescription,
              transferMethod: TransferMethod.members[1],
              fiat: {
                connect: {
                  id: fiat.id,
                },
              },
              user: {
                connect: {
                  id: currentUser!.id,
                },
              },
            },
          })
          console.log('Pending Deposit Created: ', pendingDeposit)

          return {
            message: `Deposit Request Sent. Check your phone: ${formatedPhone}`,
            success: true,
          }
        } catch (error) {
          console.log('Error Sending STK Push Request: ', error)
          return { message: 'Failed Sending STK Push Request', success: false }
        }
      },
    })
  },
})
