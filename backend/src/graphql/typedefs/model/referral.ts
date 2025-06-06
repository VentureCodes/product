import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const Referral = objectType({
  name: Model.Referral.$name,
  description: Model.Referral.$description,
  definition: (t) => {
    t.field(Model.Referral.id)
    t.field(Model.Referral.referralUsage)
    t.field(Model.Referral.referrer)
    t.field(Model.Referral.referrerId)
    t.field(Model.Referral.createdAt)
    t.field(Model.Referral.updatedAt)
  },
})

export const CreateReferralPayload = objectType({
  name: 'CreateReferralPayload',
  definition(t) {
    t.field('referral', {
      type: 'Referral',
    })
    t.field('user', {
      type: 'User',
    })
  },
})
