import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const Transaction = objectType({
  name: Model.Transaction.$name,
  description: Model.Transaction.$description,
  definition: (t) => {
    t.field(Model.Transaction.id)
    t.field(Model.Transaction.invoiceNumber)
    t.field(Model.Transaction.paymentSecureId)
    t.field(Model.Transaction.phone)
    t.field(Model.Transaction.type)
    t.field(Model.Transaction.ad)
    t.field(Model.Transaction.adId)
    t.field(Model.Transaction.receiver)
    t.field(Model.Transaction.receiverId)
    t.field(Model.Transaction.receiverAddress)
    t.field(Model.Transaction.amount)
    t.field(Model.Transaction.amountReceived)
    t.field(Model.Transaction.quantity)
    t.field(Model.Transaction.fiat)
    t.field(Model.Transaction.fiatId)
    t.field(Model.Transaction.coin)
    t.field(Model.Transaction.coinId)
    t.field(Model.Transaction.paymentMethod)
    t.field(Model.Transaction.paymentMethodId)
    t.field(Model.Transaction.status)
    t.field(Model.Transaction.paymentUrl)
    t.field(Model.Transaction.note)
    t.field(Model.Transaction.createdAt)
    t.field(Model.Transaction.updatedAt)
  },
})

export const TransactionCreateResponse = objectType({
  name: 'TransactionCreateResponse',
  definition(t) {
    t.field('success', { type: 'Boolean' })
    t.field('message', { type: 'String' })
    t.field('transaction', { type: 'Transaction' })
  },
})
