// TODO: this is a temporary solution, we need to find a better way to seed the database
// Give all wallets testing amounts
import { PrismaClient } from '@prisma/client'

export const udpateWallets = async (prisma: PrismaClient) => {
  const wallets = await prisma.fiatWallet.findMany()

  // const balance = 2000

  for (const wallet of wallets) {
    if (wallet.balance <= 200) {
      // await prisma.fiatWallet.update({
      //   where: { id: wallet.id },
      //   data: {
      //     balance,
      //   },
      // })
    } else {
      // console.log(`Wallet ${wallet.id} has enough balance`)
    }
  }
}
