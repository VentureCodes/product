import { arg, queryType } from 'nexus'
import { CurrencyRate } from '../typedefs/model/currencyRate'
import { converter } from '../../utils/currencyApi'
import { CurrencyRateInput } from '../typedefs/input/currencyRateInput'
import { CryptoRate } from '../typedefs/model/CryptoRate'
import { CryptoRateInput } from '../typedefs/input/cryptoRateInput'
import { GraphQLError } from 'graphql'
import { handlePrismaError } from '../helper'

const supportedCoins = ['BTC', 'ETH', 'BNB', 'SOL']
export const currencyCachePeriod = 1000 * 60 * 60 * 24 // 24 hours

export const CurrencyRateQuery = queryType({
  definition(t) {
    // t.field('currencyRate', {
    //   type: CurrencyRate,
    //   args: {
    //     input: arg({ type: CurrencyRateInput }),
    //   },
    //   resolve: async (_, { input }, { prisma }) => {
    //     try {
    //       const currencyPair = `${input!.base_currency}_${input!.currency}`

    //       // Check if the rate is already cached
    //       const cached = await prisma.currencyRateCache.findFirst({
    //         where: {
    //           OR: [
    //             {
    //               currencyPair,
    //             },
    //             {
    //               currencyPair: `${input!.currency}_${input!.base_currency}`,
    //             },
    //           ],
    //         },
    //       })

    //       console.log('Cached rate ', cached)

    //       if (!cached) {
    //         // Get rates from the API

    //         console.log('Rate not found. Fetching from API ', currencyPair)

    //         const data = await converter.convert({
    //           base_currency: input!.base_currency,
    //           value: input!.value,
    //           currency: [input!.currency],
    //         })

    //         if (!data.meta || !data.data) {
    //           throw new GraphQLError('Failed to fetch currency data', {
    //             extensions: {
    //               code: 'CURRENCY_API_ERROR',
    //               http: {
    //                 status: 500,
    //               },
    //             },
    //           })
    //         }

    //         // Cache rate in db
    //         const rate = data.data[input!.currency]

    //         await prisma.currencyRateCache.create({
    //           data: {
    //             code: input!.currency,
    //             currencyPair,
    //             rate: rate.value,
    //             updatedAt: new Date(),
    //           },
    //         })

    //         return {
    //           meta: data.meta,
    //           data: rate,
    //         }
    //       } else if (
    //         cached &&
    //         new Date().getTime() - cached.updatedAt.getTime() >
    //           currencyCachePeriod
    //       ) {
    //         console.log(
    //           'Rate already expired. Fetching from API ',
    //           currencyPair,
    //         )

    //         const data = await converter.convert({
    //           base_currency: input!.base_currency,
    //           value: input!.value,
    //           currency: [input!.currency],
    //         })

    //         if (!data.meta || !data.data) {
    //           throw new GraphQLError('Failed to fetch currency data', {
    //             extensions: {
    //               code: 'CURRENCY_API_ERROR',
    //               http: {
    //                 status: 500,
    //               },
    //             },
    //           })
    //         }

    //         // Cache rate in db
    //         const rate = data.data[input!.currency]

    //         if (cached?.currencyPair == currencyPair) {
    //           await prisma.currencyRateCache.update({
    //             where: {
    //               currencyPair,
    //             },
    //             data: {
    //               rate: {
    //                 set: rate.value,
    //               },
    //             },
    //           })
    //         } else {
    //           await prisma.currencyRateCache.update({
    //             where: {
    //               currencyPair: `${input!.currency}_${input!.base_currency}`,
    //             },
    //             data: {
    //               rate: {
    //                 set: rate.value,
    //               },
    //             },
    //           })
    //         }

    //         return {
    //           meta: data.meta,
    //           data: rate,
    //         }
    //       } else {
    //         console.log('Returning cached rate ', currencyPair)

    //         const meta = {
    //           last_updated_at: cached.updatedAt.toISOString(),
    //         }

    //         if (cached?.currencyPair == currencyPair) {
    //           return {
    //             meta,
    //             data: {
    //               code: input!.currency,
    //               value: cached.rate * parseFloat(input!.value),
    //             },
    //           }
    //         } else {
    //           // In this case the currency pair is reversed, so we need to reverse the rate

    //           return {
    //             meta,
    //             data: {
    //               code: input!.currency,
    //               value: (1 / cached.rate) * parseFloat(input!.value),
    //             },
    //           }
    //         }
    //       }
    //     } catch (error: any) {
    //       if (error.meta) {
    //         return handlePrismaError(error)
    //       } else {
    //         console.log(
    //           error.response
    //             ? error.response.data
    //             : 'Error occurred while fetching currency data',
    //         )
    //         throw new GraphQLError(
    //           'Error occurred while fetching currency data',
    //           {
    //             extensions: {
    //               code: 'CURRENCY_API_ERROR',
    //               http: {
    //                 status: 500,
    //               },
    //             },
    //           },
    //         )
    //       }
    //     }
    //   },
    // })
    t.field('currencyRate', {
      type: CurrencyRate,
      args: {
        input: arg({ type: CurrencyRateInput }),
      },
      resolve: async (_, { input }, { prisma }) => {
        try {
          const { base_currency, currency, value } = input!
          const currencyPair = `${base_currency}_${currency}`
          const reversePair = `${currency}_${base_currency}`

          // Fetch cached rate
          const cachedRate = await getCachedRate(
            prisma,
            currencyPair,
            reversePair,
          )
          const isExpired = isCacheExpired(cachedRate.updatedAt)
          console.log('Cached rate: ', currencyPair, isExpired, cachedRate)
          if (cachedRate) {
            return formatResponse(cachedRate, value, currencyPair) as any
          }

          // Fetch new rate from API
          console.log(`Fetching new rate for ${currencyPair}...`)
          const newRate = await fetchExchangeRate(
            base_currency,
            currency,
            value,
          )
          console.log('New rate fetched: ', newRate)
          if (!newRate)
            throw new GraphQLError('Failed to fetch currency data', errorMeta())

          // Update or create cache
          await updateCache(prisma, currencyPair, reversePair, newRate)

          return {
            meta: newRate.meta,
            data: newRate.data[currency],
          } as any
        } catch (error: any) {
          return handleError(error)
        }
      },
    })

    // Function to fetch cached rate
    async function getCachedRate(
      prisma: any,
      currencyPair: any,
      reversePair: any,
    ) {
      return prisma.currencyRateCache.findFirst({
        where: { OR: [{ currencyPair }, { currencyPair: reversePair }] },
      })
    }

    // Function to check cache expiry
    function isCacheExpired(updatedAt: any) {
      const isExpired =
        new Date().getTime() - updatedAt.getTime() > currencyCachePeriod
      return isExpired
    }

    // Function to fetch exchange rate from API
    async function fetchExchangeRate(
      base_currency: any,
      currency: any,
      value: any,
    ) {
      const data = await converter.convert({
        base_currency,
        value,
        currency: [currency],
      })
      return data.meta && data.data ? data : null
    }

    // Function to update or create cache entry
    async function updateCache(
      prisma: any,
      currencyPair: any,
      reversePair: any,
      newRate: any,
    ) {
      const rateValue = newRate.data[currencyPair.split('_')[1]].value
      const existingEntry = await prisma.currencyRateCache.findFirst({
        where: { OR: [{ currencyPair }, { currencyPair: reversePair }] },
      })

      if (existingEntry) {
        await prisma.currencyRateCache.update({
          where: { currencyPair: existingEntry.currencyPair },
          data: { rate: rateValue, updatedAt: new Date() },
        })
      } else {
        await prisma.currencyRateCache.create({
          data: {
            code: currencyPair.split('_')[1],
            currencyPair,
            rate: rateValue,
            updatedAt: new Date(),
          },
        })
      }
    }

    // Function to format response
    function formatResponse(cachedRate: any, value: any, currencyPair: any) {
      const code = currencyPair.split('_')[1]
      let conversionRate = 0
      if (code == 'USD') {
        conversionRate = 1 / cachedRate.rate
      } else if (code == 'KES') {
        conversionRate = cachedRate.rate
      }
      // const conversionRate =
      //   cachedRate.currencyPair === currencyPair
      //     ? 1 / cachedRate.rate
      //     : cachedRate.rate

      console.log('Conversion rate: ', conversionRate, 'Code:', code)

      return {
        meta: { last_updated_at: cachedRate.updatedAt.toISOString() },
        data: {
          code: currencyPair.split('_')[1],
          value: conversionRate * parseFloat(value),
        },
      }
    }

    // Error handling function
    function handleError(error: any) {
      console.error(
        error.response ? error.response.data : 'Error fetching currency data',
      )
      throw new GraphQLError('Error fetching currency data', errorMeta())
    }

    // Standard error metadata
    function errorMeta() {
      return {
        extensions: { code: 'CURRENCY_API_ERROR', http: { status: 500 } },
      }
    }
    // ######################################################################################
    t.field('cryptoRate', {
      type: CryptoRate,
      args: {
        input: arg({ type: CryptoRateInput }),
      },
      resolve: async (_, { input }) => {
        let allData: any = {}
        let meta

        for (let i = 0; i < supportedCoins.length; i++) {
          const base_currency = supportedCoins[i]
          try {
            const data = await converter.convert({
              base_currency,
              value: '1',
              currency: [input!.currency],
            })

            if (!data.meta || !data.data) {
              throw new GraphQLError('Failed to fetch currency data', {
                extensions: {
                  code: 'CURRENCY_API_ERROR',
                  http: {
                    status: 500,
                  },
                },
              })
            }

            allData[base_currency] = data.data[input!.currency]
            meta = data.meta
          } catch (error: any) {
            if (error.meta) {
              return handlePrismaError(error)
            } else {
              console.log(
                error.response
                  ? error.response.data
                  : 'Error occurred while fetching currency data',
              )
              throw new GraphQLError(
                'Error occurred while fetching currency data',
                {
                  extensions: {
                    code: 'CURRENCY_API_ERROR',
                    http: {
                      status: 500,
                    },
                  },
                },
              )
            }
          }
        }

        return {
          meta,
          data: allData,
        }
      },
    })
  },
})
