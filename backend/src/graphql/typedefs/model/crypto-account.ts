import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const CryptoAccount = objectType({
  name: Model.CryptoAccount.$name,
  description: Model.CryptoAccount.$description,
  definition: (t) => {
    t.field(Model.CryptoAccount.id)
    t.field(Model.CryptoAccount.type)
    t.field(Model.CryptoAccount.cryptoWallet)
    t.field(Model.CryptoAccount.cryptoWalletId)
    t.field(Model.CryptoAccount.address)
    t.field(Model.CryptoAccount.status)
    t.field(Model.CryptoAccount.isActive)
    t.field(Model.CryptoAccount.createdAt)
    t.field(Model.CryptoAccount.updatedAt)
  },
})
