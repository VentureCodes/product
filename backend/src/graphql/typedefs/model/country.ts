import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const Country = objectType({
  name: Model.Country.$name,
  description: Model.Country.$description,
  definition: (t) => {
    t.field(Model.Country.id)
    t.field(Model.Country.name)
    t.field(Model.Country.code)
    t.field(Model.Country.dial)
    t.field(Model.Country.currency)
    t.field(Model.Country.flag)
    t.field(Model.Country.fiat)
    t.field(Model.Country.paymentMethods)
    t.field(Model.Country.isActive)
    t.field(Model.Country.createdAt)
    t.field(Model.Country.updatedAt)
  },
})
