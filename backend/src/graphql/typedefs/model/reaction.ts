import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const Reaction = objectType({
  name: Model.Reaction.$name,
  description: Model.Reaction.$description,
  definition: (t) => {
    t.field(Model.Reaction.id)
    t.field(Model.Reaction.userId)
    t.field(Model.Reaction.user)
    t.field(Model.Reaction.feed)
    t.field(Model.Reaction.feedId)
    t.field(Model.Reaction.type)
    t.field(Model.Reaction.feedId)
    t.field(Model.Reaction.createdAt)
    t.field(Model.Reaction.updatedAt)
  },
})
