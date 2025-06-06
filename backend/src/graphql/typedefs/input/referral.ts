import { inputObjectType } from 'nexus'




export const ReferralCreateInput = inputObjectType({
  name: 'ReferralCreateInput',
  definition(t) {
    t.string('referralLink') 
  },
})

export const ReferralWhereInput = inputObjectType({
  name: 'ReferralWhereInput',
  definition(t) {
    t.string('id') 
    t.string('referrerId') 
  },
})

export const ReferralWhereUniqueInput = inputObjectType({
  name: 'ReferralWhereUniqueInput',
  definition(t) {
    t.string('id')
    t.string('referrerId') 
  },
})

export const ReferralOrderByInput = inputObjectType({
  name: 'ReferralOrderByInput',
  definition(t) {
    t.field('createdAt', { type: 'SortOrder' }) 
  },
})

export const ReferralUsageWhereInput = inputObjectType({
  name: 'ReferralUsageWhereInput',
  definition(t) {
    t.string('referralId') 
    t.string('userId') 
  },
})

export const ReferralUsageWhereUniqueInput = inputObjectType({
  name: 'ReferralUsageWhereUniqueInput',
  definition(t) {
    t.string('id') 
    t.string('referralId')
  },
})
