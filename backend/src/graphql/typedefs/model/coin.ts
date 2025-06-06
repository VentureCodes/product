import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const Coin = objectType({
  name: Model.Coin.$name,
  description: Model.Coin.$description,
  definition: (t) => {
    t.field(Model.Coin.id)
    t.field(Model.Coin.name)
    t.field(Model.Coin.symbol)
    t.field(Model.Coin.networkId)
    t.field(Model.Coin.network)
    t.field(Model.Coin.status)
    t.field(Model.Coin.createdAt)
    t.field(Model.Coin.updatedAt)
    // t.nonNull.list.nonNull.field('transactions', {
    //   type: Model.Transaction.$name,
    //   resolve: (parent, _args, ctx) => {
    //     return ctx.prisma.transaction.findMany({
    //       where: {
    //         coinId: parent.id,
    //       },
    //     })
    //   },
    // })
    t.field(Model.Coin.ads)
  },
})
