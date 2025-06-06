import { arg, extendType, intArg, nonNull } from 'nexus'
import { handlePrismaError, removeEmpty } from '../helper'

export const CoinQuery = extendType({
  type: 'Query',
  definition: (t) => {
    t.nonNull.list.nonNull.field('coins', {
      type: 'Coin',
      args: {
        where: arg({
          type: 'CoinWhereInput',
        }),
        take: intArg(),
        skip: intArg(),
        orderBy: arg({
          type: 'CoinOrderByInput',
        }),
      },

      resolve: async (_, args, { prisma }) => {
        const { where, take, skip, orderBy } = removeEmpty(args)

        try {
          return await prisma.coin.findMany({
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

    t.nullable.field('coin', {
      type: 'Coin',
      args: {
        where: nonNull(
          arg({
            type: 'CoinWhereUniqueInput',
          }),
        ),
      },
      resolve: async (_, args, { prisma }) => {
        const { where } = removeEmpty(args)

        try {
          return await prisma.coin.findUnique({ where })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})

export const CoinMutation = extendType({
  type: 'Mutation',
  definition: (t) => {
    t.field('createCoin', {
      type: 'Coin',
      args: {
        data: nonNull(arg({ type: 'CoinCreateInput' })),
      },
      resolve: async (_, args, { prisma }) => {
        const { data } = removeEmpty(args)

        try {
          return await prisma.coin.create({ data })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.field('updateCoin', {
      type: 'Coin',
      args: {
        where: nonNull(arg({ type: 'CoinWhereUniqueInput' })),
        data: arg({ type: 'CoinUpdateInput' }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where, data } = removeEmpty(args)

        try {
          return await prisma.coin.update({ where, data })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.field('deleteCoin', {
      type: 'Coin',
      args: {
        where: nonNull(arg({ type: 'CoinWhereUniqueInput' })),
      },
      resolve: async (_, args, { prisma }) => {
        const { where } = removeEmpty(args)

        try {
          return await prisma.coin.delete({ where })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})
