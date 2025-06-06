import { inputObjectType } from 'nexus'

// Input type for querying a unique ApiKeyUsage by ID
export const ApiKeyUsageWhereUniqueInput = inputObjectType({
  name: 'ApiKeyUsageWhereUniqueInput',
  definition(t) {
    t.string('id')
  },
})

// Input type for filtering ApiKeyUsage based on criteria
export const ApiKeyUsageWhereInput = inputObjectType({
  name: 'ApiKeyUsageWhereInput',
  definition(t) {
    t.string('apiKeyId') // Filter by API key
    t.string('date') // Optionally filter by date
  },
})

// Input type for ordering ApiKeyUsage
export const ApiKeyUsageOrderByInput = inputObjectType({
  name: 'ApiKeyUsageOrderByInput',
  definition(t) {
    t.field('date', { type: 'SortOrder' }) // Allow ordering by date
    t.field('usageCount', { type: 'SortOrder' }) // Allow ordering by usage count
  },
})

// Input type for creating an ApiKeyUsage entry
export const ApiKeyUsageCreateInput = inputObjectType({
  name: 'ApiKeyUsageCreateInput',
  definition(t) {
    t.string('apiKeyId')
    t.string('date')
    t.int('usageCount')
  },
})

// Input type for updating an existing ApiKeyUsage entry
export const ApiKeyUsageUpdateInput = inputObjectType({
  name: 'ApiKeyUsageUpdateInput',
  definition(t) {
    t.int('usageCount')
  },
})
