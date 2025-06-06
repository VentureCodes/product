import { arg, extendType, intArg, nonNull } from 'nexus'
import { handlePrismaError, removeEmpty } from '../helper'
import { GraphQLError } from 'graphql'

export const FeedQuery = extendType({
  type: 'Query',
  definition: (t) => {
    t.nonNull.list.nonNull.field('feeds', {
      type: 'Feed',
      args: {
        // where: arg({
        //   type: 'FeedWhereInput',
        // }),
        take: intArg(),
        skip: intArg(),
        orderBy: arg({
          type: 'FeedOrderByInput',
        }),
      },
      resolve: async (_, args, { prisma }) => {
        const { take, skip, orderBy } = removeEmpty(args)

        try {
          return await prisma.feed.findMany({
            // where: {
            //   OR: [
            //     { title: { contains: where.title } },
            //     { content: { contains: where.title } },
            //   ],
            // },
            take,
            skip,
            orderBy,
            include: {
              comments: true,
              reactions: true,
              category: true,
            },
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.nullable.field('feed', {
      type: 'Feed',
      args: {
        where: nonNull(
          arg({
            type: 'FeedWhereUniqueInput',
          }),
        ),
      },
      resolve: async (_, args, { prisma }) => {
        const { where } = removeEmpty(args)

        try {
          return await prisma.feed.findUnique({
            where,
            include: {
              comments: true,
              reactions: true,
              category: true,
            },
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})

// mutation

export const FeedMutation = extendType({
  type: 'Mutation',
  definition: (t) => {
    t.field('commentFeed', {
      type: 'Feed',
      args: {
        data: nonNull(
          arg({
            type: 'FeedCommentInput',
          }),
        ),
      },
      resolve: async (_, args, { prisma, user }) => {
        const { data } = removeEmpty(args)

        try {
          const feed = await prisma.feed.findUnique({
            where: { id: data.feedId },
          })
          if (!feed)
            throw new GraphQLError('Feed not found', {
              extensions: { code: '404' },
            })

          return await prisma.feed.update({
            where: { id: data.feedId },
            data: {
              comments: {
                create: {
                  content: data.content,
                  user: { connect: { id: user?.id! } },
                },
              },
            },
            include: {
              comments: true,
              reactions: true,
              category: true,
            },
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
    t.field('reactToFeed', {
      type: 'Feed',
      args: {
        data: nonNull(
          arg({
            type: 'FeedReactInput',
          }),
        ),
      },

      resolve: async (_, args, { prisma, user }) => {
        const { data } = removeEmpty(args)

        try {
          const feed = await prisma.feed.findUnique({
            where: { id: data.feedId },
          })
          if (!feed)
            throw new GraphQLError('Feed not found', {
              extensions: { code: '404' },
            })

          if (data.reactionId) {
            const reaction = await prisma.reaction.findUnique({
              where: { id: data.reactionId },
            })

            if (reaction) {
              return await prisma.feed.update({
                where: { id: data.feedId },
                data: {
                  reactions: {
                    delete: { id: data.reactionId },
                  },
                },
                include: {
                  comments: true,
                  reactions: true,
                  category: true,
                },
              })
            }
          }

          return await prisma.feed.update({
            where: { id: data.feedId },
            data: {
              reactions: {
                create: {
                  type: data.reaction,
                  userId: user?.id!,
                },
              },
            },
            include: {
              comments: true,
              reactions: true,
              category: true,
            },
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    }),
      t.field('commentOnComment', {
        type: 'Comment',
        args: {
          data: nonNull(
            arg({
              type: 'CommentInput',
            }),
          ),
        },
        resolve: async (_, args, { prisma, user }) => {
          const { data } = removeEmpty(args)

          try {
            const feed = await prisma.feed.findUnique({
              where: { id: data.feedId },
            })
            if (!feed)
              throw new GraphQLError('Feed not found', {
                extensions: { code: '404' },
              })

            return await prisma.comment.create({
              data: {
                content: data.content,
                user: { connect: { id: user?.id! } },
                feed: { connect: { id: data.feedId } },
              },
            })
          } catch (error: any) {
            return handlePrismaError(error)
          }
        },
      }),
      t.field('reactOnComment', {
        type: 'Comment',
        args: {
          data: nonNull(
            arg({
              type: 'ReactOnCommentInput',
            }),
          ),
        },
        resolve: async (_, args, { prisma, user }) => {
          const { data } = removeEmpty(args)

          try {
            const comment = await prisma.comment.findUnique({
              where: { id: data.commentId },
            })
            if (!comment)
              throw new GraphQLError('Comment not found', {
                extensions: { code: '404' },
              })

            if (data.reactionId) {
              const reaction = await prisma.reaction.findUnique({
                where: { id: data.reactionId },
                include: {
                  feed: true,
                  Comment: true,
                  user: true,
                },
              })
              if (reaction) {
                return await prisma.comment.update({
                  where: { id: data.commentId },
                  data: {
                    reactions: {
                      delete: { id: data.reactionId },
                    },
                  },
                  include: {
                    feed: true,
                    reactions: true,
                    user: true,
                  },
                })
              }
            }
            return await prisma.comment.update({
              where: { id: data.commentId },
              data: {
                reactions: {
                  create: {
                    type: data.reaction,
                    user: { connect: { id: user?.id! } },
                  },
                },
              },
              include: {
                feed: true,
                reactions: true,
                user: true,
              },
            })
          } catch (error: any) {
            return handlePrismaError(error)
          }
        },
      })
  },
})
