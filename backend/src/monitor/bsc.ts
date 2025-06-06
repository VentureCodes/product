import { Interface, WebSocketProvider } from 'ethers'
import { readFileSync } from 'fs'

export const iface = new Interface(
  readFileSync(`${__dirname}/interfaces/pancake.json`, 'utf8'),
)

export const monitorBNBTransactions = async (bsc_wss: string) => {
  const provider = new WebSocketProvider(bsc_wss)
  try {
    provider.on('block', async (blockNumber) => {
      const block = await provider.getBlock(blockNumber, true)

      if (block) {
        for (const hash of block.transactions) {
          const transaction = await provider.getTransaction(hash)
          if (transaction?.data?.toString() == '0x') {
            console.log('Transaction Hash: ', transaction.hash)
            console.log(
              'VALUE: ',
              `${(Number(transaction.value.toString()) / 10 ** 18).toFixed(
                18,
              )} BNB`,
            )
          } else {
            console.log('Transaction Hash: ', transaction)
            // if (transaction?.data) {
            //   console.log('Transaction Hash: ', transaction.hash)
            //   try {
            //     const decoded = iface.parseTransaction({
            //       data: transaction.data,
            //       value: transaction.value,
            //     })
            //     console.log(`Decoded data:`, decoded)
            //   } catch (error: any) {
            //     console.log(
            //       `Failed to decode transaction data: ${error.message}`,
            //     )
            //   }
            // }
          }
        }
      }
    })
  } catch (error) {
    console.log('Error: ', error)
  }
}
