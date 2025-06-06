import { inputObjectType } from 'nexus'

export const RateProviderWhereUniqueInput = inputObjectType({
  name: 'RateProviderWhereUniqueInput',
  definition(t) {
    t.string('id')
  },
})

export const RateProviderWhereInput = inputObjectType({
  name: 'RateProviderWhereInput',
  definition(t) {
    t.string('name')
    t.string('rateCategoryId')
    t.string('country')
    t.boolean('isActive')
  },
})

export const RateProviderOrderByInput = inputObjectType({
  name: 'RateProviderOrderByInput',
  definition(t) {
    t.field('name', { type: 'SortOrder' })
    t.field('createdAt', { type: 'SortOrder' })
    t.field('updatedAt', { type: 'SortOrder' })
  },
})

export const RateProviderCreateInput = inputObjectType({
  name: 'RateProviderCreateInput',
  definition(t) {
    t.string('name')
    t.string('icon')
    t.string('country')
    t.string('rateCategoryId')
  },
})

export const RateProviderUpdateInput = inputObjectType({
  name: 'RateProviderUpdateInput',
  definition(t) {
    t.string('name')
    t.string('icon')
    t.string('country')
    t.string('rateCategoryId')
    t.boolean('isActive')
  },
})
