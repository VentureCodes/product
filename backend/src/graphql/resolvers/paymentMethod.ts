import { arg, extendType, nonNull } from 'nexus'
import { handlePrismaError, removeEmpty } from '../helper'

export const PaymentMethodQuery = extendType({
  type: 'Query',
  definition: (t) => {
    t.nonNull.list.nonNull.field('paymentMethods', {
      type: 'PaymentMethod',
      args: {
        where: arg({
          type: 'PaymentMethodWhereInput',
        }),
        orderBy: arg({
          type: 'PaymentMethodOrderByInput',
        }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where, orderBy } = removeEmpty(args)

        try {
          return await prisma.paymentMethod.findMany({
            where,
            orderBy,
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.nullable.field('paymentMethod', {
      type: 'PaymentMethod',
      args: {
        where: nonNull(
          arg({
            type: 'PaymentMethodWhereUniqueInput',
          }),
        ),
      },
      resolve: async (_, args, { prisma }) => {
        const { where } = removeEmpty(args)

        try {
          return await prisma.paymentMethod.findUnique({ where })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})

export const PaymentMethodMutation = extendType({
  type: 'Mutation',
  definition: (t) => {
    t.field('createPaymentMethod', {
      type: 'PaymentMethod',
      args: {
        data: nonNull(arg({ type: 'PaymentMethodCreateInput' })),
      },
      resolve: async (_, args, { prisma }) => {
        const { data } = removeEmpty(args)

        try {
          return await prisma.paymentMethod.create({ data })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.field('updatePaymentMethod', {
      type: 'PaymentMethod',
      args: {
        where: nonNull(arg({ type: 'PaymentMethodWhereUniqueInput' })),
        data: arg({ type: 'PaymentMethodUpdateInput' }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where, data } = removeEmpty(args)

        try {
          return await prisma.paymentMethod.update({
            where,
            data,
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.field('deletePaymentMethod', {
      type: 'PaymentMethod',
      args: {
        where: nonNull(arg({ type: 'PaymentMethodWhereUniqueInput' })),
      },
      resolve: async (_, args, { prisma }) => {
        const { where } = removeEmpty(args)

        try {
          return await prisma.paymentMethod.delete({ where })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})
