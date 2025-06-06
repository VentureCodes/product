import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const CryptoTransaction = objectType({
  name: Model.CryptoTransaction.$name,
  description: Model.CryptoTransaction.$description,
  definition: (t) => {
    t.field(Model.CryptoTransaction.id)
    t.field(Model.CryptoTransaction.userId)
    t.field(Model.CryptoTransaction.hash)
    t.field(Model.CryptoTransaction.blockNumber)
    t.field(Model.CryptoTransaction.timeStamp)
    t.field(Model.CryptoTransaction.from)
    t.field(Model.CryptoTransaction.to)
    t.field(Model.CryptoTransaction.value)
    t.field(Model.CryptoTransaction.gas)
    t.field(Model.CryptoTransaction.gasPrice)
    t.field(Model.CryptoTransaction.txreceipt_status)
    t.field(Model.CryptoTransaction.methodId)
    t.field(Model.CryptoTransaction.status)
    t.field(Model.CryptoTransaction.type)
    t.nullable.field(Model.CryptoTransaction.confirmations)
    t.nullable.field(Model.CryptoTransaction.fee)
    t.nullable.field(Model.CryptoTransaction.transactionIndex)
    t.nullable.field(Model.CryptoTransaction.gasUsed)
    t.nullable.field(Model.CryptoTransaction.errorMessage)
    t.field(Model.CryptoTransaction.user)
    t.field(Model.CryptoTransaction.tokenAddress)
    t.field(Model.CryptoTransaction.tokenSymbol)
    t.field(Model.CryptoTransaction.toSymbol)
    t.field(Model.CryptoTransaction.createdAt)
    t.field(Model.CryptoTransaction.updatedAt)
  },
})


export const CryptoTokenPrice = objectType({
  name: 'CryptoTokenPrice',

  definition(t) {
    t.nonNull.string('symbol')

    t.nonNull.float('price')
  },
})
