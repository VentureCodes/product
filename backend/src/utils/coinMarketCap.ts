import NodeCache from 'node-cache'
import NodeCron from 'node-cron'
import { coinmarketClient } from './request'
import { CoinMarketCapTokenTypes, Cryptocurrency } from '../typings/coinmarket'

export const APP_CACHE = new NodeCache()

export const gainersAndLoserCoins = async () => {
  let response: Cryptocurrency[] = []
  return new Promise<Cryptocurrency[]>(async (resolve, reject) => {
    try {
      // else fetch data from the source
      const { data } = await coinmarketClient.get<CoinMarketCapTokenTypes>(
        '/v1/cryptocurrency/trending/latest',
        {
          params: {
            start: 1,
            limit: 20,
            convert: 'USD',
            time_period: '24h',
          },
        },
      )

      const quoteData = data?.data?.map((item: any) => {
        const {
          name,
          symbol,
          circulating_supply,
          total_supply,
          max_supply,
          cmc_rank,
        } = item

        const quote = item.quote?.USD
        if (!quote) {
          console.error(`Missing quote data for item: ${symbol}`, item)
          return null // Skip items without quote data
        }

        return {
          name,
          symbol,
          circulating_supply,
          total_supply,
          max_supply,
          cmc_rank,
          price: quote.price,
          volume_24h: quote.volume_24h,
          market_cap: quote.market_cap,
          percent_change_1h: quote.percent_change_1h,
          percent_change_24h: quote.percent_change_24h,
          percent_change_7d: quote.percent_change_7d,
          percent_change_30d: quote.percent_change_30d,
        }
      })

      // Filter out null items
      response = quoteData.filter((item) => item !== null)
      resolve(response)
    } catch (error) {
      console.error('Error fetching trending coins:', error)
      reject(response)
    }
  })
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
// use coin market cap api to get the price of a token
// export const getTokenPrice = async (
//   symbol: string,
// ): Promise<Cryptocurrency | null> => {
//   let response: Cryptocurrency | null = null
//   return new Promise<Cryptocurrency | null>(async (resolve, reject) => {
//     try {
//       const { data } = await coinmarketClient.get<CoinMarketCapTokenTypes>(
//         '/v1/cryptocurrency/quotes/latest',
//         {
//           params: {
//             symbol,
//             convert: 'USD',
//           },
//         },
//       )

//       const assetSymbol: any = data?.data
//       if (!assetSymbol || !assetSymbol[symbol]) {
//         console.error(`Symbol not found in response: ${symbol}`)
//         throw new Error(`Symbol not found: ${symbol}`)
//       }

//       const asset = assetSymbol[symbol]
//       if (!asset?.quote?.USD) {
//         console.error(`Quote data missing for symbol: ${symbol}`, asset)
//         throw new Error(`Quote data missing for symbol: ${symbol}`)
//       }

//       const quote = asset.quote.USD

//       const modifiedItem = {
//         name: asset.name,
//         symbol: asset.symbol,
//         circulating_supply: asset.circulating_supply,
//         total_supply: asset.total_supply,
//         max_supply: asset.max_supply,
//         cmc_rank: asset.cmc_rank,
//         price: quote.price,
//         volume_24h: quote.volume_24h,
//         market_cap: quote.market_cap,
//         percent_change_1h: quote.percent_change_1h,
//         percent_change_24h: quote.percent_change_24h,
//         percent_change_7d: quote.percent_change_7d,
//         percent_change_30d: quote.percent_change_30d,
//       }

//       // cache assets data

//       APP_CACHE.set(symbol, JSON.stringify(modifiedItem), 7200)

//       resolve(modifiedItem)
//     } catch (error) {
//       console.log(error)
//       reject(response)
//     }

//     return response
//   })
// }
export const getTokenPrice = async (
  symbol: string,
): Promise<Cryptocurrency | null> => {
  let attempts = 0
  while (attempts < 3) {
    try {
      const { data } = await coinmarketClient.get<CoinMarketCapTokenTypes>(
        '/v1/cryptocurrency/quotes/latest',
        { params: { symbol, convert: 'USD' } },
      )

      const assetSymbol: any = data?.data
      if (!assetSymbol || !assetSymbol[symbol]) {
        throw new Error(`Symbol not found: ${symbol}`)
      }

      const asset = assetSymbol[symbol]
      const quote = asset.quote?.USD
      if (!quote) {
        throw new Error(`Quote data missing for symbol: ${symbol}`)
      }

      const modifiedItem: Cryptocurrency = {
        name: asset.name,
        symbol: asset.symbol,
        circulating_supply: asset.circulating_supply,
        total_supply: asset.total_supply,
        max_supply: asset.max_supply,
        cmc_rank: asset.cmc_rank,
        price: quote.price,
        volume_24h: quote.volume_24h,
        market_cap: quote.market_cap,
        percent_change_1h: quote.percent_change_1h,
        percent_change_24h: quote.percent_change_24h,
        percent_change_7d: quote.percent_change_7d,
        percent_change_30d: quote.percent_change_30d,
      }

      APP_CACHE.set(symbol, JSON.stringify(modifiedItem), 7200)

      return modifiedItem
    } catch (error: any) {
      if (error.response?.status === 429) {
        attempts++
        const retryAfter = Math.pow(2, attempts) * 1000 // Exponential backoff
        console.warn(
          `Rate limited (429). Retrying in ${retryAfter / 1000} seconds...`,
        )
        await delay(retryAfter)
      } else {
        console.error(`Error fetching price for ${symbol}:`, error)
        return null
      }
    }
  }

  console.error(`Failed to fetch price for ${symbol} after multiple attempts.`)
  return null
}

// create a mechanism to get the price of a token after every 15 seconds

export const cachedAssetPrices = () => {
  const allowedTokens = ['BTC', 'ETH', 'USDC', 'BNB', 'USDT']

  // Ensure that token prices are cached at startup
  allowedTokens.forEach(async (token) => {
    if (!APP_CACHE.has(token)) {
      try {
        const priceData = await getTokenPrice(token)
        if (priceData) {
          console.log(`Initial cached price for ${token}: ${priceData.price}`)
        }
      } catch (error) {
        console.error(`Error fetching initial price for ${token}:`, error)
      }
    }
  })

  // Cron job to update allowed token prices every 5 minutes
  NodeCron.schedule('*/15 * * * *', async () => {
    console.log('Running cron job to update token prices')
    for (const token of allowedTokens) {
      try {
        const updatedPrice = await getTokenPrice(token)
        if (updatedPrice) {
          console.log(`Updated price for ${token}: ${updatedPrice.price}`)
        }
      } catch (error) {
        console.error(`Error updating price for ${token}:`, error)
      }
    }
  })
}

// a function that will get the price of a token from the cache or fetch it from the source
export const getAssetPrice = async (symbol: string) => {
  return new Promise<Cryptocurrency | null>(async (resolve, reject) => {
    try {
      if (APP_CACHE.has(symbol)) {
        const cachedData = APP_CACHE.get(symbol)
        resolve(JSON.parse(cachedData as string))
      } else {
        console.warn(
          `Price for ${symbol} not found in cache. Returning last known price.`,
        )
        resolve(null) // Return null if price is not found in cache
      }
    } catch (error) {
      console.error(`Error fetching asset price for ${symbol}:`, error)
      reject(null)
    }
  })
}
