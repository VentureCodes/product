import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const SubscriptionPlan = objectType({
  name: Model.SubscriptionPlan.$name,
  description: Model.SubscriptionPlan.$description,
  definition: (t) => {
    t.field(Model.SubscriptionPlan.id)
    t.field(Model.SubscriptionPlan.user)
    t.field(Model.SubscriptionPlan.userId)
    t.field(Model.SubscriptionPlan.package)
    t.field(Model.SubscriptionPlan.type)
    t.field(Model.SubscriptionPlan.fiatTransaction)
    t.field(Model.SubscriptionPlan.fiatTransactionId)
    t.field(Model.SubscriptionPlan.isActive)
    t.field(Model.SubscriptionPlan.startDate)
    t.field(Model.SubscriptionPlan.endDate)
    t.field(Model.SubscriptionPlan.createdAt)
    t.field(Model.SubscriptionPlan.updatedAt)
  },
})
