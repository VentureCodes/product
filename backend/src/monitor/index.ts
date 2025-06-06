import { monitorBNBTransactions } from './bsc'
import 'dotenv/config'

const start = async () => {
  await monitorBNBTransactions(process.env.RPC_URL!)
}

start()
