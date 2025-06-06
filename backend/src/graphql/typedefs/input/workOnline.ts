import { inputObjectType } from 'nexus'

export const PostWhereUniqueInput = inputObjectType({
  name: 'PostWhereUniqueInput',
  definition(t) {
    t.string('id')
  },
})

export const PostWhereInput = inputObjectType({
  name: 'PostWhereInput',
  definition(t) {
    t.string('author')
    t.field('category', { type: 'PostCategory' })
    t.field('topic', { type: 'PostTopic' })
    t.string('title')
  },
})



export const PostSourceInput = inputObjectType({
  name: 'PostSourceInput',
  definition(t) {
    t.string('name')
    t.string('icon')
    t.boolean('isActive')
  },
})

export const PostOrderByInput = inputObjectType({
  name: 'PostOrderByInput',
  definition(t) {
    t.field('author', { type: 'SortOrder' })
    t.field('createdAt', { type: 'SortOrder' })
    t.field('status', { type: 'SortOrder' })
    t.field('createdAt', { type: 'SortOrder' })
    t.field('updatedAt', { type: 'SortOrder' })
  },
})

export const PostCreateInput = inputObjectType({
  name: 'PostCreateInput',
  definition(t) {
    t.string('author')
    t.nonNull.string('title')
    t.nonNull.string('summary')
    t.nonNull.string('userId')
    t.field('status', { type: 'PostStatus' })
  },
})

export const PostUpdateInput = inputObjectType({
  name: 'PostUpdateInput',
  definition(t) {
    t.string('author')
    t.string('title')
    t.string('summary')
    t.field('status', { type: 'PostStatus' })
  },
})
