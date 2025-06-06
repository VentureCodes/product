import { PrismaClient } from '@prisma/client'
import express, { Request, Response } from 'express'
import { removeEmpty } from '../graphql/helper/null'

// This is the external rates API endpoint
// It is used to fetch rates from the database by users with an API key
// The API key is validated and the usage is tracked
// The number of rates fetched is limited to prevent abuse

// To use this endpoint, an API key must be provided in the query string
// example: "/externalRatesAPI?apiKey=DOLLAR-APP-RATES-APIKEY-411f22ea5f0547288c63100d01fdfafd"

const prisma = new PrismaClient()
const router = express.Router()

const MAX_RATES = 100
const RATE_LIMIT = 100

router.get('/externalRatesAPI', async (req: Request, res: Response) => {
  const { apiKey, take, skip, orderBy } = removeEmpty(req.query)

  // Check if the API key is provided
  if (!apiKey) {
    return res.status(400).json({ error: 'API key is required.' })
  }

  try {
    // Validate the API Key
    const validApiKey = await prisma.apiKey.findUnique({
      where: {
        key: apiKey as string,
      },
    })

    // If no valid API key found or it's inactive, return an error
    if (!validApiKey || !validApiKey.isActive) {
      return res.status(403).json({ error: 'Invalid or inactive API key.' })
    }

    // Check for expiration date
    if (validApiKey.expiresAt && new Date() > new Date(validApiKey.expiresAt)) {
      return res.status(403).json({ error: 'API key has expired.' })
    }

    // Rate limiting
    const today = new Date().toISOString().slice(0, 10) // Get current date in YYYY-MM-DD format
    const apiKeyUsage = await prisma.apiKeyUsage.count({
      where: {
        apiKeyId: validApiKey.id,
        date: today, // Ensure usage is for today
      },
    })

    if (apiKeyUsage >= RATE_LIMIT) {
      return res
        .status(429)
        .json({ error: 'Rate limit exceeded. Try again tomorrow.' })
    }

    // Upsert the usage record
    await prisma.apiKeyUsage.upsert({
      where: {
        apiKeyId_date: {
          apiKeyId: validApiKey.id,
          date: today,
        },
      },
      update: {
        usageCount: {
          increment: 1, // Increment the usage count
        },
      },
      create: {
        apiKeyId: validApiKey.id,
        date: today,
        usageCount: 1, // Set usage count to 1 for the new record
      },
    })

    // Limit the number of rates to the max allowed
    const limit = Math.min(parseInt(take as string, 10) || 10, MAX_RATES)

    // Fetch rates
    const rates = await prisma.rate.findMany({
      orderBy: orderBy ? JSON.parse(orderBy as string) : { datePosted: 'desc' },
      take: limit,
      skip: parseInt(skip as string, 10) || 0,
      select: {
        fiat: { select: { symbol: true } },
        rateProvider: {
          select: {
            name: true,
            country: true,
            rateCategory: { select: { name: true } },
          },
        },
        buy: true,
        sell: true,
        datePosted: true,
        createdAt: true,
        updatedAt: true,
        monthlyChange: true,
        id: true,
        rateProviderId: true,
      },
    })

    return res.json({ success: true, data: rates })
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ success: false, error: 'Error fetching rates' })
  }
})

export { router as ExternalRateAPIRouter }
