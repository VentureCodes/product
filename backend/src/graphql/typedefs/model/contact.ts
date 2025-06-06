import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const Contact = objectType({
  name: Model.Contact.$name,
  description: Model.Contact.$description,
  definition(t) {
    t.field(Model.Contact.id)
    t.field(Model.Contact.traderId)
    t.field(Model.Contact.email)
    t.field(Model.Contact.twitter)
    t.field(Model.Contact.linkedin)
    t.field(Model.Contact.createdAt)
    t.field(Model.Contact.updatedAt)
    t.field(Model.Contact.trader)
  },
})
