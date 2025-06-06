// MPESA WITHDRAW
import { extendType, arg, nonNull } from 'nexus'
import { removeEmpty, handlePrismaError } from '../../helper'
import { TransactionStatus, TransactionType } from '@prisma/client'
import {
  formatMpesaNumber,
  generateAuthToken,
  generateSecurityCredential,
} from './helpers'
import axios from 'axios'
import { generateInvoiceNumber } from '../../../utils'
import { GraphQLError } from 'graphql'

export const mpesaWithdraw = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('mpesaWithdraw', {
      type: 'MpesaWithdrawResponse',
      args: {
        data: nonNull(arg({ type: 'MpesaWithdrawWhereInput' })),
      },
      resolve: async (_, args, { prisma, user }) => {
        const { data } = removeEmpty(args)
        const { amount, phone } = data

        // Get Current User
        const currentUser = await prisma.user.findFirst({
          where: { OR: [{ id: user?.id }, { phone }] },
        })
        if (!currentUser) {
          throw new GraphQLError('User not found')
        }
        console.log('Current User: ', currentUser)

        //  Get user fiat wallet
        const fiatWallet = await prisma.fiatWallet.findFirst({
          where: { userId: currentUser!.id },
        })
        // Get Fiat Info using fiatId
        const fiatDetails = await prisma.fiat.findFirst({
          where: { id: fiatWallet!.fiatId },
        })

        if (!fiatWallet && !fiatDetails) {
          throw new GraphQLError('Fiat Wallet & Info not found')
        }

        console.log({ fiatWallet, fiatDetails })

        // b2c PUSH PARAMS
        const formatedPhone = formatMpesaNumber(phone)
        const _amount = Number(parseFloat(amount).toFixed(2))
        const OriginatorConversationID = generateInvoiceNumber()
        const InitiatorName = process.env.B2C_INITIATOR_NAME!
        const SecurityCredential = generateSecurityCredential()
        const PartyA = process.env.SHORTCODE!
        const PartyB = formatedPhone
        const Remarks = 'DollarApp MPESA withdrawal'
        const QueueTimeOutURL = process.env.B2C_TIMEOUT_URL!
        const ResultURL = process.env.B2C_RESULT_URL!

        const accessTokenObj = await generateAuthToken()
        const accessToken = accessTokenObj.access_token

        //  B2C REQUEST
        const url = process.env.B2C_URL!

        // TODO implement fee deduction

        const b2cPayload = {
          OriginatorConversationID,
          InitiatorName,
          SecurityCredential,
          CommandID: 'BusinessPayment',
          Amount: _amount,
          PartyA,
          PartyB,
          Remarks,
          QueueTimeOutURL,
          ResultURL,
          Occassion: `DollarApp MPESA withdrawalof KES ${_amount}  to ${formatedPhone} `,
        }

        console.log({ b2cPayload })
        let transaction

        try {
          const response = await axios.post(url, b2cPayload, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          })

          // check if the response is successful
          if (response.data.ResponseCode !== '0') {
            return {
              code: response.data.ResponseCode,
              message: response.data.ResponseDescription,
              data: response.data,
            }
          }

          // TODO deduct fees and create a pending transaction
          console.log('B2C WITHDRAWAL Response: ', response.data)

          transaction = await prisma.fiatTransaction
            .create({
              data: {
                fiatId: fiatWallet!.fiatId,
                invoiceNumber: response.data.OriginatorConversationID,
                amount: _amount,
                status: TransactionStatus.Pending,
                type: TransactionType.Withdrawal,
                paymentSecureId: response.data.ConversationID,
                narations: `${response.data.ConversationID}: DollarApp MPESA withdrawal of KES ${_amount} to ${formatedPhone}`,
                phone: formatedPhone,
                userId: currentUser!.id,
              },
            })
            .catch((error) => {
              console.log('Error creating B2C Transaction: ', error)
              return handlePrismaError(error)
            })

          console.log('Withdraw B2C Transaction: ', transaction)

          //
        } catch (error: any) {
          console.log('B2C WITHDRAWAL Error: ', error.response.data)
          return handlePrismaError(error)
        }
        return {
          code: '200',
          success: true,
          message: `Pending Transaction: ${transaction}`,
        }
      },
    })
  },
})
