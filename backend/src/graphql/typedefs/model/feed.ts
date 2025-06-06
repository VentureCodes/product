import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const Feed = objectType({
  name: Model.Feed.$name,
  description: Model.Feed.$description,
  definition: (t) => {
    t.field(Model.Feed.id)
    t.field(Model.Feed.title)
    t.field(Model.Feed.photo)
    t.field(Model.Feed.content)
    t.field(Model.Feed.creator)
    t.field(Model.Feed.owner)
    t.field(Model.Feed.category)
    t.field(Model.Feed.categoryId)
    t.field(Model.Feed.comments)
    t.field(Model.Feed.reactions)
    t.field(Model.Feed.createdAt)
    t.field(Model.Feed.updatedAt)
  },
})
