import { inputObjectType } from 'nexus'

export const RateWhereUniqueInput = inputObjectType({
  name: 'RateWhereUniqueInput',
  definition(t) {
    t.string('id')
  },
})

export const RateWhereInput = inputObjectType({
  name: 'RateWhereInput',
  definition(t) {
    t.string('fiatId')
    t.string('rateProviderId')
    t.boolean('isActive')
    t.field('datePosted', { type: 'DateTime' })
  },
})

export const RateOrderByInput = inputObjectType({
  name: 'RateOrderByInput',
  definition(t) {
    t.field('buy', { type: 'SortOrder' })
    t.field('sell', { type: 'SortOrder' })
    t.field('monthlyChange', { type: 'SortOrder' })
    t.field('datePosted', { type: 'SortOrder' })
    t.field('createdAt', { type: 'SortOrder' })
    t.field('updatedAt', { type: 'SortOrder' })
  },
})

export const RateCreateInput = inputObjectType({
  name: 'RateCreateInput',
  definition(t) {
    t.string('fiatId')
    t.string('rateProviderId')
    t.float('buy')
    t.float('sell')
    t.float('monthlyChange')
    t.field('datePosted', { type: 'DateTime' })
  },
})

export const RateUpdateInput = inputObjectType({
  name: 'RateUpdateInput',
  definition(t) {
    t.string('fiatId')
    t.string('rateProviderId')
    t.float('buy')
    t.float('sell')
    t.float('monthlyChange')
    t.boolean('isActive')
    t.field('datePosted', { type: 'DateTime' })
  },
})
