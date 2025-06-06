import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const Comment = objectType({
  name: Model.Comment.$name,
  description: Model.Comment.$description,
  definition: (t) => {
    t.field(Model.Comment.id)
    t.field(Model.Comment.reactions)
    t.field(Model.Comment.userId)
    t.field(Model.Comment.user)
    t.field(Model.Comment.content)
    t.field(Model.Comment.feed)
    t.field(Model.Comment.feedId)
    t.field(Model.Comment.createdAt)
    t.field(Model.Comment.updatedAt)
  },
})
