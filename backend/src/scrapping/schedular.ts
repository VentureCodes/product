// import NodeCron from 'node-cron'
// import { getLatestAboutMoney } from './tuko'
// import { ad } from './../../prisma/seed/ad'
// import { prisma } from './../graphql/context'
// // import { monitorBsc } from '../scans/bsc-monitor'

// export const schedularEvents = () => {
//   NodeCron.schedule('*/10 * * * *', async () => {
//     console.log('running a task every two minutes')
//     await getLatestAboutMoney()
//   })

//   NodeCron.schedule('*/10 * * * *', async () => {
//     console.log('running a task every 10 minutes')
//     await ad(prisma)
//   })

//   // Run Binance Smart Chain transaction monitoring every 10 minutes
//   NodeCron.schedule('*/10 * * * *', async () => {
//     try {
//       console.log('Running a task to monitor BSC transactions...')
//       await monitorBsc()
//     } catch (error) {
//       console.error('Error in monitorBsc task:', error)
//     }
//   })
// }
