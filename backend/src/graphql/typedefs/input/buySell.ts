import { inputObjectType } from 'nexus'

export const BuySellWhereInput = inputObjectType({
  name: 'BuySellWhereInput',
  definition(t) {
    t.nonNull.string('amount')
    t.nonNull.string('token')
    t.nonNull.string('type')
  },
})
