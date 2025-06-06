import { arg, extendType, intArg, nonNull } from 'nexus'
import jwt from 'jsonwebtoken'
import { IUserPayload } from './../../interfaces/IUserPayload'
import {
  sendSMS,
  randomUser,
  formatPhoneNumberWithCountryCode,
  generateOTP,
  checkIfPhoneNumberHasConsertive4Zeros,
  generateReferralLink,
  sendOtpEmail,
} from './../../utils'
import { handlePrismaError, removeEmpty } from '../helper'
import { GraphQLError } from 'graphql'
import { OtpType } from 'nexus-prisma'
import { Context } from '../context'
import { HdWallet } from './../../utils/crypto'
import { sendEmail } from '../../utils'
import axios from 'axios'

export const UserQuery = extendType({
  type: 'Query',
  definition: (t) => {
    t.nonNull.list.nonNull.field('users', {
      type: 'User',
      args: {
        where: arg({
          type: 'UserWhereInput',
        }),
        take: intArg(),
        skip: intArg(),
        orderBy: arg({
          type: 'UserOrderByInput',
        }),
      },
      resolve: async (_root, args, { prisma }) => {
        const { where, take, skip, orderBy } = removeEmpty(args)
        try {
          return await prisma.user.findMany({
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
    t.nullable.field('currentUser', {
      type: 'User',
      args: {},
      resolve: async (
        _root: any,
        _args: any,
        { user, prisma }: Context,
        _info: any,
      ) => {
        try {
          return await prisma.user.findFirst({ where: { id: user?.id! } })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})

export const UserMutation = extendType({
  type: 'Mutation',
  definition: (t) => {
    t.field('authUser', {
      type: 'AuthResponse',
      description:
        "Authenticate user's phone number or email, send OTP. This will be used for sign up and sign in of users",
      args: {
        data: nonNull(
          arg({
            type: 'AuthInput',
          }),
        ),
        referralLink: arg({
          type: 'String',
        }),
      },
      resolve: async (_, args, { prisma, req }) => {
        console.log('Args:', args)
        const { data, referralLink } = removeEmpty(args)

        const userIp = await axios
          .get('https://api.ipify.org/?format=json')
          .catch((error) => console.log(error))
        const userIpDetails = await axios
          .get(`http://ip-api.com/json/${userIp?.data?.ip}`)
          .catch((error) => console.log(error))

        if (!data.phone) {
          throw new GraphQLError('Phone or Email is required!!', {
            extensions: {
              message: 'PHONE_REQUIRED',
            },
          })
        }
        let isEmail = false
        if (data.phone.includes('@')) {
          isEmail = true
        }

        const isTestNumber = checkIfPhoneNumberHasConsertive4Zeros(data.phone)
        let phone = formatPhoneNumberWithCountryCode(data.phone)

        // For testing purposes
        if (isTestNumber) {
          phone = formatPhoneNumberWithCountryCode(data.phone, '')
        }

        const DURATION = 1000 * 60 * 10;
        const expiresAt = new Date(Date.now() + DURATION)

        const reSendOtpForNotVerifiedAccount = async (
          user: IUserPayload,
          otp: string,
          type: number,
        ) => {
          try {
            let existingOtp = await prisma.otp.findFirst({
              where: {
                userId: user.id,
                isUsed: false,
              },
            })
            if (!existingOtp) {
              existingOtp = await prisma.otp.create({
                data: {
                  token: otp,
                  type: OtpType.members[type],
                  expiresAt,
                  userId: user.id,
                },
              })
            } else if (existingOtp.expiresAt < new Date()) {
              existingOtp = await prisma.otp.create({
                data: {
                  token: otp,
                  type: OtpType.members[type],
                  expiresAt,
                  userId: user.id,
                },
              })
            }

            if (isEmail) {
              try {
                await sendOtpEmail(
                  user.email!,
                  'Dollar App Authentication OTP',
                  `Your OTP for verifying your Dollar App account is: ${existingOtp.token}`,
                  existingOtp.token,
                )
                console.log(`OTP email sent to ${user.email}`)
              } catch (err: any) {
                console.error(
                  `Sending OTP email to ${user.email} failed:`,
                  err.message,
                )
                throw new GraphQLError('Failed to send OTP email', {
                  extensions: {
                    message: 'SENDING_EMAIL',
                  },
                })
              }
            } else {
              try {
                await sendSMS({
                  phone: `+${phone}`,
                  message: `Your account verify OTP is: ${existingOtp.token}`,
                })
              } catch (err) {
                console.error(`Sending SMS to +${user.phone} failed`, err)
                throw new GraphQLError('Failed to send OTP', {
                  extensions: {
                    message: 'SENDING_SMS',
                  },
                })
              }
            }

            // update user timezone and location data
            await prisma.user.update({
              where: { id: user.id },
              data: {
                timezone: userIpDetails?.data?.timezone || undefined,
                ipDetails: userIpDetails?.data
                  ? JSON.stringify(userIpDetails?.data)
                  : undefined,
              },
            })
            return ''
          } catch (err: any) {
            return handlePrismaError(err)
          }
        }

        let user
        try {
          const orConditions = []

          if (phone && phone.trim() !== '' && !phone.includes('@')) {
            orConditions.push({
              phone: formatPhoneNumberWithCountryCode(phone),
            })
          }

          if (data.phone && data.phone.trim() !== '') {
            orConditions.push({ email: data.phone.toLowerCase() })
          }

          if (orConditions.length === 0) {
            throw new Error('No valid phone or email provided')
          }
          user = (await prisma.user.findFirst({
            where: {
              OR: orConditions,
            },
          })) as unknown as IUserPayload

          console.log('User: -> ', user)
        } catch (err: any) {
          return handlePrismaError(err.message)
        }

        const otp = generateOTP()

        if (user) {
          if (user.isActive) {
            if (isTestNumber) {
              const jwtPayload: IUserPayload = user as IUserPayload
              const token = createToken(jwtPayload)
              return {
                msg: `Successfully signed to the App`,
                token,
                expiresAt: expiresAt.toISOString(),
                status: 'success',
              }
            }

            // Send login OTP
            await reSendOtpForNotVerifiedAccount(user, otp, 4)
            return {
              msg: 'An OTP has been sent. Proceed to verify your account.',
              expiresAt: expiresAt.toISOString(),
              status: 'success',
            }
          } else {
            try {
              await reSendOtpForNotVerifiedAccount(user, otp, 1)
              return {
                msg: 'An OTP has been sent. Proceed to verify your account.',
                expiresAt: expiresAt.toISOString(),
                status: 'success',
              }
            } catch (err: any) {
              console.error(
                'Failed to resend OTP for not verified account',
                err.message,
              )
              return handlePrismaError(err.message)
            }
          }
        } else {
          console.log('No User')
          // Register new user and send OTP
          let referrer: IUserPayload | null = null
          if (referralLink) {
            referrer = (await prisma.user.findUnique({
              where: {
                referralLink: referralLink,
              },
            })) as unknown as IUserPayload

            if (!referrer) {
              throw new GraphQLError('Invalid referral link', {
                extensions: {
                  code: 'INVALID_REFERRAL_LINK',
                },
              })
            }

            // Ensure the referrer has a `referral` record
            let referrerReferral =
              referrer.referral && referrer.referral.length > 0
                ? referrer.referral[0]
                : null
            if (!referrerReferral) {
              referrerReferral = await prisma.referral.create({
                data: {
                  referrerId: referrer.id,
                },
                include: {
                  referralUsage: true,
                },
              })
            }

            // Ensure the referrer has at least one `referralUsage` entry
            if (referrer.referralUsage.length === 0) {
              await prisma.referralUsage.create({
                data: {
                  referralId: referrerReferral.id,
                  userId: referrer.id,
                },
              })
            }

            console.log('Referrer:', referrer)
            console.log('Referrer Referral:', referrer.referral)

            // Affliate the new user with the referrer

            const username = randomUser()

            console.log('Error  Username: ', username)

            try {
              user = (await prisma.user.create({
                data: {
                  phone: isEmail ? '' : phone,
                  isActive: false,
                  email: isEmail ? data.phone?.toLowerCase() : undefined,
                  username,
                  referralLink: '',
                },
                include: {
                  referralUsage: true,
                  referral: true,
                },
              })) as unknown as IUserPayload

              console.log('New User:', user)

              // referral table for the new user
              let HOST_URI = `https://${req.hostname?.replaceAll(
                'api.',
                'app.',
              )}/grow-money/`

              const newReferralLink = generateReferralLink(HOST_URI, user.id)

              await prisma.user.update({
                where: {
                  id: user.id,
                },
                data: {
                  referralLink: newReferralLink,
                },
              })

              await prisma.referral.create({
                data: {
                  referrerId: user.id,
                },
                include: {
                  referralUsage: true,
                },
              })

              // referral usage table for the new user
              await prisma.referralUsage.create({
                data: {
                  referralId: referrerReferral.id,
                  userId: user.id,
                },
                include: {
                  user: true,
                  referral: true,
                },
              })

              await reSendOtpForNotVerifiedAccount(user, otp, 1)
              return {
                msg: 'Successfully registered. An OTP has been sent, please verify your account',
                expiresAt: expiresAt.toISOString(),
                status: 'success',
              }
            } catch (err: any) {
              return handlePrismaError(err)
            }
          } else {
            try {
              const username = randomUser()
              user = (await prisma.user.create({
                data: {
                  phone: isEmail ? '' : phone,
                  username,
                  email: isEmail ? data.phone?.toLowerCase() : undefined,
                  isActive: false,
                  referralLink: '',
                },
              })) as unknown as IUserPayload
            } catch (err: any) {
              console.log('Error: ', err)
              return handlePrismaError(err)
            }

            let HOST_URI = `https://${req.hostname?.replaceAll(
              'api.',
              'app.',
            )}/grow-money/`
            // let USER_ID = user.id
            const newReferralLink = generateReferralLink(HOST_URI, user.id)

            await prisma.user.update({
              where: {
                id: user.id,
              },
              data: {
                referralLink: newReferralLink,
              },
            })

            // create referral table for the new user
            await prisma.referral.create({
              data: {
                referrerId: user.id,
              },
              include: {
                referralUsage: true,
              },
            })

            // create referral usage table for the new user
            await prisma.referralUsage.create({
              data: {
                referralId: user.referral?.id,
                userId: user.id,
              },
              include: {
                user: true,
                referral: true,
              },
            })

            console.log('New User Referral Usage:', user.referralUsage)
            await reSendOtpForNotVerifiedAccount(user, otp, 1)
            return {
              msg: 'Successfully registered. An OTP has been sent, please verify your account',
              expiresAt: expiresAt.toISOString(),
              status: 'success',
            }
          }
        }
      },
    })

    t.field('authVerify', {
      type: 'AuthResponse',
      args: {
        where: nonNull(
          arg({
            type: 'UserOtpInput',
          }),
        ),
      },
      resolve: async (_, args, { prisma }) => {
        const { where } = removeEmpty(args)

        // update to use phone number or email
        const orConditions = []

        if (
          where.phone &&
          where.phone.trim() !== '' &&
          !where.phone.includes('@')
        ) {
          orConditions.push({
            phone: formatPhoneNumberWithCountryCode(where.phone),
          })
        }

        if (where.phone && where.phone.trim() !== '') {
          orConditions.push({ email: where.phone.toLowerCase() })
        }

        if (orConditions.length === 0) {
          throw new Error('No valid phone or email provided')
        }

        console.log('Auth User Found: ', orConditions)

        const exists = await prisma.user.findFirst({
          where: {
            OR: orConditions,
          },
        })

        if (!exists) {
          throw new GraphQLError('User not found', {
            extensions: { code: 'USER_NOT_FOUND', statusCode: 4004 },
          })
        }
        const otpMessage = await prisma.otp.findFirst({
          where: {
            token: where.token,
            userId: exists.id,
          },
        })

        if (!otpMessage) {
          throw new GraphQLError('Invalid Otp', {
            extensions: { code: 'INVALID_OTP', statusCode: 4003 },
          })
        }

        if (otpMessage.isUsed) {
          throw new GraphQLError('OTP is invalid. Please request another one', {
            extensions: { code: 'OTP_USED', statusCode: 4006 },
          })
        }

        // check if otp has expired
        if (otpMessage.expiresAt < new Date()) {
          throw new GraphQLError('OTP has expired', {
            extensions: { code: 'OTP_EXPIRED', statusCode: 4005 },
          })
        }

        let user

        try {
          user = (await prisma.user.findFirst({
            where: { id: otpMessage.userId },
          })) as unknown as IUserPayload
        } catch (err: any) {
          return handlePrismaError(err)
        }
        if (!user) {
          throw new GraphQLError('Not Found', {
            extensions: { code: 'NOT_FOUND', statusCode: 4004 },
          })
        }

        const jwtPayload: IUserPayload = user as IUserPayload

        let action = 'sign in'

        // generate token
        const token = createToken(jwtPayload)
        // what action is the opt for  LoginVerify(Login ->  4)  or VerifyPhone(Regisger - 1)
        if (otpMessage.type === OtpType.members[4]) {
          // login
          action = 'sign in'
        } else {
          action = 'sign up'
          // user wants to sign up
          const wallet = await prisma.fiatWallet.findFirst({
            where: { userId: user.id },
          })

          if (!wallet) {
            // create wallet for user
            try {
              await prisma.fiatWallet.create({
                data: {
                  user: { connect: { id: user.id } },
                  balance: 0,
                  fiat: { connect: { symbol: 'KES' } },
                },
              })
              // activate use account
              await prisma.user.update({
                where: {
                  id: user.id,
                },
                data: {
                  isActive: true,
                },
              })
              // Create Cryto Account
              const cryptoWalletData = new HdWallet().create()

              const crypto = await prisma.cryptoWallet.create({
                data: {
                  userId: user.id,
                  networkId: 1,
                  mnemonic: cryptoWalletData.mnemonic?.phrase!,
                },
              })

              await prisma.cryptoAccount.create({
                data: {
                  cryptoWalletId: crypto.id,
                  address: cryptoWalletData.address!,
                  privateKey: cryptoWalletData.privateKey!,
                },
              })
            } catch (error: any) {
              return handlePrismaError(error)
            }
          }
          // gotcha ( if user has wallet)
        }

        // Update verification status for phone or email
        const updateData: Record<string, any> = {}

        // Verify the phone if the user provided a phone number and it's not already verified
        if (orConditions.some((cond) => cond.phone) && !user.phoneVerified) {
          updateData.phoneVerified = true
        }

        // Verify the email if the user provided an email address and it's not already verified
        if (orConditions.some((cond) => cond.email) && !user.emailVerified) {
          updateData.emailVerified = true
        }

        try {
          // invalidate the token and update the otp message to used
          await prisma.otp.update({
            where: { id: otpMessage.id },
            data: { isUsed: true },
          })

          //check if there is any update data for verify phone or email status
          if (Object.keys(updateData).length === 0) {
            console.log('No verify phone or email status update data')
          } else {
            console.log('updateData', updateData)
            // Update the user to mark phone or email as verified
            await prisma.user.update({
              where: { id: user.id },
              data: updateData,
            })
          }

          return {
            msg: `Successfully validated your ${action} OTP`,
            token,
            status: 'success',
          }
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    }),
      // register
      t.field('updateProfile', {
        type: 'User',
        args: {
          data: nonNull(
            arg({
              type: 'UserUpdateInput',
            }),
          ),
        },

        resolve: async (_, args, { prisma, user }) => {
          const { data } = removeEmpty(args)
          console.log('update data', data)

          if (!user) {
            throw new GraphQLError('Not authorized', {
              extensions: { code: 'USER_NOT_FOUND' },
            })
          }

          // Format phone number if provided
          let formattedPhone: string | null = null
          let otpMessage: string | null = null

          // Handle phone updates
          if (data.phone) {
            formattedPhone = formatPhoneNumberWithCountryCode(data.phone)

            // Check if the user already has a verified phone
            if (user.phone && user.phoneVerified) {
              throw new GraphQLError(
                'Phone number cannot be updated once verified',
                {
                  extensions: { code: 'PHONE_ALREADY_VERIFIED' },
                },
              )
            }

            // Check if the formatted phone number is already in use by another user
            const existingUserWithPhone = await prisma.user.findFirst({
              where: { phone: formattedPhone },
            })

            if (existingUserWithPhone && existingUserWithPhone.id !== user.id) {
              throw new GraphQLError('Phone number is already in use', {
                extensions: { code: 'PHONE_IN_USE' },
              })
            }
          }

          // Handle email updates
          if (data.email) {
            // Check if the user already has a verified email
            if (user.email && user.emailVerified) {
              throw new GraphQLError('Email cannot be updated once verified', {
                extensions: { code: 'EMAIL_ALREADY_VERIFIED' },
              })
            }

            // Check if the new email is already in use by another user
            const existingUserWithEmail = await prisma.user.findFirst({
              where: { email: data.email },
            })

            if (existingUserWithEmail && existingUserWithEmail.id !== user.id) {
              throw new GraphQLError('Email is already in use', {
                extensions: { code: 'EMAIL_IN_USE' },
              })
            }
          }

          // Send OTP for phone verification if phone was updated
          if (formattedPhone) {
            const otp = generateOTP()
            await prisma.otp.create({
              data: {
                userId: user.id,
                token: otp,
                type: OtpType.members[1], // OTP for phone verification
                expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min expiry
              },
            })

            otpMessage = `Your Verify Phone OTP code is ${otp}`

            // Send OTP via SMS
            await sendSMS({ phone: `+${formattedPhone}`, message: otpMessage })
          }

          // Send OTP for email verification if email was updated
          if (data.email) {
            const otp = generateOTP()
            await prisma.otp.create({
              data: {
                userId: user.id,
                token: otp,
                type: OtpType.members[0], // OTP for email verification
                expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min expiry
              },
            })

            otpMessage = `Your Verify Email OTP code is ${otp}`

            // Send OTP via email
            await sendEmail(
              data.email,
              'Dollar App Update Profile OTP',
              otpMessage,
            )
          }

          try {
            const updatedUser = await prisma.user.update({
              where: { id: user?.id! },
              data: {
                ...data,
                pendingPhone: formattedPhone || undefined,
                pendingEmail: data.email || undefined,
                phone: undefined, // Prevent direct phone updates
                email: undefined, // Prevent direct email updates
              },
            })

            // TODO Update Gobal UserInfo with updated user data
            return updatedUser
          } catch (error: any) {
            return handlePrismaError(error)
          }
        },
      })

    t.field('verifyOtpForProfileUpdate', {
      type: 'User',
      args: {
        otp: nonNull(arg({ type: 'String' })),
        type: nonNull(arg({ type: 'OtpType' })), // 'VerifyEmail' or 'VerifyPhone'
      },
      resolve: async (_, { otp, type }, { prisma, user }) => {
        if (!user) {
          throw new GraphQLError('Not authorized', {
            extensions: { code: 'USER_NOT_FOUND' },
          })
        }
        const userInfo = await prisma.user.findFirst({
          where: { id: user.id },
        })
        console.log('', userInfo)
        if (!userInfo) {
          throw new GraphQLError('User not found', {
            extensions: { code: 'USER_NOT_FOUND' },
          })
        }

        // check for pending phone or email
        if (!userInfo.pendingPhone && !userInfo.pendingEmail) {
          throw new GraphQLError('No pending phone number or email found', {
            extensions: { code: 'NO_PENDING_PHONE_OR_EMAIL' },
          })
        }

        // Check OTP validity
        const otpRecord = await prisma.otp.findFirst({
          where: {
            token: otp,
            userId: user.id,
            type: type,
          },
        })

        if (!otpRecord) {
          throw new GraphQLError('Invalid OTP', {
            extensions: { code: 'INVALID_OTP' },
          })
        }

        // OTP expired: Resend new OTP
        if (otpRecord.expiresAt < new Date()) {
          console.log('OTP has expired, generating a new one...')

          const newOtp = generateOTP() // Generate a new OTP

          // Update OTP record with new OTP and expiration time
          await prisma.otp.create({
            data: {
              userId: user.id,
              token: newOtp,
              type: otpRecord.type,
              expiresAt: new Date(Date.now() + 15 * 60 * 1000), // Set new expiration to 15 minutes
            },
          })

          let message = ''

          if (type === 'VerifyPhone') {
            // Resend the OTP via SMS
            message = `Your new Verify Phone OTP code is ${newOtp}`
            await sendSMS({ phone: `+${userInfo.pendingPhone}`, message })
          } else if (type === 'VerifyEmail') {
            // Resend the OTP via Email
            message = `Your new Verify Email OTP code is ${newOtp}`
            await sendEmail(
              userInfo.pendingEmail!,
              'Verify your Email',
              message,
            )
          }

          throw new GraphQLError('OTP expired, a new one has been sent.', {
            extensions: { code: 'OTP_EXPIRED', newOtpSent: true },
          })
        }

        if (otpRecord.isUsed) {
          throw new GraphQLError('OTP is invalid. Please request another one', {
            extensions: { code: 'OTP_USED', statusCode: 4006 },
          })
        }

        // Update the phone or email field
        let updatedUser
        if (type === 'VerifyPhone' && userInfo.pendingPhone) {
          updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
              phone: userInfo.pendingPhone,
              pendingPhone: null, // Clear pending phone
              phoneVerified: true,
            },
          })
        } else if (type === 'VerifyEmail' && userInfo.pendingEmail) {
          updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
              email: userInfo.pendingEmail,
              pendingEmail: null, // Clear pending email
              emailVerified: true,
            },
          })
        } else {
          throw new GraphQLError('No pending update for the given type', {
            extensions: { code: 'NO_PENDING_UPDATE' },
          })
        }

        // Invalidate the OTP after use
        await prisma.otp.update({
          where: { id: otpRecord.id },
          data: { isUsed: true },
        })

        return updatedUser
      },
    })

    t.field('logOut', {
      type: 'User',
      args: {
        where: nonNull(
          arg({
            type: 'UserWhereUniqueInput',
          }),
        ),
      },
      resolve: async (_, args, { prisma, req }) => {
        const { data } = removeEmpty(args)
        try {
          const user = await prisma.user.findFirst({
            where: {
              id: data.id,
            },
          })
          req.headers.authorization = ''

          return user
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})

const createToken = (jwtPayload: IUserPayload): string => {
  // generate token
  const token = jwt.sign(
    {
      id: jwtPayload.id,
      phone: jwtPayload.phone,
      email: jwtPayload.email,
      firstName: jwtPayload.firstName,
      lastName: jwtPayload.lastName,
      userType: jwtPayload.userType,
      username: jwtPayload.username,
      isActive: jwtPayload.isActive,
      createdAt: jwtPayload.createdAt,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: '24h',
    },
  )
  return token
}
