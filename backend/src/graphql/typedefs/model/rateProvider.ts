import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const RateProvider = objectType({
  name: Model.RateProvider.$name,
  description: Model.RateProvider.$description,
  definition: (t) => {
    t.field(Model.RateProvider.id)
    t.field(Model.RateProvider.name)
    t.field(Model.RateProvider.icon)
    t.field(Model.RateProvider.country)
    t.field(Model.RateProvider.isActive)
    t.field(Model.RateProvider.createdAt)
    t.field(Model.RateProvider.updatedAt)
    t.field(Model.RateProvider.rates)
    t.field(Model.RateProvider.rateCategory)
  },
})
