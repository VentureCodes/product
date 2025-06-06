import { PrismaClient } from '@prisma/client'
import { Request, Response, Router } from 'express'

const router = Router()
const prisma = new PrismaClient()

router.post('/rates', async (req: Request, res: Response) => {
  try {
    const rateCategories = req.body

    await Promise.all(
      rateCategories.map(async (category: any) => {
        const { name, description, icon, isActive, rateProviders } = category

        const rateCategory = await prisma.rateCategory.upsert({
          where: { name },
          update: {
            description,
            icon,
            isActive,
          },
          create: {
            name,
            description,
            icon,
            isActive,
          },
        })

        await Promise.all(
          rateProviders.map(async (provider: any) => {
            const {
              icon: providerIcon,
              name: providerName,
              country: providerCountryName,
              rates,
            } = provider

            let country = await prisma.country.findUnique({
              where: { name: providerCountryName },
            })

            if (!country) {
              country = await prisma.country.create({
                data: {
                  name: providerCountryName,
                  code: getCountryCode(providerCountryName),
                  dial: getCountryDial(providerCountryName),
                },
              })
            }

            const rateProvider = await prisma.rateProvider.upsert({
              where: { name: providerName },
              update: {
                icon: providerIcon,
                country: country.name,
                rateCategoryId: rateCategory.id,
              },
              create: {
                icon: providerIcon,
                name: providerName,
                country: country.name,
                rateCategoryId: rateCategory.id,
              },
            })

            await Promise.all(
              rates.map(async (rate: any) => {
                const { fiat, buy, sell, monthlyChange, datePosted } = rate
                const { name: fiatName, symbol: fiatSymbol } = fiat

                const fiatEntry = await prisma.fiat.upsert({
                  where: { symbol: fiatSymbol },
                  update: { name: fiatName },
                  create: {
                    name: fiatName,
                    symbol: fiatSymbol,
                    countryId: country.id,
                  },
                })

                const existingRate = await prisma.rate.findFirst({
                  where: {
                    rateProviderId: rateProvider.id,
                    buy,
                    sell,
                    datePosted: new Date(datePosted),
                  },
                })

                if (existingRate) {
                  return
                }

                await prisma.rate.create({
                  data: {
                    fiatId: fiatEntry.id,
                    buy,
                    sell,
                    monthlyChange,
                    rateProviderId: rateProvider.id,
                    datePosted: new Date(datePosted),
                  },
                })
              }),
            )
          }),
        )
      }),
    )

    console.log('All rates data saved successfully')
    res.status(200).send('Rates Data Saved')
  } catch (err: any) {
    console.error('Error processing rates data:', err)
    res.status(500).send(`Error while processing rates data: ${err.message}`)
  }
})

function getCountryCode(countryName: string): string {
  const codes: { [key: string]: string } = {
    Kenya: 'KE',
    Uganda: 'UG',
    Rwanda: 'RW',
  }
  return codes[countryName] || 'Unknown'
}

function getCountryDial(countryName: string): string {
  const dials: { [key: string]: string } = {
    Kenya: '+254',
    Uganda: '+256',
    Rwanda: '+250',
  }
  return dials[countryName] || 'Unknown'
}

export { router as RatesRouter }
