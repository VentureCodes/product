import { inputObjectType } from 'nexus'

export const ShillWhereInput = inputObjectType({
  name: 'ShillWhereInput',
  definition(t) {
    t.string('name')
  },
})

export const ShillWhereUniqueInput = inputObjectType({
  name: 'ShillWhereUniqueInput',
  definition(t) {
    t.string('id')
    t.string('name')
  },
})

export const ShillOrderByInput = inputObjectType({
  name: 'ShillOrderByInput',
  definition(t) {
    t.field('createdAt', { type: 'SortOrder' })
    t.field('updatedAt', { type: 'SortOrder' })
    t.field('averageReturn', { type: 'SortOrder' })
    t.field('followers', { type: 'SortOrder' })
    t.field('tradesCopied', { type: 'SortOrder' })
    t.field('successRate', { type: 'SortOrder' })
    t.field('yearOfExperience', { type: 'SortOrder' })
    t.field('strategies', { type: 'StrategyOrderByInput' })
    t.field('performanceHistory', { type: 'PerformanceHistoryOrderByInput' })
  },
})

export const ShillCreateInput = inputObjectType({
  name: 'ShillCreateInput',
  definition(t) {
    t.nonNull.string('name')
    t.nonNull.float('yearOfExperience')
    t.nonNull.field('tradingStyle', { type: 'TradingStyle' })
    t.nonNull.string('averageReturn')
    t.nonNull.field('platform', { type: 'Platform' })
    t.nonNull.int('followers')
    t.nonNull.int('tradesCopied')
    t.nonNull.string('successRate')
    t.nonNull.field('riskLevel', { type: 'RiskLevel' })
    t.string('bio')
    t.nonNull.field('strategies', { type: 'StrategyCreateInput' })
    t.nonNull.field('contact', { type: 'ContactCreateInput' })
    t.nonNull.field('performanceHistory', {
      type: 'PerformanceHistoryCreateInput',
    })
  },
})

export const ShillUpdateInput = inputObjectType({
  name: 'ShillUpdateInput',
  definition(t) {
    t.string('name')
    t.float('yearOfExperience')
    t.field('tradingStyle', { type: 'TradingStyle' })
    t.string('averageReturn')
    t.field('platform', { type: 'Platform' })
    t.int('followers')
    t.int('tradesCopied')
    t.string('successRate')
    t.field('riskLevel', { type: 'RiskLevel' })
    t.string('bio')
    t.string('photo')
    t.field('strategies', { type: 'StrategyCreateInput' })
    t.field('contact', { type: 'ContactCreateInput' })
    t.field('performanceHistory', {
      type: 'PerformanceHistoryCreateInput',
    })
  },
})

export const StrategyCreateInput = inputObjectType({
  name: 'StrategyCreateInput',
  definition(t) {
    t.nonNull.string('name')
    t.nonNull.string('description')
    t.nonNull.string('averageReturn')
    t.nonNull.string('traderId')
    t.nonNull.field('riskLevel', { type: 'RiskLevel' })
  },
})

export const StrategyUpdateInput = inputObjectType({
  name: 'StrategyUpdateInput',
  definition(t) {
    t.string('name')
    t.string('description')
    t.string('averageReturn')
    t.field('riskLevel', { type: 'RiskLevel' })
  },
})

export const StrategyOrderByInput = inputObjectType({
  name: 'StrategyOrderByInput',
  definition(t) {
    t.field('createdAt', { type: 'SortOrder' })
    t.field('updatedAt', { type: 'SortOrder' })
    t.field('averageReturn', { type: 'SortOrder' })
  },
})

export const ContactCreateInput = inputObjectType({
  name: 'ContactCreateInput',
  definition(t) {
    t.nonNull.string('traderId')
    t.nonNull.string('email')
    t.nonNull.string('twitter')
    t.nonNull.string('linkedin')
  },
})

export const ContactUpdateInput = inputObjectType({
  name: 'ContactUpdateInput',
  definition(t) {
    t.string('email')
    t.string('twitter')
    t.string('linkedin')
  },
})

export const PerformanceHistoryCreateInput = inputObjectType({
  name: 'PerformanceHistoryCreateInput',
  definition(t) {
    t.nonNull.string('year')
    t.nonNull.string('performanceId')
    t.field('monthlyPerformance', { type: 'MonthlyPerformanceCreateInput' })
  },
})
export const PerformanceHistoryUpdateInput = inputObjectType({
  name: 'PerformanceHistoryUpdateInput',
  definition(t) {
    t.nonNull.string('year')
    t.nonNull.string('performanceId')
    t.field('monthlyPerformance', { type: 'MonthlyPerformanceUpdateInput' })
  },
})

export const PerformanceHistoryOrderByInput = inputObjectType({
  name: 'PerformanceHistoryOrderByInput',
  definition(t) {
    t.field('createdAt', { type: 'SortOrder' })
    t.field('updatedAt', { type: 'SortOrder' })
    t.field('year', { type: 'SortOrder' })
    t.field('monthlyPerformance', { type: 'MonthlyPerformanceOrderByInput' })
  },
})

export const MonthlyPerformanceCreateInput = inputObjectType({
  name: 'MonthlyPerformanceCreateInput',
  definition(t) {
    t.nonNull.string('percentage')
    t.nonNull.field('month', { type: 'Month' })
    t.nonNull.string('performanceHistoryId')
  },
})

export const MonthlyPerformanceUpdateInput = inputObjectType({
  name: 'MonthlyPerformanceUpdateInput',
  definition(t) {
    t.string('percentage')
    t.field('month', { type: 'Month' })
  },
})

export const MonthlyPerformanceOrderByInput = inputObjectType({
  name: 'MonthlyPerformanceOrderByInput',
  definition(t) {
    t.field('createdAt', { type: 'SortOrder' })
    t.field('updatedAt', { type: 'SortOrder' })
    t.field('month', { type: 'SortOrder' })
  },
})
