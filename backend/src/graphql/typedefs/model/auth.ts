import { objectType } from 'nexus'

export const AuthResponse = objectType({
  name: 'AuthResponse',
  definition(t) {
    t.string('status')
    t.string('msg')
    t.string('expiresAt', {
      description: 'Token expiration time, time in  milliseconds',
    })
    t.nullable.string('token')
    t.nullable.field('user', {
      type: 'User',
    })
  },
})
