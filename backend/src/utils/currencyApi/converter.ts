import { PrismaClient } from '@prisma/client'
import { GraphQLError } from 'graphql'
import { converter } from './convert'

const prisma = new PrismaClient()
export const currencyCachePeriod = 1000 * 60 * 60 * 24 // 24 hours

type ConvertCurrencyInput = {
  base_currency: string
  value: string
  currency: string
}

// Helper function to convert currency and crypto
export const convertCurrencyOrCrypto = async (input: ConvertCurrencyInput) => {
  const { base_currency, value, currency } = input
  const currencyPair = `${base_currency}_${currency}`

  try {
    // Check if the rate is cached
    const cachedRate = await prisma.currencyRateCache.findFirst({
      where: {
        OR: [
          { currencyPair },
          { currencyPair: `${currency}_${base_currency}` }, // For reverse pair
        ],
      },
    })

    if (cachedRate) {
      const isExpired =
        new Date().getTime() - cachedRate.updatedAt.getTime() >
        currencyCachePeriod

      if (!isExpired) {
        console.log('Returning cached rate')

        const meta = {
          last_updated_at: cachedRate.updatedAt.toISOString(),
        }

        if (cachedRate.currencyPair === currencyPair) {
          return {
            meta,
            data: {
              code: currency,
              value: cachedRate.rate * parseFloat(value),
            },
          }
        } else {
          // Reverse rate for the opposite pair
          return {
            meta,
            data: {
              code: currency,
              value: (1 / cachedRate.rate) * parseFloat(value),
            },
          }
        }
      }

      console.log('Cached rate expired. Fetching from API...')
    } else {
      console.log('Rate not found in cache. Fetching from API...')
    }

    // Fetch from API if no cache or cache expired
    const apiResponse = await converter.convert({
      base_currency,
      value,
      currency: [currency],
    })

    if (!apiResponse.meta || !apiResponse.data) {
      throw new GraphQLError('Failed to fetch currency data', {
        extensions: {
          code: 'CURRENCY_API_ERROR',
          http: {
            status: 500,
          },
        },
      })
    }

    const rate = apiResponse.data[currency]

    // Update or insert the rate into cache
    if (cachedRate) {
      await prisma.currencyRateCache.update({
        where: {
          currencyPair:
            cachedRate.currencyPair === currencyPair
              ? currencyPair
              : `${currency}_${base_currency}`,
        },
        data: {
          rate: rate.value,
          updatedAt: new Date(),
        },
      })
    } else {
      await prisma.currencyRateCache.create({
        data: {
          code: currency,
          currencyPair,
          rate: rate.value,
          updatedAt: new Date(),
        },
      })
    }

    // Return the fetched rate
    return {
      meta: apiResponse.meta,
      data: {
        code: currency,
        value: rate.value * parseFloat(value),
      },
    }
  } catch (error: any) {
    console.error(
      'Error occurred during conversion:',
      error.response ? error.response.data : error.message,
    )
    throw new GraphQLError('Error occurred while fetching currency data', {
      extensions: {
        code: 'CURRENCY_API_ERROR',
        http: {
          status: 500,
        },
      },
    })
  }
}
