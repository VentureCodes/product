import { inputObjectType } from 'nexus'

export const TradeWhereUniqueInput = inputObjectType({
  name: 'TradeWhereUniqueInput',
  definition(t) {
    t.string('id')
  },
})

export const TradeWhereInput = inputObjectType({
  name: 'TradeWhereInput',
  definition(t) {
    t.field('tradeSignal', { type: 'OrderSide' })
    t.float('entryPrice')
    t.float('takeProfit')
    t.float('stopLoss')
    t.string('shillId')
    t.string('token')
  },
})

export const TradeOrderByInput = inputObjectType({
  name: 'TradeOrderByInput',
  definition(t) {
    t.field('createdAt', { type: 'SortOrder' })
  },
})
