import { arg, extendType, intArg } from 'nexus'
import { handlePrismaError, removeEmpty } from '../helper'

export const KlineDataQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.field('klineData', {
      type: 'KlineData',
      args: {
        orderBy: arg({ type: 'KlineDataOrderByInput' }),
      },
      resolve: async (_root, args, { prisma }) => {
        const { orderBy } = removeEmpty(args)
        return await prisma.klineData.findMany({
          orderBy,
        })
      },
    })

    t.list.field('tradeKlineData', {
      type: 'KlineData',
      args: {
        take: intArg(),
        skip: intArg(),
        orderBy: arg({
          type: 'KlineDataOrderByInput',
        }),
        where: arg({
          type: 'KlineDataWhereInput',
        }),
      },

      resolve: async (_root, args, { prisma }) => {
        const { where, take, skip, orderBy } = removeEmpty(args)
        try {
          return await prisma.klineData.findMany({
            where,
            take,
            skip,
            orderBy,
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})
