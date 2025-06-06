import { inputObjectType } from 'nexus'

export const AuthInput = inputObjectType({
  name: 'AuthInput',
  definition(t) {
    t.string('phone')
  },
})

export const UserRegisterInput = inputObjectType({
  name: 'UserRegisterInput',
  definition(t) {
    t.string('phone')
    t.string('tag')
  },
})

export const UserUpdateInput = inputObjectType({
  name: 'UserUpdateInput',
  definition(t) {
    t.string('username')
    t.string('email')
    t.string('firstName')
    t.string('lastName')
    t.string('photo')
    t.string('phone')
    t.string('currency')
    t.string('pendingPhone')
    t.string('pendingEmail')
  },
})

export const UserWhereUniqueInput = inputObjectType({
  name: 'UserWhereUniqueInput',
  definition(t) {
    t.string('id')
    t.string('phone')
    t.string('email')
  },
})

export const UserSetPasswordInput = inputObjectType({
  name: 'UserSetPasswordInput',
  definition(t) {
    t.string('password')
    t.string('confirm_password')
  },
})

export const UserOtpInput = inputObjectType({
  name: 'UserOtpInput',
  definition(t) {
    t.nonNull.string('token')
    t.nonNull.string('phone')
  },
})

export const UserResponse = inputObjectType({
  name: 'UserResponse',
  definition(t) {
    t.string('message')
    t.string('token')
  },
})

export const UserWhereInput = inputObjectType({
  name: 'UserWhereInput',
  definition(t) {
    t.string('phone')
    t.string('email')
    t.boolean('isActive')
  },
})

export const UserOrderByInput = inputObjectType({
  name: 'UserOrderByInput',
  definition: (t) => {
    t.field('createdAt', { type: 'SortOrder' })
  },
})
