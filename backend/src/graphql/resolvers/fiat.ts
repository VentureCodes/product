import { arg, extendType, nonNull } from 'nexus'
import { handlePrismaError, removeEmpty } from '../helper'

export const FiatQuery = extendType({
  type: 'Query',
  definition: (t) => {
    t.nonNull.list.nonNull.field('fiats', {
      type: 'Fiat',
      args: {
        where: arg({
          type: 'FiatWhereInput',
        }),
        orderBy: arg({
          type: 'FiatOrderByInput',
        }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where, orderBy } = removeEmpty(args)

        try {
          return await prisma.fiat.findMany({
            where,
            orderBy,
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.nullable.field('fiat', {
      type: 'Fiat',
      args: {
        where: arg({
          type: 'FiatWhereUniqueInput',
        }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where } = removeEmpty(args)

        try {
          return await prisma.fiat.findUnique({ where })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})

export const FiatMutation = extendType({
  type: 'Mutation',
  definition: (t) => {
    t.field('createFiat', {
      type: 'Fiat',
      args: {
        data: nonNull(arg({ type: 'FiatCreateInput' })),
      },
      resolve: async (_, args, { prisma }) => {
        const { data } = removeEmpty(args)

        try {
          return await prisma.fiat.create({ data })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.field('updateFiat', {
      type: 'Fiat',
      args: {
        where: nonNull(arg({ type: 'FiatWhereUniqueInput' })),
        data: arg({ type: 'FiatUpdateInput' }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where, data } = removeEmpty(args)

        try {
          return await prisma.fiat.update({ where, data })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.field('deleteFiat', {
      type: 'Fiat',
      args: {
        where: nonNull(arg({ type: 'FiatWhereUniqueInput' })),
      },
      resolve: async (_, args, { prisma }) => {
        const { where } = removeEmpty(args)

        try {
          return await prisma.fiat.delete({ where })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})
