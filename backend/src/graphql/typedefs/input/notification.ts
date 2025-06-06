import { inputObjectType, objectType } from 'nexus'

export const NotificationWhereUniqueInput = inputObjectType({
  name: 'NotificationWhereUniqueInput',
  definition(t) {
    t.string('id')
  },
})

export const NotificationWhereInput = inputObjectType({
  name: 'NotificationWhereInput',
  definition(t) {
    t.string('id')
    t.string('userId')
    t.string('body')
    t.field('type', { type: 'NotificationType' })
    t.field('status', { type: 'NotificationStatus' })
    t.field('category', { type: 'NotificationCategory' })
  },
})

export const NotificationWhereOrderByInput = inputObjectType({
  name: 'NotificationWhereOrderByInput',
  definition: (t) => {
    t.field('createdAt', { type: 'SortOrder' })
  },
})

export const UpdateNotificationType = objectType({
  name: 'UpdateNotificationType',
  definition(t) {
    t.string('message')
    t.boolean('success')
  },
})
