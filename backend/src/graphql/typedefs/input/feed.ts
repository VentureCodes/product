import { inputObjectType } from 'nexus'

export const FeedWhereInput = inputObjectType({
  name: 'FeedWhereInput',
  definition(t) {
    t.string('id')
    t.string('title')
    t.string('content')
  },
})

export const FeedOrderByInput = inputObjectType({
  name: 'FeedOrderByInput',
  definition(t) {
    t.field('createdAt', { type: 'SortOrder' })
  },
})

export const FeedWhereUniqueInput = inputObjectType({
  name: 'FeedWhereUniqueInput',
  definition(t) {
    t.nonNull.string('id')
  },
})

export const FeedCommentInput = inputObjectType({
  name: 'FeedCommentInput',
  definition(t) {
    t.string('content')
    t.string('feedId')
  },
})

export const FeedReactInput = inputObjectType({
  name: 'FeedReactInput',
  definition(t) {
    t.string('feedId')
    t.field('reaction', { type: 'ReactionType' })
    t.string('reactionId')
  },
})

export const ReactOnCommentInput = inputObjectType({
  name: 'ReactOnCommentInput',
  definition(t) {
    t.string('commentId')
    t.field('reaction', { type: 'ReactionType' })
    t.string('reactionId')
  },
})
export const CommentInput = inputObjectType({
  name: 'CommentInput',
  definition(t) {
    t.string('content')
    t.string('feedId')
  },
})
