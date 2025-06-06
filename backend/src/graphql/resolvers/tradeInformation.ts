import { arg, extendType, intArg } from 'nexus'
import { handlePrismaError, removeEmpty } from '../helper'

export const TradeInformationQuery = extendType({
  type: 'Query',
  definition: (t) => {
    t.list.field('tradeInformation', {
      type: 'TradeInformation',
      args: {
        where: arg({ type: 'TradeInformationWhereInput' }),
        orderBy: arg({ type: 'TradeInformationOrderByInput' }),
        take: intArg(),
        skip: intArg(),
      },
      resolve: async (_, args, { prisma }) => {
        try {
          const { where, orderBy, take, skip } = removeEmpty(args)
          const tradeInfo = await prisma.tradeInformation.findMany({
            include: {
              copyTrades: true,
            },
            where,
            orderBy,
            take,
            skip,
          })
          return tradeInfo
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})

export const TradeInformationMutation = extendType({
  type: 'Mutation',
  definition: (t) => {
    t.nonNull.field('createTradeInformation', {
      type: 'TradeInformation',
      args: {
        data: arg({ type: 'TradeInformationCreateInput' }),
      },
      resolve: async (_, args, { prisma }) => {
        try {
          const { data } = removeEmpty(args)
          return await prisma.tradeInformation.create({
            data,
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.nonNull.field('updateTradeInformation', {
      type: 'TradeInformation',
      args: {
        where: arg({ type: 'TradeInformationWhereUniqueInput' }),
        data: arg({ type: 'TradeInformationUpdateInput' }),
      },
      resolve: async (_, args, { prisma }) => {
        try {
          const { where, data } = removeEmpty(args)
          return await prisma.tradeInformation.update({
            where,
            data,
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.nonNull.field('deleteTradeInformation', {
      type: 'TradeInformation',
      args: {
        where: arg({ type: 'TradeInformationWhereUniqueInput' }),
      },
      resolve: async (_, args, { prisma }) => {
        try {
          const { where } = removeEmpty(args)

          return await prisma.tradeInformation.delete({
            where,
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})
