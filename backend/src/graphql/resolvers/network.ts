import { arg, extendType, nonNull } from 'nexus'
import { handlePrismaError, removeEmpty } from '../helper'

export const NetworkQuery = extendType({
  type: 'Query',
  definition: (t) => {
    t.nonNull.list.nonNull.field('networks', {
      type: 'Network',
      args: {
        where: arg({
          type: 'NetworkWhereInput',
        }),
        orderBy: arg({
          type: 'NetworkOrderByInput',
        }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where, orderBy } = removeEmpty(args)

        try {
          return await prisma.network.findMany({
            where,
            orderBy,
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.nullable.field('network', {
      type: 'Network',
      args: {
        where: nonNull(
          arg({
            type: 'NetworkWhereUniqueInput',
          }),
        ),
      },
      resolve: async (_, args, { prisma }) => {
        const { where } = removeEmpty(args)

        try {
          return await prisma.network.findUnique({ where })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})

export const NetworkMutation = extendType({
  type: 'Mutation',
  definition: (t) => {
    t.field('createNetwork', {
      type: 'Network',
      args: {
        data: nonNull(
          arg({
            type: 'NetworkCreateInput',
          }),
        ),
      },
      resolve: async (_, args, { prisma }) => {
        const { data } = removeEmpty(args)

        try {
          return await prisma.network.create({ data })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.field('updateNetwork', {
      type: 'Network',
      args: {
        where: nonNull(
          arg({
            type: 'NetworkWhereUniqueInput',
          }),
        ),
        data: arg({
          type: 'NetworkUpdateInput',
        }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where, data } = removeEmpty(args)
        try {
          return await prisma.network.update({ where, data })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.field('deleteNetwork', {
      type: 'Network',
      args: {
        where: nonNull(
          arg({
            type: 'NetworkWhereUniqueInput',
          }),
        ),
      },
      resolve: (_, args, { prisma }) => {
        const { where } = removeEmpty(args)
        try {
          return prisma.network.delete({ where })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})
