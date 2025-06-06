import { arg, extendType, intArg } from 'nexus'
import { handlePrismaError, removeEmpty } from '../helper'

export const PostQuery = extendType({
  type: 'Query',
  definition: (t) => {
    t.nonNull.list.field('posts', {
      type: 'Post',
      args: {
        where: arg({
          type: 'PostWhereInput',
        }),
        take: intArg(),
        skip: intArg(),
        orderBy: arg({
          type: 'PostOrderByInput',
        }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where, orderBy, take, skip } = removeEmpty(args)
        try {
          return await prisma.post.findMany({
            where,
            orderBy,
            take,
            skip,
            include: {
              source: true,
              impressions: true,
            },
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})





export const PostMutation = extendType({
  type: 'Mutation',
  definition: (t) => {
    t.field('createPost', {
      type: 'Post',
      args: {
        data: arg({
          type: 'PostCreateInput',
        }),
      },
      resolve: async (_, args, { prisma }) => {
        const { data } = removeEmpty(args)

        try {
          return await prisma.post.create({
            data,
            include: {
              source: true,
              impressions: true,
            },
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.field('updatePost', {
      type: 'Post',
      args: {
        where: arg({
          type: 'PostWhereUniqueInput',
        }),
        data: arg({
          type: 'PostUpdateInput',
        }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where, data } = removeEmpty(args)

        try {
          return await prisma.post.update({
            where,
            data,
            include: {
              source: true,
              impressions: true,
            },
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.field('deletePost', {
      type: 'Post',
      args: {
        where: arg({
          type: 'PostWhereUniqueInput',
        }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where } = removeEmpty(args)

        try {
          return await prisma.post.delete({
            where,
            include: {
              source: true,
              impressions: true,
            },
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})
