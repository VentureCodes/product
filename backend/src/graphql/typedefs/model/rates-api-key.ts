import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

// Object type for API keys
export const ApiKey = objectType({
  name: Model.ApiKey.$name,
  description: Model.ApiKey.$description,
  definition: (t) => {
    t.field(Model.ApiKey.id)
    t.field(Model.ApiKey.key)
    t.field(Model.ApiKey.userId)
    t.boolean('isActive')
    t.field(Model.ApiKey.createdAt)
    t.field(Model.ApiKey.updatedAt)
    t.field(Model.ApiKey.expiresAt)
  },
})
