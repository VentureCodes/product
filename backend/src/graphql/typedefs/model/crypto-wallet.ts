import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const CryptoWallet = objectType({
  name: Model.CryptoWallet.$name,
  description: Model.CryptoWallet.$description,
  definition: (t) => {
    t.field(Model.CryptoWallet.id)
    t.field(Model.CryptoWallet.user)
    t.field(Model.CryptoWallet.userId)
    t.field(Model.CryptoWallet.network)
    t.field(Model.CryptoWallet.networkId)
    t.field(Model.CryptoWallet.accounts)
    t.field(Model.CryptoWallet.isActive)
    t.field(Model.CryptoWallet.createdAt)
    t.field(Model.CryptoWallet.updatedAt)
  },
})
