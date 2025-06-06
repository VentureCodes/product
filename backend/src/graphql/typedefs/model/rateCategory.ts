import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const RateCategory = objectType({
  name: Model.RateCategory.$name,
  description: Model.RateCategory.$description,
  definition: (t) => {
    t.field(Model.RateCategory.id)
    t.field(Model.RateCategory.name)
    t.field(Model.RateCategory.description)
    t.field(Model.RateCategory.icon)
    t.field(Model.RateCategory.isActive)
    t.field(Model.RateCategory.createdAt)
    t.field(Model.RateCategory.updatedAt)
    t.field(Model.RateCategory.rateProviders)
  },
})
