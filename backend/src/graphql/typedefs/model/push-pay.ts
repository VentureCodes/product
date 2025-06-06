import { objectType } from 'nexus'

export const PushPayResponse = objectType({
  name: 'PushPayResponse',
  definition(t) {
    t.string('message')
    t.string('link')
    t.string('token')
    t.string('name')
    t.string('email')
  },
})

export const PushPayClaimResponse = objectType({
  name: 'PushPayClaimResponse',
  definition(t) {
    t.string('message')
  },
})
