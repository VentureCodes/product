import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const Trade = objectType({
  name: Model.Trade.$name,
  description: Model.Trade.$description,
  definition(t) {
    t.field(Model.Trade.id)
    t.field(Model.Trade.tradeSignal)
    t.field(Model.Trade.entryPrice)
    t.field(Model.Trade.takeProfit)
    t.field(Model.Trade.stopLoss)
    t.field(Model.Trade.token)
    t.field(Model.Trade.tokenImage)
    t.field(Model.Trade.shillId)
    t.field(Model.Trade.Shill)
    t.field(Model.Trade.klineData)
    t.field(Model.Trade.createdAt)
    t.field(Model.Trade.updatedAt)
  },
})
