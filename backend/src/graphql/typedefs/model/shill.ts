import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const Shill = objectType({
  name: Model.Shill.$name,
  description: Model.Shill.$description,
  definition: (t) => {
    t.field(Model.Shill.id)
    t.field(Model.Shill.name)
    t.field(Model.Shill.tradeCount)
    t.field(Model.Shill.pnlLoss)
    t.field(Model.Shill.pnlWin)
    t.field(Model.Shill.avgProfit)
    t.field(Model.Shill.maxProfit)
    t.field(Model.Shill.gross)
    t.field(Model.Shill.winCount)
    t.field(Model.Shill.avgLoss)
    t.field(Model.Shill.lossCount)
    t.field(Model.Shill.photo)
    t.field(Model.Shill.maxLoss)
    t.field(Model.Shill.lossRate)
    t.field(Model.Shill.winLossRatio)
    t.field(Model.Shill.winRate)
    t.field(Model.Shill.lossCount)
    t.field(Model.Shill.winPercentage)
    t.field(Model.Shill.avgVolume)
    t.field(Model.Shill.date)
    t.field(Model.Shill.createdAt)
    t.field(Model.Shill.updatedAt)
  },
})
