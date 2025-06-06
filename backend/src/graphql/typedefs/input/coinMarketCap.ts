import { inputObjectType } from 'nexus'

export const GainerAndLooserOrderByInput = inputObjectType({
  name: 'GainerAndLooserOrderByInput',
  definition(t) {
    t.field('createdAt', { type: 'SortOrder' })
    t.field('updatedAt', { type: 'SortOrder' })
    t.field('current_price', { type: 'SortOrder' })
    t.field('market_cap', { type: 'SortOrder' })
    t.field('percent_change_1h', { type: 'SortOrder' })
    t.field('market_cap_rank', { type: 'SortOrder' })
    t.field('max_supply', { type: 'SortOrder' })
    t.field('total_supply', { type: 'SortOrder' })
    t.field('high_24h', { type: 'SortOrder' })
    t.field('low_24h', { type: 'SortOrder' })
  },
})
