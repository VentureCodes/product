import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const Post = objectType({
  name: Model.Post.$name,
  description: Model.Post.$description,

  definition(t) {
    t.field(Model.Post.id)
    t.field(Model.Post.author)
    t.field(Model.Post.title)
    t.field(Model.Post.summary)
    t.field(Model.Post.link)
    t.field(Model.Post.image)
    t.field(Model.Post.status)
    t.field(Model.Post.postSourceId)
    // t.field(Model.Post.impressions)
    t.field(Model.Post.createdAt)
    t.field(Model.Post.updatedAt)
  },
})