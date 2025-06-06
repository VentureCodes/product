import { inputObjectType } from 'nexus'

export const CryptoTransactionWhereUniqueInput = inputObjectType({
  name: 'CryptoTransactionWhereUniqueInput',
  definition(t) {
    t.string('id')
    t.string('hash')
  },
})

export const CryptoTransactionWhereInput = inputObjectType({
  name: 'CryptoTransactionWhereInput',
  definition(t) {
    t.string('userId')
    t.string('from')
    t.string('to')
    t.field('status', { type: 'TransactionStatus' })
    t.field('type', { type: 'TransactionType' })
    t.dateTime('createdAt')
  },
})

export const CryptoTransactionOrderByInput = inputObjectType({
  name: 'CryptoTransactionOrderByInput',
  definition(t) {
    t.field('createdAt', { type: 'SortOrder' })
    t.field('updatedAt', { type: 'SortOrder' })
    t.field('value', { type: 'SortOrder' })
  },
})

export const CryptoTransactionCreateInput = inputObjectType({
  name: 'CryptoTransactionCreateInput',
  definition(t) {
    t.string('userId')
    t.string('hash')
    t.string('blockNumber')
    t.string('timeStamp')
    t.string('from')
    t.string('to')
    t.float('value')
    t.string('gas')
    t.string('gasPrice')
    t.string('txreceipt_status')
    t.string('methodId')
    t.string('tokenAddress')
    t.string('tokenSymbol')
    t.field('status', { type: 'TransactionStatus' })
    t.field('type', { type: 'TransactionType' })
  },
})

export const CryptoTransactionStatusUpdateInput = inputObjectType({
  name: 'CryptoTransactionStatusUpdateInput',
  definition(t) {
    t.string('hash')
    t.field('status', { type: 'TransactionStatus' })
  },
})

export const SwapCryptoTransactionCreateInput = inputObjectType({
  name: 'SwapCryptoTransactionCreateInput',
  definition(t) {
    t.string('tokenIn')
    t.string('tokenOut')
    t.string('amountIn')
  },
})

export const GetTokenPriceInput = inputObjectType({
  name: 'GetTokenPriceInput',
  definition(t) {
    t.string('symbol')
  },
})