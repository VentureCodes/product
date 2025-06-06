import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const FiatTransaction = objectType({
  name: Model.FiatTransaction.$name,
  description: Model.FiatTransaction.$description,
  definition: (t) => {
    t.field(Model.FiatTransaction.id)
    t.field(Model.FiatTransaction.invoiceNumber)
    t.field(Model.FiatTransaction.user)
    t.field(Model.FiatTransaction.userId)
    t.field(Model.FiatTransaction.amount)
    t.field(Model.FiatTransaction.fiat)
    t.field(Model.FiatTransaction.fiatId)
    t.field(Model.FiatTransaction.status)
    t.field(Model.FiatTransaction.type)
    t.field(Model.FiatTransaction.narations)
    t.field(Model.FiatTransaction.extra_data)
    t.field(Model.FiatTransaction.isActive)
    t.field(Model.FiatTransaction.isClaimed)
    t.field(Model.FiatTransaction.paymentSecureId)
    t.field(Model.FiatTransaction.paymentLines)
    t.field(Model.FiatTransaction.phone)
    t.field(Model.FiatTransaction.createdAt)
    t.field(Model.FiatTransaction.updatedAt)
    t.field(Model.FiatTransaction.direction)
    t.field(Model.FiatTransaction.transactionInfo)
  },
})
