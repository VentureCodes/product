import { arg, extendType, intArg } from 'nexus'
import { removeEmpty, handlePrismaError } from '../helper'

export const RateProviderQuery = extendType({
  type: 'Query',
  definition: (t) => {
    t.nonNull.list.nonNull.field('rateProviders', {
      type: 'RateProvider',
      args: {
        where: arg({
          type: 'RateProviderWhereInput',
        }),
        take: intArg(),
        skip: intArg(),
        orderBy: arg({
          type: 'RateProviderOrderByInput',
        }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where, orderBy, take, skip, country, rateCategoryName } =
          removeEmpty(args)

        try {
          const result = await prisma.rateProvider.findMany({
            where: {
              ...where,
              ...(country && { country: { equals: country } }),
              ...(rateCategoryName && {
                rateCategory: {
                  name: {
                    equals: rateCategoryName,
                  },
                },
              }),
            },
            orderBy,
            take,
            skip,
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
              rateCategory: true,
            },
          })
          return result
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})

export const RateProviderMutation = extendType({
  type: 'Mutation',
  definition: (t) => {
    t.field('createRateProvider', {
      type: 'RateProvider',
      args: {
        data: arg({
          type: 'RateProviderCreateInput',
        }),
      },
      resolve: async (_, args, { prisma }) => {
        const { data } = removeEmpty(args)

        console.log('Incoming RateProvider data:', data)

        try {
          return await prisma.rateProvider.create({
            data: {
              ...data,
              country: data.country,
              rateCategory: { connect: { id: data.rateCategoryId } },
            },
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.field('updateRateProvider', {
      type: 'RateProvider',
      args: {
        where: arg({
          type: 'RateProviderWhereUniqueInput',
        }),
        data: arg({
          type: 'RateProviderUpdateInput',
        }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where, data } = removeEmpty(args)

        try {
          return await prisma.rateProvider.update({
            where,
            data: {
              ...data,
              country: data.country,
              rateCategory: { connect: { id: data.rateCategoryId } },
            },
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.field('deleteRateProvider', {
      type: 'RateProvider',
      args: {
        where: arg({
          type: 'RateProviderWhereUniqueInput',
        }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where } = removeEmpty(args)

        try {
          return await prisma.rateProvider.delete({
            where,
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})
