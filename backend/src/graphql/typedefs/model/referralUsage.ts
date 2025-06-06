import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'


export const ReferralUsage = objectType({
    name: Model.ReferralUsage.$name,
    description: Model.ReferralUsage.$description,
    definition(t) {
        t.field(Model.ReferralUsage.id)
        t.field(Model.ReferralUsage.referralId)
        t.field(Model.ReferralUsage.userId)
        t.field(Model.ReferralUsage.user)
        t.field(Model.ReferralUsage.referral)

        t.field(Model.ReferralUsage.createdAt)
        t.field(Model.ReferralUsage.updatedAt)
    },
    })
