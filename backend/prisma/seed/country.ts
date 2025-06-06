import { PrismaClient } from '@prisma/client'

import { countries_data } from '../data/countries'

export const country = async (prisma: PrismaClient) => {
  countries_data.forEach(async (country) => {
    await prisma.country.upsert({
      where: { name: country.name },
      update: {
        name: country.name,
        code: country.iso2,
        dial: country.dial_code?.replace('+', ''),
        currency: country.currency,
        flag: country.flag,
      },
      create: {
        name: country.name,
        code: country.iso2,
        dial: country.dial_code?.replace('+', ''),
        currency: country.currency,
        flag: country.flag,
      },
    })
  })
}
