import { erc20Wrapper } from '../utils/erc-wallet'
import RPCManager from '../utils/rpc'
import { ethers } from 'ethers'
import Web3 from 'web3'
import { Request, Response, Router } from 'express'
// import { connect } from 'http2'

const router = Router()

//TOKENS
// "token":"0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" // WBNB
// "token":"0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684" USDT

// Connect to BSC
export const bscRPC = async (isTestnet: boolean): Promise<string> => {
  try {
    const rpcManager = new RPCManager()
    const rpcUrl = (await rpcManager.get(isTestnet)) as string
    return rpcUrl
  } catch (error: any) {
    console.error('Error connecting to BSC:', error)
    return error
  }
}

export const createERCWallet = async (isTestnet: boolean) => {
  try {
    const manager = new RPCManager()
    const rpcUrl = await bscRPC(isTestnet)
    const provider = new ethers.JsonRpcProvider(rpcUrl)
    console.log('Block Number:', (await provider.getBlock('latest'))?.number)

    // Create a new wallet
    const generateWallet = ethers.Wallet.createRandom(provider)
    const walletDetails = await manager.walletWithProvider(generateWallet)
    // console.log('Wallet Details:', walletDetails)

    return walletDetails
  } catch (error: any) {
    console.error('Error getting balance:', error.message)
    return error
  }
  return null
}

export const testCreateWallet = async (isTestnet: boolean, wallet?: string) => {
  try {
    const _wallet = await createERCWallet(isTestnet)
    const rpcUrl = await bscRPC(isTestnet)
    const web3 = new Web3(rpcUrl)

    const balance = await web3.eth.getBalance(wallet || _wallet.walletAddress)
    console.log('Balance:', web3.utils.fromWei(balance, 'ether'))
    return balance
  } catch (error: any) {
    console.error('Error getting balance:', error)
    return error
  }
  return null
}

// ERC20 WRAPPER
const erc20WrapperConect = async (
  _req: Request,
  res: Response,
  privateKey: string,
) => {
  try {
    const rpcUrl = await bscRPC(false)
    const connect = await erc20Wrapper.connect(privateKey, rpcUrl)
    // Get the balance
    const balance = await erc20Wrapper.getEthBalance()
    console.log('Conected:', connect)
    res.status(200).json({ connect, balance })
  } catch (err) {
    console.log('Error ERC20 WRAPPER CONN:', err)
    res.status(500).json({ err })
  }
}

const getTokenBalance = async (req: Request, res: Response) => {
  try {
    const { pk, token } = req.body
    const rpcUrl = await bscRPC(true)
    const connect = await erc20Wrapper.connect(pk, rpcUrl)

    const balance = await erc20Wrapper.getTokenBalance(token)
    res.status(200).json({ connect, balance })
  } catch (error) {
    res.status(500).json({ error })
  }
}

// WalletAddress to Vault Address
const send = async (req: Request, res: Response) => {
  try {
    // Tx Params: traderId, leverage, token, amount
    const { vaultAddress, amount, token, pk } = req.body
    const rpcUrl = await bscRPC(true)
    const connect = await erc20Wrapper.connect(pk, rpcUrl)

    // // VAULT DEPOSIT
    //         const web3 = new Web3(rpcUrl)
    //         const contract = new web3.eth.Contract(ABI, vaultAddress)
    //         const result = await contract.methods.deposit(traderId, leverage, token, amount);
    //         console.log(`Deposit to Vault: ${result}`)

    // SEND TX
    const sendTX = await erc20Wrapper.send(vaultAddress, amount, token, false)
    console.log(
      `Token Send ${token} TxReceipt: JSON.strngify(${sendTX}, null, "\t")`,
    )

    res.status(200).json({ connect, sendTX })
  } catch (error) {
    res.status(500).json({ error })
  }
}
// const deposit = async (req: Request, res: Response) => {
//   try {
//     // Tx Params: traderId, leverage, token, amount
//     const { vaultAddress, amount, token, leverage, pk } = req.body
//     const traderId = Math.floor(Math.random() * 255).toString()

//     const rpcUrl = await bscRPC(true)
//     const connect = await erc20Wrapper.connect(pk, rpcUrl)
//     const result = await erc20Wrapper.deposit(
//       traderId,
//       vaultAddress,
//       amount,
//       token,
//       leverage,
//     )

//     console.log('Deposit to Vault:', result)
//     res.status(200).json({ connect, result })
//   } catch (error) {
//     console.log('Error Sending TX:', error)
//     res.status(500).json({ connect, error })
//   }
// }

// TEST ROUTES

// SWAP ROUTES

router.get('/bscRPC', async (req: Request, res: Response) => {
  try {
    const session = req.session as any
    console.log('Session:', session)
    const rpcUrl = await bscRPC(false)
    res.status(200).json({ rpcUrl })
  } catch (error) {
    res.status(500).json({ error })
  }
})

router.get('/createERCWallet', async (req: Request, res: Response) => {
  try {
    const wallet = await createERCWallet(req.body.isTestnet)
    res.status(200).json({ wallet })
  } catch (error) {
    res.status(500).json({ error })
  }
})

router.get('/erc20WrapperConect', async (req: Request, res: Response) => {
  try {
    await erc20WrapperConect(req, res, req.body.pk)
  } catch (error) {
    console.log('Error', error)
  }
})

router.get('/getEthBalance', async (req: Request, res: Response) => {
  try {
    const pk = req.body.pk
    const rpcUrl = await bscRPC(true)
    erc20Wrapper.connect(pk, rpcUrl)

    const balance = await erc20Wrapper.getEthBalance()
    res.status(200).json({ balance })
  } catch (error) {
    res.status(500).json({ error })
  }
})

router.get('/getTokenBalance', async (req: Request, res: Response) => {
  try {
    await getTokenBalance(req, res)
  } catch (error) {
    res.status(500).json({ error })
  }
})

router.post('/send', async (req: Request, res: Response) => {
  try {
    await send(req, res)
  } catch (error) {
    res.status(500).json({ error })
  }
})

router.post('/deposit', async (_req: Request, res: Response) => {
  try {
    // await deposit(req, res)
  } catch (error) {
    res.status(500).json({ error })
  }
})

export { router as bscRouter }
