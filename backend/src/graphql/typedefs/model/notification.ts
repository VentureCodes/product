import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const Notification = objectType({
  name: Model.Notification.$name,
  description: Model.Notification.$description,
  definition(t) {
    t.field(Model.Notification.id)
    t.field(Model.Notification.createdAt)
    t.field(Model.Notification.readAt)
    t.field(Model.Notification.status)
    t.field(Model.Notification.body)
    t.field(Model.Notification.userId)
    t.field(Model.Notification.user)
    t.field(Model.Notification.category)
  },
})
