import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const ApiKeyUsage = objectType({
  name: Model.ApiKeyUsage.$name,
  definition(t) {
    t.field(Model.ApiKeyUsage.id)
    t.field(Model.ApiKeyUsage.apiKeyId)
    t.field(Model.ApiKeyUsage.date)
    t.field(Model.ApiKeyUsage.usageCount)
    t.field(Model.ApiKeyUsage.apiKey)
  },
})
