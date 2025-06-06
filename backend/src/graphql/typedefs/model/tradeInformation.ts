import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const TradeInformation = objectType({
  name: Model.TradeInformation.$name,
  description: Model.TradeInformation.$description,
  definition(t) {
    t.field(Model.TradeInformation.id)
    t.field(Model.TradeInformation.unrealizedProfit)
    t.field(Model.TradeInformation.realizedProfit)
    t.field(Model.TradeInformation.copyTrades)
    t.field(Model.TradeInformation.trade)
    t.field(Model.TradeInformation.totalInvestment)
    t.field(Model.TradeInformation.pnl)
    t.field(Model.TradeInformation.totalReturn)
    t.field(Model.TradeInformation.status)
    t.field(Model.TradeInformation.bybitOrderId)
    t.field(Model.TradeInformation.side)
    t.field(Model.TradeInformation.closedSize)
    t.field(Model.TradeInformation.takeProfit)
    t.field(Model.TradeInformation.stopLoss)
    t.field(Model.TradeInformation.cumEntryValue)
    t.field(Model.TradeInformation.cumExitValue)
    t.field(Model.TradeInformation.avgExitPrice)
    t.field(Model.TradeInformation.avgEntryPrice)
    t.field(Model.TradeInformation.closedPnl)
    t.field(Model.TradeInformation.fillCount)
    t.field(Model.TradeInformation.createdAt)
    t.field(Model.TradeInformation.updatedAt)
  },
})
