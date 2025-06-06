import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const Network = objectType({
  name: Model.Network.$name,
  description: Model.Network.$description,
  definition: (t) => {
    t.field(Model.Network.id)
    t.field(Model.Network.name)
    t.field(Model.Network.symbol)
    t.field(Model.Network.explorer)
    t.field(Model.Network.nativeToken)
    t.field(Model.Network.isActive)
    t.field(Model.Network.createdAt)
    t.field(Model.Network.updatedAt)
    t.field(Model.Network.coins)
  },
})
