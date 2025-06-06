import { arg, extendType, intArg } from 'nexus'
import { handlePrismaError, removeEmpty } from '../helper'

export const RateCategoryQuery = extendType({
  type: 'Query',
  definition: (t) => {
    t.nonNull.list.nonNull.field('rateCategories', {
      type: 'RateCategory',
      args: {
        where: arg({
          type: 'RateCategoryWhereInput',
        }),
        take: intArg(),
        skip: intArg(),
        orderBy: arg({
          type: 'RateCategoryOrderByInput',
        }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where, take, skip, orderBy } = removeEmpty(args)

        try {
          return await prisma.rateCategory.findMany({
            where,
            orderBy,
            take,
            skip,
            include: {
              rateProviders: {
                include: {
                  rates: {
                    orderBy: {
                      datePosted: 'desc',
                    },
                    take: 1,
                    include: {
                      fiat: true,
                    },
                  },
                },
              },
            },
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.nullable.field('rateCategory', {
      type: 'RateCategory',
      args: {
        where: arg({
          type: 'RateCategoryWhereUniqueInput',
        }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where } = removeEmpty(args)

        try {
          return await prisma.rateCategory.findUnique({
            where,
            include: {
              rateProviders: {
                include: {
                  rates: {
                    take: 1,
                    orderBy: {
                      createdAt: 'desc',
                    },
                    include: {
                      fiat: true,
                    },
                  },
                },
              },
            },
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})

export const RateCategoryMutation = extendType({
  type: 'Mutation',
  definition: (t) => {
    t.nonNull.field('createRateCategory', {
      type: 'RateCategory',
      args: {
        data: arg({
          type: 'RateCategoryCreateInput',
        }),
      },
      resolve: async (_, args, { prisma }) => {
        const { data } = removeEmpty(args)

        console.log('Incoming RateCategory data:', data)

        try {
          return await prisma.rateCategory.create({
            data,
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.nonNull.field('updateRateCategory', {
      type: 'RateCategory',
      args: {
        where: arg({
          type: 'RateCategoryWhereUniqueInput',
        }),
        data: arg({
          type: 'RateCategoryUpdateInput',
        }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where, data } = removeEmpty(args)

        console.log('Incoming RateCategory data:', data)

        try {
          return await prisma.rateCategory.update({
            where,
            data,
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.nonNull.field('deleteRateCategory', {
      type: 'RateCategory',
      args: {
        where: arg({
          type: 'RateCategoryWhereUniqueInput',
        }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where } = removeEmpty(args)

        try {
          return await prisma.rateCategory.delete({
            where,
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})
