import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const FiatWallet = objectType({
  name: Model.FiatWallet.$name,
  description: Model.FiatWallet.$description,
  definition: (t) => {
    t.field(Model.FiatWallet.id)
    t.field(Model.FiatWallet.user)
    t.field(Model.FiatWallet.userId)
    t.field(Model.FiatWallet.fiat)
    t.field(Model.FiatWallet.fiatId)
    t.field(Model.FiatWallet.balance)
    t.field(Model.FiatWallet.lockedBal)
    t.field(Model.FiatWallet.createdAt)
    t.field(Model.FiatWallet.updatedAt)
  },
})

export const AllowedTokensResponse = objectType({
  name: 'AllowedTokensResponse',
  definition(t) {
    t.string('address')
    t.string('symbol')
    t.int('decimals')
    t.string('balance')
    t.string('amountInUsd')
    t.nullable.field('info', {
      type: 'Cryptocurrency',
    })
  },
})
