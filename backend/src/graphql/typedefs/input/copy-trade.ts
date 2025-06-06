import { inputObjectType } from 'nexus'

export const CopyTradeWhereUniqueInput = inputObjectType({
  name: 'CopyTradeWhereUniqueInput',
  definition(t) {
    t.nonNull.string('id')
  },
})

export const CopyTradeWhereInput = inputObjectType({
  name: 'CopyTradeWhereInput',
  definition(t) {
    t.nonNull.string('traderId')
    t.nonNull.string('leverage')
    t.nonNull.string('token')
    t.nonNull.string('period')
    t.nonNull.string('amount')
    t.nonNull.string('copyType')
  },
})

export const CopyStatusInput = inputObjectType({
  name: 'CopyStatusInput',
  definition(t) {
    t.field('status', { type: 'CopyStatus' })
  },
})

export const CopyTradeWhereOrderByInput = inputObjectType({
  name: 'CopyTradeWhereOrderByInput',
  definition: (t) => {
    t.field('createdAt', { type: 'SortOrder' })
  },
})

export const TraderWhereInput = inputObjectType({
  name: 'TraderWhereInput',
  definition(t) {
    t.string('name')
  },
})

export const WithdrawCryptoInput = inputObjectType({
  name: 'WithdrawCryptoInput',
  definition(t) {
    t.nonNull.string('to')
    t.nonNull.string('token')
    t.nonNull.string('amount')
  },
})

export const SwapTokenInput = inputObjectType({
  name: 'SwapTokenInput',
  definition(t) {
    t.nonNull.string('tokenIn')
    t.nonNull.string('tokenOut')
    t.nonNull.string('amountIn')
  },
})

export const ShillWhereOrderByInput = inputObjectType({
  name: 'ShillWhereOrderByInput',
  definition: (t) => {
    t.field('createdAt', { type: 'SortOrder' })
  },
})
