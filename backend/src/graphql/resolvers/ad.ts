import { arg, extendType, intArg, nonNull } from 'nexus'
import { handlePrismaError, removeEmpty } from '../helper'

export const AdQuery = extendType({
  type: 'Query',
  definition: (t) => {
    t.nonNull.list.nonNull.field('ads', {
      type: 'Ad',
      args: {
        where: arg({
          type: 'AdWhereInput',
        }),
        take: intArg(),
        skip: intArg(),
        orderBy: arg({
          type: 'AdOrderByInput',
        }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where, take, skip, orderBy } = removeEmpty(args)

        try {
          return await prisma.ad.findMany({
            where,
            take,
            skip,
            orderBy,
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.nullable.field('ad', {
      type: 'Ad',
      args: {
        where: nonNull(
          arg({
            type: 'AdWhereUniqueInput',
          }),
        ),
      },
      resolve: async (_, args, { prisma }) => {
        const { where } = removeEmpty(args)

        try {
          return await prisma.ad.findUnique({ where })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})

export const AdMutation = extendType({
  type: 'Mutation',
  definition: (t) => {
    t.field('createAd', {
      type: 'Ad',
      args: {
        data: nonNull(
          arg({
            type: 'AdCreateInput',
          }),
        ),
      },
      resolve: async (_, args, { prisma, user }) => {
        const { data } = removeEmpty(args)
        const userId = user?.id
        if (data.advertiserId === undefined && userId) {
          data.advertiserId = userId
        }

        const connects = []

        for (let key in data.paymentMethods?.['0'].connect) {
          if (data.paymentMethods?.['0'].connect.hasOwnProperty(key)) {
            connects.push(data.paymentMethods?.['0'].connect[key])
          }
        }

        try {
          return await prisma.ad.create({
            data: {
              ...data,
              paymentMethods: {
                connect: connects,
              },
            },
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.field('updateAd', {
      type: 'Ad',
      args: {
        where: nonNull(
          arg({
            type: 'AdWhereUniqueInput',
          }),
        ),
        data: arg({
          type: 'AdUpdateInput',
        }),
      },
      resolve: async (_, args, { prisma }) => {
        const { data, where } = removeEmpty(args)
        const connects = []

        for (let key in data.paymentMethods?.['0'].connect) {
          if (data.paymentMethods?.['0'].connect.hasOwnProperty(key)) {
            connects.push(data.paymentMethods?.['0'].connect[key])
          }
        }

        try {
          return await prisma.ad.update({
            where,
            data: {
              ...data,
              paymentMethods: {
                connect: connects,
              },
            },
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.field('deleteAd', {
      type: 'Ad',
      args: {
        where: nonNull(
          arg({
            type: 'AdWhereUniqueInput',
          }),
        ),
      },
      resolve: async (_, args, { prisma }) => {
        const { where } = removeEmpty(args)

        try {
          const ad = await prisma.ad.delete({ where })
          return ad
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})
