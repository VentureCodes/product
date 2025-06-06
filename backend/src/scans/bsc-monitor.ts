// import axios from 'axios'
// import { PrismaClient } from '@prisma/client'
// import { allowedTokens } from '../utils/erc-wallet'
// import { Notification } from '../utils/notification'
// import NodeCron from 'node-cron'

// interface Transaction {
//   blockNumber: string
//   timeStamp: string
//   hash: string
//   nonce: string
//   blockHash: string
//   transactionIndex: string
//   from: string
//   to: string
//   value: number
//   gas: string
//   gasPrice: string
//   isError: string
//   txreceipt_status: string
//   input: string
//   contractAddress: string
//   cumulativeGasUsed: string
//   gasUsed: string
//   confirmations: string
//   methodId: string
//   functionName: string
//   type: TransactionType
//   userId: string
//   tokenSymbol?: string
//   tokenAddress?: string
//   tokenDecimal?: string
//   status: TransactionStatus
// }

// // interface TransactionRecord {
// //   name: string
// //   transactions: Transaction[]
// // }

// enum TransactionStatus {
//   Pending = 'Pending',
//   Completed = 'Completed',
//   Failed = 'Failed',
//   Cancelled = 'Cancelled',
// }

// enum TransactionType {
//   Deposit = 'Deposit',
//   Withdrawal = 'Withdrawal',
//   Transfer = 'Transfer',
//   Exchange = 'Exchange',
//   Payment = 'Payment',
//   Refund = 'Refund',
//   P2P = 'P2P',
//   Request = 'Request',
//   Buy = 'Buy',
// }

// const getNormalTransactions = async (
//   userAddress: string,
// ): Promise<{ result: Transaction[] }> => {
//   try {
//     const url = `https://api.etherscan.io/v2/api
//    ?chainid=56
//    &module=account
//    &action=txlist
//    &address=${userAddress}
//    &startblock=0
//    &endblock=99999999
//    &page=1
//    &offset=10
//    &sort=asc
//    &apikey=${process.env.BSCSCAN_API_KEY!}`
//     const { data } = await axios.get(url)
//     // console.log('data', data)
//     return data
//   } catch (error: any) {
//     // console.error('Error fetching regular transactions:', error.message)
//     return {
//       result: [],
//     }
//   }
// }

// const getTokenTransfer = async (
//   userAddress: string,
// ): Promise<{ result: Transaction[] }> => {
//   try {
//     const url = `https://api.etherscan.io/v2/api
//    ?chainid=56
//    &module=account
//    &action=tokentx
//    &address=${userAddress}
//    &page=1
//    &offset=100
//    &startblock=0
//    &endblock=27025780
//    &sort=asc
//    &apikey=${process.env.BSCSCAN_API_KEY!}`
//     const { data } = await axios.get(url)
//     // console.log('data', data)
//     return data
//   } catch (error: any) {
//     // console.error('Error fetching token transfers:', error.message)
//     return { result: [] }
//   }
// }

// const prisma = new PrismaClient()

// // monitor BSC
// export async function monitorBsc() {
//   try {
//     // Fetch all user wallet accounts
//     const dataInfo = await prisma.cryptoAccount.findMany({
//       include: {
//         cryptoWallet: {
//           select: { user: { select: { phone: true, id: true , email: true} } },
//         },
//       },
//     })

//     const accounts = dataInfo.map((account) => ({
//       name: account.cryptoWallet.user.phone || account.cryptoWallet.user.email,
//       address: account.address.toLowerCase(),
//       userId: account.cryptoWallet.user.id,
//       email: account.cryptoWallet.user.email,
//       phone: account.cryptoWallet.user.phone,
//     }))

//     for (const account of accounts) {
//       // Fetch normal transactions and token transfers
//       const normalTransactions = await getNormalTransactions(account.address)
//       const tokenTransfers = await getTokenTransfer(account.address)

//       const allTransactions = [
//         ...(normalTransactions?.result || []),
//         ...(tokenTransfers?.result || []),
//       ]

//       for (const transaction of allTransactions as Transaction[]) {
//         // Only process deposits to the user's address
//         if (
//           transaction.to &&
//           transaction.to.toLowerCase() === account.address
//         ) {
//           // Handle token transfers
//           const isTokenTransfer = !!transaction.contractAddress
//           const tokenAddress = transaction.contractAddress || null
//           const tokenSymbol = transaction.tokenSymbol || 'BNB'

//           // Handle tokenDecimal safely
//           const tokenDecimals = transaction.tokenDecimal
//             ? parseInt(transaction.tokenDecimal)
//             : 18
//           const value = isTokenTransfer
//             ? Number(transaction.value) / 10 ** Number(tokenDecimals)
//             : Number(transaction.value) / 1e18

//           // Check if the token is allowed
//           const isAllowedToken = allowedTokens().some(
//             (t) =>
//               t.address.toLowerCase() === tokenAddress?.toLowerCase() ||
//               (t.symbol === 'BNB' && !tokenAddress), // Handle BNB (native token)
//           )

//           if (!isAllowedToken) continue // Skip non-whitelisted tokens

//           // Save the transaction
//           await prisma.cryptoTransaction.upsert({
//             where: { hash: transaction.hash },
//             update: {
//               blockNumber: transaction.blockNumber,
//               timeStamp: new Date(
//                 Number(transaction.timeStamp) * 1000,
//               ).toISOString(),
//               from: transaction.from,
//               to: transaction.to,
//               value,
//               gas: transaction.gas,
//               gasPrice: transaction.gasPrice,
//               tokenAddress,
//               tokenSymbol,
//               status: 'Completed',
//               type: 'Deposit',
//               userId: account.userId,
//             },
//             create: {
//               hash: transaction.hash,
//               blockNumber: transaction.blockNumber,
//               timeStamp: new Date(
//                 Number(transaction.timeStamp) * 1000,
//               ).toISOString(),
//               from: transaction.from,
//               to: transaction.to,
//               value,
//               gas: transaction.gas,
//               gasPrice: transaction.gasPrice,
//               tokenAddress,
//               tokenSymbol,
//               status: 'Completed',
//               type: 'Deposit',
//               userId: account.userId,
//             },
//           })

//             // Generate the transaction URL
//           const txnUrl = `https://bscscan.com/tx/${transaction.hash}`

//           // Notify the user
//           const notificationMessage = `Deposit received: ${value} ${tokenSymbol}. Track transaction: ${txnUrl}`
//           new Notification(
//             account.userId,
//             '',
//             'Deposit Received',
//             { message: notificationMessage },
//             'Sent',
//             'Transaction',
//             'InApp',
//           ).sendInAppNotification()

//           //send sms
//           if (account.phone) {
//             new Notification(
//               account.userId,
//               '',
//               'Deposit Received',
//               { message: notificationMessage },
//               'Sent',
//               'Transaction',
//               'SMS',
//             ).sendSMSNotification(account?.phone!)
//           }

//           console.log(
//             `Transaction saved and user notified: ${transaction.hash}`,
//           )
//         }
//       }
//     }
//   } catch (error: any) {
//     console.error('Error monitoring BSC transactions:', error.message)
//   }
// }

// NodeCron.schedule('*/2 * * * *', async () => {
//   console.log('Running monitorBsc job at', new Date().toISOString())
//   try {
//     await monitorBsc()
//   } catch (error: any) {
//     console.error('Error monitoring BSC:', error.message)
//   }
// })
