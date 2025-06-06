import { inputObjectType } from 'nexus'

export const LoadFiatWalletWithMpesaInput = inputObjectType({
  name: 'LoadFiatWalletMpesaInput',
  definition(t) {
    t.string('phone')
    t.string('amount')
  },
})

export const LoadFiatWalletWithCardInput = inputObjectType({
  name: 'LoadFiatWalletWithCardInput',
  definition(t) {
    t.string('amount')
  },
})

export const FiatWalletSendMoneyInput = inputObjectType({
  name: 'FiatWalletSendMoneyInput',
  definition(t) {
    t.string('amount')
    t.string('phone')
  },
})

export const FiatTransactionWhereInput = inputObjectType({
  name: 'FiatTransactionWhereInput',
  definition(t) {
    t.string('id')
    t.string('type')
    t.string('invoiceNumber')
    t.string('status')
    t.string('phone')
  },
})

export const FiatTransactionOrderByInput = inputObjectType({
  name: 'FiatTransactionOrderByInput',
  definition: (t) => {
    t.field('type', { type: 'SortOrder' })
    t.field('createdAt', { type: 'SortOrder' })
    t.field('invoiceNumber', { type: 'SortOrder' })
  },
})

export const GetFiatTransaction = inputObjectType({
  name: 'GetFiatTransaction',
  definition(t) {
    t.string('id')
  },
})
