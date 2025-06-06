import { arg, extendType, intArg } from 'nexus'
import { handlePrismaError, removeEmpty } from '../helper'

export const RateQuery = extendType({
  type: 'Query',
  definition: (t) => {
    t.nonNull.list.nonNull.field('rates', {
      type: 'Rate',
      args: {
        where: arg({
          type: 'RateWhereInput',
        }),
        take: intArg(),
        skip: intArg(),
        orderBy: arg({
          type: 'RateOrderByInput',
        }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where, orderBy, take, skip } = removeEmpty(args)

        try {
          return await prisma.rate.findMany({
            where,
            orderBy: orderBy ?? { datePosted: 'desc' },
            take: take ?? undefined,
            skip,
            include: {
              fiat: true,
              rateProvider: true,
            },
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.nullable.field('rate', {
      type: 'Rate',
      args: {
        where: arg({
          type: 'RateWhereUniqueInput',
        }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where } = removeEmpty(args)

        try {
          return await prisma.rate.findUnique({
            where,
            include: {
              fiat: true,
              rateProvider: true,
            },
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})

export const RateMutation = extendType({
  type: 'Mutation',
  definition: (t) => {
    t.field('createRate', {
      type: 'Rate',
      args: {
        data: arg({
          type: 'RateCreateInput',
        }),
      },
      resolve: async (_, args, { prisma }) => {
        const { data } = removeEmpty(args)

        console.log('Incoming createRate data:', data)

        try {
          const { fiat, rateProviderId, buy, sell, monthlyChange, datePosted } =
            data

          const fiatEntry = await prisma.fiat.upsert({
            where: { symbol: fiat.symbol },
            update: { name: fiat.name },
            create: {
              name: fiat.name,
              symbol: fiat.symbol,
              country: {
                connect: {
                  id: rateProviderId,
                },
              },
            },
          })

          return await prisma.rate.create({
            data: {
              fiatId: fiatEntry.id,
              buy,
              sell,
              monthlyChange,
              rateProviderId,
              datePosted,
            },
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.field('updateRate', {
      type: 'Rate',
      args: {
        where: arg({
          type: 'RateWhereUniqueInput',
        }),
        data: arg({
          type: 'RateUpdateInput',
        }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where, data } = removeEmpty(args)

        console.log('Incoming updateRate data:', data)

        try {
          const { fiat, buy, sell, monthlyChange, datePosted } = data

          const existingRate = await prisma.rate.findUnique({
            where,
          })

          if (!existingRate) {
            throw new Error('Rate not found')
          }

          const fiatEntry = await prisma.fiat.upsert({
            where: { symbol: fiat.symbol },
            update: { name: fiat.name },
            create: {
              name: fiat.name,
              symbol: fiat.symbol,
              country: {
                connect: {
                  id: existingRate.rateProviderId,
                },
              },
            },
          })

          return await prisma.rate.update({
            where,
            data: {
              fiatId: fiatEntry.id,
              buy,
              sell,
              monthlyChange,
              datePosted,
              rateProviderId: existingRate.rateProviderId,
            },
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.field('deleteRate', {
      type: 'Rate',
      args: {
        where: arg({
          type: 'RateWhereUniqueInput',
        }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where } = removeEmpty(args)

        try {
          return await prisma.rate.delete({
            where,
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})
