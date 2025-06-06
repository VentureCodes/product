import { objectType } from 'nexus'

export const Response = objectType({
  name: 'Response',
  definition(t) {
    t.string('status')
    t.string('msg')
  },
})
