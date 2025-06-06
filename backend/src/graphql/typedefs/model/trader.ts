import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const Trader = objectType({
  name: Model.Trader.$name,
  description: Model.Trader.$description,
  definition(t) {
    t.field(Model.Trader.id)
    t.field(Model.Trader.name)
    t.field(Model.Trader.yearOfExperience)
    t.field(Model.Trader.tradingStyle)
    t.field(Model.Trader.averageReturn)
    t.field(Model.Trader.platform)
    t.field(Model.Trader.followers)
    t.field(Model.Trader.tradesCopied)
    t.field(Model.Trader.successRate)
    t.field(Model.Trader.riskLevel)
    t.field(Model.Trader.bio)
    t.field(Model.Trader.photo)
    t.field(Model.Trader.contact)
    t.field(Model.Trader.strategies)
    t.field(Model.Trader.performanceHistory)
    t.field(Model.Trader.createdAt)
    t.field(Model.Trader.updatedAt)
  },
})
