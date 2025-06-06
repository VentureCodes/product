import { PrismaClient, TransactionType } from '@prisma/client'
import { GraphQLError } from 'graphql'
import { arg, extendType } from 'nexus'
import { IJwtPayload } from 'src/typings'
import { handlePrismaError, removeEmpty } from '../helper'
import {
  MamlakaCurrencyEnum,
  MamlakaWrapper,
  formatPhoneNumberWithCountryCode,
} from './../../utils'

const createTransaction = async (
  prisma: PrismaClient,
  amount: number,
  user: IJwtPayload,
  phone: string,
  sid: string,
) => {
  try {
    return prisma.fiatTransaction.create({
      data: {
        fiat: { connect: { symbol: 'KES' } },
        user: {
          connect: {
            id: user?.id!,
          },
        },
        amount,
        paymentSecureId: sid,
        type: TransactionType.Deposit,
        phone: phone,
      },
    })
  } catch (error: any) {
    return handlePrismaError(error)
  }
}

const createSubscription = async (
  prisma: PrismaClient,
  user: IJwtPayload,
  transaction: any,
) => {
  try {
    return prisma.subscriptionPlan.create({
      data: {
        user: {
          connect: {
            id: user?.id,
          },
        },
        fiatTransaction: {
          connect: {
            id: transaction.id,
          },
        },
        endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      },
    })
  } catch (error: any) {
    return handlePrismaError(error)
  }
}

const handleCardPayment = async (
  mamlakaWrapper: MamlakaWrapper,
  amount: number,
  user: any,
  prisma: PrismaClient,
  phone: string,
  callbackUrl: string,
  _host: string,
) => {
  const generateCardPaymentLink = await mamlakaWrapper.generateCardPaymentLink({
    amount: amount.toString(),
    callbackUrl,
    impalaMerchantId: process.env.MAM_LAKA_USERNAME!,
    redirectUrl: `https://api.dollarapp.me/subscribed/${user?.id}/success/rates`,
    externalId: 'DollarApp',
    currency: MamlakaCurrencyEnum.KES,
  })

  if (!generateCardPaymentLink) {
    throw new GraphQLError(
      'Failed to generate card payment link. Please try again.',
    )
  }
  if (generateCardPaymentLink && !generateCardPaymentLink.error) {
    const transaction = await createTransaction(
      prisma,
      amount,
      user,
      phone,
      generateCardPaymentLink.sid,
    )
    await createSubscription(prisma, user, transaction)
    return {
      msg: generateCardPaymentLink.message,
      status: 'success',
      token: generateCardPaymentLink.paymentUrl,
    }
  }
  return {
    msg: 'Failed to generate card payment link. Please try again.',
    status: 'error',
  }
}

const handleMobilePayment = async (
  mamlakaWrapper: MamlakaWrapper,
  amount: number,
  user: any,
  prisma: PrismaClient,
  phone: string,
  callbackUrl: string,
) => {
  const intiateMobilePayment = await mamlakaWrapper.initiateMobilePayment({
    amount: Number(amount),
    payerPhone: phone,
    callbackUrl: callbackUrl,
    externalId: 'DollarApp',
    currency: MamlakaCurrencyEnum.KES,
  })

  if (!intiateMobilePayment) {
    throw new GraphQLError('Failed to initiate payment. Please try again.')
  }

  console.log(intiateMobilePayment)
  if (intiateMobilePayment && !intiateMobilePayment.error) {
    const transaction = await createTransaction(
      prisma,
      amount,
      user,
      phone,
      intiateMobilePayment.sid,
    )
    await createSubscription(prisma, user, transaction)
    return {
      msg: 'Payment initiated successfully. Please proceed to your phone to enter pin',
      status: 'success',
    }
  }

  return {
    msg: 'Failed to initiate payment. Please try again.',
    status: 'error',
  }
}

export const SubscriptionQuery = extendType({
  type: 'Query',
  definition: (t) => {
    t.nonNull.list.nonNull.field('mySubscriptionPlans', {
      type: 'SubscriptionPlan',
      args: {},
      resolve: async (_, __, { prisma, user }) => {
        try {
          const subscriptions = await prisma.subscriptionPlan.findMany({
            where: { userId: user?.id! },
          })

          return subscriptions
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})

export const SubscriptionMutation = extendType({
  type: 'Mutation',
  definition: (t) => {
    t.field('subscribeToPlan', {
      type: 'AuthResponse',
      args: {
        data: arg({
          type: 'SubscriptionInput',
        }),
      },
      resolve: async (_, args, { prisma, user, req, mamlakaSession }) => {
        const { data } = removeEmpty(args)
        const phone = formatPhoneNumberWithCountryCode(data.phone)
        const amount = 2
        const mamlakaWrapper = new MamlakaWrapper(
          process.env.MAM_LAKA_BASE_URL! as string,
          process.env.MAM_LAKA_USERNAME! as string,
          mamlakaSession.session!,
        )

        console.log('Host', `https://${req.get('host')}`)

        const host =
          process.env.NODE_ENV === 'development'
            ? process.env.BASE_URL!
            : `https://${req.get('host')}`

        const callbackUrl = `https://api.dollarapp.me/payments/mam-laka/subscription/callbackurl`

        console.log('Callbacks URL', callbackUrl)

        if (data.payment_method === 'card') {
          return await handleCardPayment(
            mamlakaWrapper,
            amount,
            user,
            prisma,
            phone,
            callbackUrl,
            host,
          )
        }

        return await handleMobilePayment(
          mamlakaWrapper,
          amount,
          user,
          prisma,
          phone,
          callbackUrl,
        )
      },
    })
  },
})
