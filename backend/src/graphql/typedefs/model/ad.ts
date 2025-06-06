import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const Ad = objectType({
  name: Model.Ad.$name,
  description: Model.Ad.$description,
  definition: (t) => {
    t.field(Model.Ad.id)
    t.field(Model.Ad.advertiser)
    t.field(Model.Ad.advertiserId)
    t.field(Model.Ad.price)
    t.field(Model.Ad.fiat)
    t.field(Model.Ad.fiatId)
    t.field(Model.Ad.coin)
    t.field(Model.Ad.coinId)
    t.field(Model.Ad.limit)
    t.field(Model.Ad.available)
    t.field(Model.Ad.side)
    t.field(Model.Ad.paymentMethods)
    t.field(Model.Ad.duration)
    t.field(Model.Ad.terms)
    t.field(Model.Ad.isActive)
    t.field(Model.Ad.createdAt)
    t.field(Model.Ad.updatedAt)
    t.nullable.field(Model.Ad.isApproved)
  },
})
