import { inputObjectType } from 'nexus'

export const TradeInformationWhereUniqueInput = inputObjectType({
  name: 'TradeInformationWhereUniqueInput',
  definition(t) {
    t.string('id')
  },
})

export const TradeInformationWhereInput = inputObjectType({
  name: 'TradeInformationWhereInput',
  definition(t) {
    t.float('unrealizedProfit')
    t.float('realizedProfit')
    t.float('totalInvestment')
    t.float('pnl')
    t.float('totalReturn')
    t.string('bybitOrderId')
    t.string('status')
    t.string('orderType')
    t.float('currentPrice')
    t.float('takeProfit')
    t.float('stopLoss')
    t.float('closedSize')
    t.float('cumEntryValue')
    t.float('avgEntryPrice')
    t.float('cumExitValue')
    t.float('avgExitPrice')
    t.float('closedPnl')
    t.float('fillCount')
    t.field('side', { type: 'OrderSide' })
    t.field('trade', { type: 'TradeWhereInput' })
    t.field('copyTrades', { type: 'CopyTradeWhereInput' })
  },
})

export const TradeInformationCreateInput = inputObjectType({
  name: 'TradeInformationCreateInput',
  definition(t) {
    t.float('unrealizedProfit')
    t.float('realizedProfit')
    t.float('totalInvestment')
    t.float('pnl')
    t.float('totalReturn')
    t.field('trade', { type: 'TradeWhereInput' })
  },
})

export const TradeInformationOrderByInput = inputObjectType({
  name: 'TradeInformationOrderByInput',
  definition(t) {
    t.field('unrealizedProfit', { type: 'SortOrder' })
    t.field('realizedProfit', { type: 'SortOrder' })
    t.field('totalInvestment', { type: 'SortOrder' })
    t.field('status', { type: 'SortOrder' })
  },
})

export const TradeInformationUpdateInput = inputObjectType({
  name: 'TradeInformationUpdateInput',
  definition(t) {
    t.float('unrealizedProfit')
    t.float('realizedProfit')
    t.float('totalInvestment')
    t.float('pnl')
    t.float('totalReturn')
  },
})
