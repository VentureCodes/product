import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'
import { Context } from './../../context'

export const User = objectType({
  name: Model.User.$name,
  description: Model.User.$description,
  definition: (t) => {
    t.field(Model.User.id)
    t.field(Model.User.phone)
    t.field(Model.User.phoneVerified)
    t.field(Model.User.email)
    t.field(Model.User.emailVerified)
    t.field(Model.User.firstName)
    t.field(Model.User.userType)
    t.field(Model.User.lastName)
    t.field(Model.User.Subscription)
    t.field(Model.User.photo)
    t.field(Model.User.username)
    t.field(Model.User.isActive)
    t.field(Model.User.createdAt)
    t.field(Model.User.updatedAt)
    t.field(Model.User.ads)
    t.field(Model.User.referralLink)
    t.field(Model.User.referralUsage)
    t.field(Model.User.referral)
    t.field(Model.User.currency)
    t.field(Model.User.pendingPhone)
    t.field(Model.User.pendingEmail)
    t.string('pkAddress', {
      description: 'crypto public wallet address of the user',
      resolve: (root, _args, ctx: Context) => {
        return getPublicWalletAddress(root.id, ctx)
      },
    })
  },
})

async function getPublicWalletAddress(userId: string, ctx: Context) {
  const cryptoWallet = await ctx.prisma.cryptoWallet.findFirst({
    where: {
      userId: userId,
    },
  })
  if (!cryptoWallet) return null
  const wallet = await ctx.prisma.cryptoAccount.findFirst({
    where: { cryptoWalletId: cryptoWallet.id },
  })
  if (!wallet) return null
  return wallet.address
}
