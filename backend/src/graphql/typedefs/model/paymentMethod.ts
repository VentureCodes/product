import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const PaymentMethod = objectType({
  name: Model.PaymentMethod.$name,
  description: Model.PaymentMethod.$description,
  definition: (t) => {
    t.field(Model.PaymentMethod.id)
    t.field(Model.PaymentMethod.name)
    t.field(Model.PaymentMethod.category)
    t.field(Model.PaymentMethod.country)
    t.field(Model.PaymentMethod.countryId)
    t.field(Model.PaymentMethod.ads)
    t.field(Model.PaymentMethod.isActive)
    t.field(Model.PaymentMethod.createdAt)
    t.field(Model.PaymentMethod.updatedAt)
  },
})
