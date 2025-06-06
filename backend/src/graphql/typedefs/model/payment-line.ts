import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const PaymentLine = objectType({
  name: Model.PaymentLine.$name,
  description: Model.PaymentLine.$description,
  definition: (t) => {
    t.field(Model.PaymentLine.id)
    t.field(Model.PaymentLine.amount)
    t.field(Model.PaymentLine.paidOn)
    t.field(Model.PaymentLine.photo)
    t.field(Model.PaymentLine.fiatTransactionId)
  },
})
