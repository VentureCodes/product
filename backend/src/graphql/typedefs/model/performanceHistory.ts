import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const PerformanceHistory = objectType({
  name: Model.PerformanceHistory.$name,
  description: Model.PerformanceHistory.$description,
  definition(t) {
    t.field(Model.PerformanceHistory.id)
    t.field(Model.PerformanceHistory.createdAt)
    t.field(Model.PerformanceHistory.updatedAt)
    t.field(Model.PerformanceHistory.year)
    t.field(Model.PerformanceHistory.traderId)
    t.field(Model.PerformanceHistory.monthlyPerformance)
    t.field(Model.PerformanceHistory.trader)
  },
})
