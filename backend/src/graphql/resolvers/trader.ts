import { arg, extendType } from 'nexus'
import { handlePrismaError, removeEmpty } from '../helper'

export const TraderQuery = extendType({
  type: 'Query',
  definition: (t) => {
    t.nonNull.list.field('traders', {
      type: 'Shill',
      args: {
        where: arg({ type: 'ShillWhereUniqueInput' }),
        orderBy: arg({ type: 'ShillOrderByInput' }),
      },
      resolve: async (_, args, { prisma }) => {
        try {
          const { where, orderBy } = removeEmpty(args)
          return prisma.shill.findMany({
            where,
            orderBy,
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    //Query trader with their trades
    t.field('Trades', {
      type: 'Shill',
      args: {
        where: arg({ type: 'ShillWhereUniqueInput' }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where } = removeEmpty(args)
        try {
          return await prisma.shill.findUnique({
            where,
            include: {
              CopyTrade: true,
            },
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})

export const TraderMutation = extendType({
  type: 'Mutation',
  definition: (t) => {
    t.nonNull.field('createTrader', {
      type: 'Shill',
      args: {
        data: arg({ type: 'ShillCreateInput' }),
      },
      resolve: async (_, args, { prisma }) => {
        try {
          const { data } = removeEmpty(args)
          return await prisma.shill.create({
            data,
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.nonNull.field('updateTrader', {
      type: 'Shill',
      args: {
        where: arg({ type: 'ShillWhereUniqueInput' }),
        data: arg({ type: 'ShillUpdateInput' }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where, data } = removeEmpty(args)
        try {
          return await prisma.shill.update({
            where,
            data,
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.nonNull.field('deleteTrader', {
      type: 'Shill',
      args: {
        where: arg({ type: 'ShillWhereUniqueInput' }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where } = removeEmpty(args)
        try {
          return await prisma.shill.delete({
            where,
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})
