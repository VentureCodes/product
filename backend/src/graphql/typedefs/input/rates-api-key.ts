import { inputObjectType } from 'nexus'

// Input type for querying a unique API key by ID
export const ApiKeyWhereUniqueInput = inputObjectType({
  name: 'ApiKeyWhereUniqueInput',
  definition(t) {
    t.string('id')
    t.string('key')
  },
})

// Input type for filtering API keys based on certain criteria
export const ApiKeyWhereInput = inputObjectType({
  name: 'ApiKeyWhereInput',
  definition(t) {
    t.string('userId')
    t.boolean('isActive')
    t.field('createdAt', { type: 'DateTime' })
    t.field('expiresAt', { type: 'DateTime' })
  },
})

// Input type for ordering API keys
export const ApiKeyOrderByInput = inputObjectType({
  name: 'ApiKeyOrderByInput',
  definition(t) {
    t.field('createdAt', { type: 'SortOrder' })
    t.field('updatedAt', { type: 'SortOrder' })
    t.field('expiresAt', { type: 'SortOrder' })
    t.field('isActive', { type: 'SortOrder' })
  },
})

// Input type for creating a new API key
export const ApiKeyCreateInput = inputObjectType({
  name: 'ApiKeyCreateInput',
  definition(t) {
    t.boolean('isActive')
  },
})

// Input type for updating an existing API key
export const ApiKeyUpdateInput = inputObjectType({
  name: 'ApiKeyUpdateInput',
  definition(t) {
    t.boolean('isActive')
    t.field('expiresAt', { type: 'DateTime' })
  },
})
