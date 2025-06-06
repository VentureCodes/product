import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const Strategy = objectType({
  name: Model.Strategy.$name,
  description: Model.Strategy.$description,
  definition(t) {
    t.field(Model.Strategy.id)
    t.field(Model.Strategy.createdAt)
    t.field(Model.Strategy.updatedAt)
    t.field(Model.Strategy.strategyId)
    t.field(Model.Strategy.traderId)
    t.field(Model.Strategy.name)
    t.field(Model.Strategy.description)
    t.field(Model.Strategy.averageReturn)
    t.field(Model.Strategy.riskLevel)
    t.field(Model.Strategy.trade)
  },
})
