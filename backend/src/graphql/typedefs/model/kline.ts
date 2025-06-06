import { objectType } from 'nexus'

import * as Model from 'nexus-prisma'

export const KlineData = objectType({
  name: Model.KlineData.$name,
  description: Model.KlineData.$description,
  definition: (t) => {
    t.field(Model.KlineData.id)
    t.field(Model.KlineData.startTime)
    t.field(Model.KlineData.openPrice)
    t.field(Model.KlineData.highPrice)
    t.field(Model.KlineData.lowPrice)
    t.field(Model.KlineData.closePrice)
    t.field(Model.KlineData.symbol)
    t.field(Model.KlineData.createdAt)
    t.field(Model.KlineData.tradeId)
    t.field(Model.KlineData.Trade)
  },
})
