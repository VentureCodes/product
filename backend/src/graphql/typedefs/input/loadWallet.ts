import { inputObjectType } from 'nexus'

export const WalletLoadWhereInput = inputObjectType({
  name: 'WalletLoadWhereInput',
  definition(t) {
    t.nonNull.string('amount')
    t.nonNull.string('phone')
    t.nonNull.field('requestAction', { type: 'WalletRequestAction' })
  },
})

export const CompleteWalletLoadWhereInput = inputObjectType({
  name: 'CompleteWalletLoadWhereInput',
  definition(t) {
    t.nonNull.string('id')
    t.string('action')
    t.string('cashier')
  },
})
