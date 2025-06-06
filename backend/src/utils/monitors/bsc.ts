import { PrismaClient } from '@prisma/client'
import { bscProvider } from './provider'
import { sendSMS } from '../sms'

// const config = {
//   pool: {
//     abi: [
//       'event Swap( address indexed sender, uint amount0In, uint amount1In, uint amount0Out, uint amount1Out, address indexed to)',
//       'function token0() external view returns (address)',
//       'function token1() external view returns (address)',
//     ],

//     erc20: {
//       abi: [
//         'function balanceOf(address owner) view returns (uint256)',
//         'function decimals() view returns (uint8)',
//         'function symbol() view returns (string)',
//         'function approve(address spender, uint256 amount) returns (bool)',
//       ],
//     },
//   },
// }

const prisma = new PrismaClient()

export const bscMonitorTransactions = async () => {
  //   Get all the users who have deposited BNB to their wallet
  bscProvider.on('block', async (blockNumber: number) => {
    try {
      console.log('Block Number', blockNumber)

      const hexBlockNumber = `0x${blockNumber.toString(16)}`

      const block = await bscProvider.send('eth_getBlockByNumber', [
        hexBlockNumber,
        true,
      ])

      let dataINfo = await prisma.cryptoAccount.findMany({
        include: {
          cryptoWallet: {
            select: { user: { select: { phone: true, id: true } } },
          },
        },
      })

      let accounts = dataINfo.map((account) => ({
        name: account.cryptoWallet.user.phone,
        address: account.address,
        user: { phone: '', id: account.cryptoWallet.user.id },
      }))

      try {
        let receipts = await bscProvider.send('eth_getBlockReceipts', [
          hexBlockNumber,
        ])

        receipts = receipts.filter(
          (receipt: any) => receipt.status === '0x1' && receipt.logs.length > 0,
        )

        receipts.forEach(async (receipt: any) => {
          let transaction = block.transactions.find(
            (t: any) => t.hash === receipt.transactionHash,
          )

          for (const account of accounts) {
            if (
              transaction &&
              transaction.to &&
              transaction.to.toLowerCase() === account.address.toLowerCase()
            ) {
              console.log('BSC tx', transaction)
              // send notification to user
              // await sendSMS(
              //   process.env.AFRICA_TALKING_NOW_KEY!,
              //   process.env.AFRICA_TALKING_NOW_USERNAME!,
              //   [`+${account.user.phone}`],
              //   `You have sent USD ${12.0} successfully`,
              // )

              await sendSMS({
                phone: `+${account.user.phone}`,
                message: `You have sent USD ${12.0} successfully`,
              })
            }
          }

          console.log('Transaction', transaction)
        })
      } catch (error) {}
    } catch (error) {
      console.log('BSC tx error', error)
    }
  })
}
