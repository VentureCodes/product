import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const MonthlyPerformance = objectType({
  name: Model.MonthlyPerformance.$name,
  description: Model.MonthlyPerformance.$description,
  definition(t) {
    t.field(Model.MonthlyPerformance.id)
    t.field(Model.MonthlyPerformance.createdAt)
    t.field(Model.MonthlyPerformance.updatedAt)
    t.field(Model.MonthlyPerformance.month)
    t.field(Model.MonthlyPerformance.percentage)
    t.field(Model.MonthlyPerformance.performanceId)
    t.field(Model.MonthlyPerformance.performanceId)
    t.field(Model.MonthlyPerformance.performance)
  },
})
