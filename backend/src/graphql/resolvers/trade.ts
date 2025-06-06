import { arg, extendType, nonNull } from 'nexus'
import { coinmarketClient } from '../../utils/request'
import { handlePrismaError, removeEmpty } from '../helper'
import PlacingTrades from './trading'

export const TradeQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.field('trades', {
      type: 'Trade',
      args: {
        orderBy: arg({ type: 'TradeOrderByInput' }),
      },
      resolve: async (_root, args, { prisma }) => {
        const { orderBy } = removeEmpty(args)
        return await prisma.trade.findMany({
          orderBy,
        })
      },
    })

    t.field('trade', {
      type: 'Trade',
      args: {
        where: nonNull(arg({ type: 'TradeWhereUniqueInput' })),
      },
      resolve: async (_root, args, { prisma }) => {
        const { where } = removeEmpty(args)
        return await prisma.trade.findUnique({
          where,
        })
      },
    })
  },
})

export const TradeMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('trade', {
      type: 'Trade',
      description: 'Create a new trade',
      // args: {
      //   tradeSignal: nonNull(arg({ type: 'String' })),
      //   entryPrice: nonNull(arg({ type: 'Float' })),
      //   takeProfit: nonNull(arg({ type: 'Float' })),
      //   stopLoss: nonNull(arg({ type: 'Float' })),
      //   shillId: nonNull(arg({ type: 'String' })),
      // },
      args: {
        data: nonNull(arg({ type: 'TradeWhereInput' })),
      },
      resolve: async (_root, args, { prisma }) => {
        const { data } = removeEmpty(args)

        try {
          const trade = await prisma.trade.create({ data })

          await PlacingTrades(trade)

          const tokenMetadata = await coinmarketClient
            .get(`/v1/cryptocurrency/info`, {
              params: {
                symbol: trade.token.replace('USDT', ''),
              },
            })
            .catch((error) => {
              console.log(error.response.data)
            })

          if (tokenMetadata?.data?.data) {
            const tokenData =
              tokenMetadata.data.data[trade.token.replace('USDT', '')]

            await prisma.trade.update({
              where: {
                id: trade.id,
              },
              data: {
                tokenImage: tokenData?.logo || '',
              },
            })
          }
          return trade
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})
