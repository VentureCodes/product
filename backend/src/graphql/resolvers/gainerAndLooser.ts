import { extendType } from 'nexus'
import { handlePrismaError } from '../helper'
import { gainersAndLoserCoins } from '../../utils/coinMarketCap'

export const GainerAndLoserQuery = extendType({
  type: 'Query',
  definition: (t) => {
    t.nonNull.list.nonNull.field('gainerAndLooserCoins', {
      type: 'GainerAndLooserCurrency',
      resolve: async () => {
        try {
          return await gainersAndLoserCoins()
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})
