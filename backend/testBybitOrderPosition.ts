import {
  RestClientV5,
  WebsocketClient,
  WSClientConfigurableOptions,
} from 'bybit-api'
import 'dotenv/config'

const wsConfig: WSClientConfigurableOptions = {
  key: process.env.BYBIT_API_KEY,
  secret: process.env.BYBIT_API_SECRET,
  market: 'v5',
}

console.log(process.env.BYBIT_API_KEY, process.env.BYBIT_API_SECRET)

const ws = new WebsocketClient(wsConfig)

ws.subscribeV5(['position'], 'linear').catch(async (err) => {
  console.log('Position', err)
})

const closedPNL = async () => {
  const client = new RestClientV5({
    key: process.env.BYBIT_API_KEY,
    secret: process.env.BYBIT_API_SECRET,
  })

  // let orderId = '12544d4d-b1fa-4861-8397-77880121eb0c'
  let symbol = 'BTCUSDT' //'DEGENUSDT'
  let { result, retCode } = await client.getClosedPnL({
    category: 'linear',
    symbol,
    limit: 50,
  })

  console.log('Closed PnL', result, retCode)
}

closedPNL()

// //
// ws.on('update', async (data) => {
//   let { topic, data: update } = data
//   if (topic === 'position') {
//     console.log('Position', update)
//   } else if (topic === 'order') {
//     console.log('Order', update)
//   } else {
//     console.log('Unknown topic', update)
//   }
// })

// ws.on('open', () => {
//   console.log('Connected')
// })

// ws.on('response', (response) => {
//   if (!response.success) {
//     console.log('Response error', response)
//   }
// })

// ws.on('close', () => {
//   setTimeout(() => {
//     ws.subscribeV5(['position'], 'linear').catch(async (err) => {
//       console.log('Reconnection subscription failed', err)
//     })
//   }, 3000)
// })

// ws.on('error', async (err: any) => {
//   if (err?.ret_msg === 'Your api key has expired.') {
//     console.log('API key expired')
//   } else if (err?.ret_msg === 'Request not authorized') {
//     console.log('Request not authorized')
//   } else {
//     console.log('WebSocket error', err)
//   }
// })

// ws.on('reconnect', () => {})

// ws.on('reconnected', () => {
//   ws.subscribeV5(['position', 'order'], 'linear').catch(async (err) => {
//     console.log('Reconnection subscription failed', err)
//   })
// })
