import { arg, extendType, intArg } from 'nexus'
import { handlePrismaError, removeEmpty } from '../helper'
// import { GraphQLError } from 'graphql'

export const ReferralQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('referrals', {
      type: 'Referral',
      description: 'Get a list of referrals',
      args: {
        take: intArg(),
        skip: intArg(),
        orderBy: arg({
          type: 'ReferralOrderByInput',
        }),
        where: arg({
          type: 'ReferralWhereInput',
        }),
      },
      resolve: async (_root, args, { prisma }) => {
        const { where, take, skip, orderBy } = removeEmpty(args)
        try {
          const referrals = await prisma.referral.findMany({
            where,
            take,
            skip,
            orderBy,
            include: {
              referralUsage: true,
              referrer: true,
            },
          })
          return referrals.map((referral) => ({
            ...referral,
            referrerId: referral.referrerId ?? '',
          }))
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.nullable.field('referralUsage', {
      type: 'ReferralUsage',
      description: 'Get referral usage by unique userID',
      args: {
        where: arg({
          type: 'ReferralUsageWhereUniqueInput',
        }),
      },
      resolve: async (_root, args, { prisma }) => {
        const { where } = removeEmpty(args)
        try {
          const referralUsage = await prisma.referralUsage.findUnique({
            where,
            include: {
              user: true,
              referral: true,
            },
          })

          if (referralUsage) {
            return {
              ...referralUsage,
              referralId: referralUsage.referralId ?? '',
            }
          }

          return null
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.nullable.field('referral', {
      type: 'Referral',
      description: 'Get a referral by unique ID or referrer ID',
      args: {
        where: arg({
          type: 'ReferralWhereUniqueInput',
        }),
      },
      resolve: async (_root, args, { prisma }) => {
        const { where } = removeEmpty(args)
        try {
          const referral = await prisma.referral.findUnique({
            where,
            include: {
              referralUsage: true,
            },
          })

          if (referral) {
            return {
              ...referral,
              referrerId: referral.referrerId ?? '',
            }
          }

          return null
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.nullable.list.field('referralUsers', {
      type: 'User',
      description: ' Get list of users who have used the referralLink',
      args: {
        where: arg({
          type: 'ReferralWhereUniqueInput',
        }),
      },
      resolve: async (_root, args, { prisma }) => {
        const { where } = removeEmpty(args)
        try {
          const referral = await prisma.referral.findUnique({
            where,
            include: {
              referralUsage: {
                include: {
                  user: true,
                },
              },
            },
          })
          // If no referral or usage found, return an empty array
          if (!referral || !referral.referralUsage) {
            return []
          }

          // Return users from referral usage
          return referral.referralUsage.map((usage) => usage.user)
        } catch (error: any) {
          console.error('Error fetching referral users:', error)
          return handlePrismaError(error)
        }
      },
    })

    t.nullable.list.field('userReferralUsage', {
      type: 'ReferralUsage',
      description:
        'Get referral usage by user ID (for tracking referral a user has used)',
      args: {
        where: arg({
          type: 'ReferralUsageWhereInput',
        }),
      },
      resolve: async (_root, args, { prisma }) => {
        const { where } = removeEmpty(args)
        try {
          const referralUsages = await prisma.referralUsage.findMany({
            where,
            include: {
              user: true,
              referral: true,
            },
          })
          return referralUsages.map((usage) => ({
            ...usage,
            referralId: usage.referralId ?? '',
          }))
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})

// export const ReferralMutation = extendType({
//   type: 'Mutation',
//   definition(t) {
//     t.nonNull.field('createReferral', {
//       type: 'CreateReferralPayload',
//       description: 'Create a new referral',
//       args: {
//         data: arg({
//           type: 'ReferralCreateInput',
//         }),
//       },
//       resolve: async (_root, args, { prisma, user }) => {
//         if (!user?.id) {
//           throw new GraphQLError('User is not authenticated', {
//             extensions: { code: 'UNAUTHENTICATED' },
//           })
//         }

//         const { data } = removeEmpty(args)
//         const { referralLink } = data

//         // Check if the referral link already exists
//         let referrer = await prisma.user.findFirst({
//           where: {
//             referralLink: referralLink,
//           },
//           include: {
//             referralUsage: true,
//             referral: {
//               select: { id: true, referrerId: true },
//             },
//           },
//         })

//         if (!referrer) {
//           throw new GraphQLError('Invalid referral link', {
//             extensions: { code: 'INVALID_REFERRAL_LINK' },
//           })
//         }

//         // If the referrer has no referral, create one
//         if (referrer.referral.length === 0) {
//           await prisma.referral.create({
//             data: { referrerId: referrer.id },
//           })

//           // Refetch the referral to get the new entry
//           let referrer1 = await prisma.user.findFirst({
//             where: {
//               id: referrer.id,
//             },
//             include: {
//               referral: true,
//             },
//           })

//           if (!referrer1) {
//             throw new GraphQLError(
//               'Invalid referral link after creation',
//               {
//                 extensions: { code: 'INVALID_REFERRAL_LINK' },
//               },
//             )
//           }
//         }

//         // If the referrer has no referralUsage, create one
//         if (referrer.referralUsage.length === 0) {
//           await prisma.referralUsage.create({
//             data: {
//               referralId: referrer.referral[0].id,
//               userId: referrer.id,
//             },
//           })
//         }

//         try {
//           // Create a new referralUsage entry for the new user
//           return await prisma.referralUsage.create({
//             data: {
//               user: { connect: { id: user.id } },
//               referral: {
//                 connect: {
//                   referrerId: referrer.id,
//                   id: referrer.referral[0].id,
//                 },
//               },
//             },
//             include: {
//               user: true,
//               referral: true,
//             },
//           })
//         } catch (error: any) {
//           return handlePrismaError(error)
//         }
//       },
//     })
//   },
// })
