import { inputObjectType } from 'nexus'

export const SavingCreateInput = inputObjectType({
  name: 'SavingCreateInput',
  definition: (t) => {
    t.nonNull.string('name')
    t.nonNull.string('fiatId')
    t.nonNull.string('amount')
    t.nonNull.field('duration', { type: 'SavingDuration' }) // should enum
    t.string('cryptoAccountId') // optional
  },
})

export const SavingWhereUniqueInput = inputObjectType({
  name: 'SavingWhereUniqueInput',
  definition: (t) => {
    t.id('id')
    t.string('name')
  },
})

export const SavingOrderByInput = inputObjectType({
  name: 'SavingOrderByInput',
  definition: (t) => {
    t.field('createdAt', { type: 'SortOrder' })
    t.field('matureAt', { type: 'SortOrder' })
    t.field('amount', { type: 'SortOrder' })
    t.field('amountEarned', { type: 'SortOrder' })
  },
})
