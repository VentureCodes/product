import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const Category = objectType({
  name: Model.Category.$name,
  description: Model.Category.$description,
  definition: (t) => {
    t.field(Model.Category.id)
    t.field(Model.Category.name)
    t.field(Model.Category.icon)
    t.field(Model.Category.feeds)
    t.field(Model.Category.createdAt)
    t.field(Model.Category.updatedAt)
  },
})
