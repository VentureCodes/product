import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const Fiat = objectType({
  name: Model.Fiat.$name,
  description: Model.Fiat.$description,
  definition: (t) => {
    t.field(Model.Fiat.id)
    t.field(Model.Fiat.name)
    t.field(Model.Fiat.symbol)
    t.field(Model.Fiat.country)
    t.field(Model.Fiat.countryId)
    t.field(Model.Fiat.isActive)
    t.field(Model.Fiat.createdAt)
    t.field(Model.Fiat.updatedAt)
    t.field(Model.Fiat.ads)
  },
})
