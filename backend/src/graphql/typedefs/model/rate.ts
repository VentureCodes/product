import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const Rate = objectType({
  name: Model.Rate.$name,
  description: Model.Rate.$description,
  definition: (t) => {
    t.field(Model.Rate.id)
    t.field(Model.Rate.fiat)
    t.field(Model.Rate.rateProvider)
    t.field(Model.Rate.rateProviderId)
    t.field(Model.Rate.buy)
    t.field(Model.Rate.sell)
    t.field(Model.Rate.monthlyChange)
    t.field(Model.Rate.datePosted)
    t.field(Model.Rate.createdAt)
    t.field(Model.Rate.updatedAt)
  },
})
