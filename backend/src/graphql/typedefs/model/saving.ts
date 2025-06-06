import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const Saving = objectType({
  name: Model.Saving.$name,
  description: Model.Saving.$description,
  definition: (t) => {
    t.field(Model.Saving.id)
    t.field(Model.Saving.name)
    t.field(Model.Saving.user)
    t.field(Model.Saving.userId)
    t.field(Model.Saving.fiat)
    t.field(Model.Saving.fiatId)
    t.field(Model.Saving.amount)
    t.field(Model.Saving.amountEarned)
    t.field(Model.Saving.duration)
    t.field(Model.Saving.maturedAt)
    t.field(Model.Saving.fiatWallet)
    t.field(Model.Saving.fiatWalletId)
    t.field(Model.Saving.cryptoAccount)
    t.field(Model.Saving.cryptoAccountId)
    t.field(Model.Saving.isActive)
    t.field(Model.Saving.isCryptoAccount)
    t.field(Model.Saving.isMatured)
    t.field(Model.Saving.createdAt)
    t.field(Model.Saving.updatedAt)
  },
})
