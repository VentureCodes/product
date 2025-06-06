import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'
import { Wallet } from 'ethers'
import { UserType } from 'nexus-prisma'

export const users = async (prisma: PrismaClient) => {
  const usersData = [
    // admin
    {
      phone: '254700000000',
      firstName: 'Cashier',
      userType: UserType.members[4],
      lastName: 'Cashier',
    },
    // User
 
    {
      phone: '254729424101',
      userType: UserType.members[1],
      firstName: 'SAMU',
      lastName: faker.person.lastName(),
    },
    {
      phone: '254715605476',
      userType: UserType.members[1],
      firstName: 'Kanyari',
      lastName: 'Jnr',
    },
   
    {
      phone: '254700445263',
      userType: UserType.members[1],
      firstName: 'Kelvin',
      lastName: faker.person.lastName(),
    },
    {
      phone: '254712345678',
      userType: UserType.members[1],
      firstName: 'Pastor',
      lastName: "Ng'ang'a",
    },
    {
      phone: '254716110371',
      userType: UserType.members[1],
      firstName: 'Eqam',
      lastName: 'Capital',
    },
    // cashier
   
    {
      phone: '254727641393',
      userType: UserType.members[0],
      firstName: 'Enock',
      lastName: 'Dev',
    },
    {
      phone: '254704642722',
      userType: UserType.members[1],
      firstName: 'Felix',
      lastName: 'PM',
    },
  
  ]

  const userIds = []

  for (const { phone, firstName, lastName, userType } of usersData) {
    let exists = await prisma.user.findFirst({
      where: {
        phone,
      },
    })

    if (!exists) {
      try {
        const user = await prisma.user.create({
          data: {
            phone,
            firstName,
            lastName,
            username: faker.internet.userName({ firstName }),
            userType: userType || UserType.members[1],
            photo: faker.image.avatar(),
            isActive: true,
            email: faker.internet
              .email({ firstName, lastName })
              .toLowerCase()
              .replace(/[-_]/g, '.'),
          },
        })

        await prisma.fiatWallet.create({
          data: {
            user: { connect: { id: user.id } },
            balance: 0,
            fiat: { connect: { symbol: 'KES' } },
          },
        })

        // Create Crypto Account
        const cryptoWalletData = Wallet.createRandom()

        const crypto = await prisma.cryptoWallet.create({
          data: {
            user: { connect: { id: user.id } },
            network: {
              connectOrCreate: {
                where: { id: 1 },
                create: {
                  id: 1,
                  name: 'Ethereum',
                  symbol: 'BNB',
                  explorer: 'https://bscscan.io',
                  nativeToken: 'WBNB',
                },
              },
            },
            mnemonic: cryptoWalletData.mnemonic!.phrase,
          },
        })

        await prisma.cryptoAccount.create({
          data: {
            cryptoWalletId: crypto.id,
            address: cryptoWalletData.address,
            privateKey: cryptoWalletData.privateKey,
          },
        })

        userIds.push(user.id)
      } catch (error) {
        console.error('Seeding Users Error: ', error)
      }
    } else {
      // update user type
      if (userType) {
        exists = await prisma.user.update({
          where: { id: exists.id },
          data: {
            userType,
          },
        })
      }
      console.log('User already exists', exists)
    }
  }

  console.log(`Seeded ${usersData.length} users`)
  return userIds
}
