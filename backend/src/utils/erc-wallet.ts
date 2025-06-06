import { BigNumberish, ethers, parseEther } from 'ethers'
import RPCManager, { bscRPC } from './rpc'
import { contracts } from './../contracts/config'
import { PriceServiceConnection } from '@pythnetwork/price-service-client'
import { Cryptocurrency } from '../typings/coinmarket'
import { swapToken, swapETHforToken, swapTokenForETH } from '../utils/swap'
import ABI from '../erc20Abi/pancakeswap.json'

export interface Token {
  symbol: string
  address: string
  decimals: number
  balance: string
  amountInUsd: string
  info: Cryptocurrency | null
}

/**
 *  Get BNB current price in USD from Pyth Network
 * @returns {Promise<number>} currentPrice
 */
export const getBNBCurrentPriceInUSD = async (): Promise<number> => {
  let currentPrice = 1
  try {
    const connection = new PriceServiceConnection('https://hermes.pyth.network')

    const currentPrices = await connection.getLatestPriceFeeds([
      '0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f', // BNB/USD  current usd price
    ])

    if (currentPrices) {
      if (currentPrices?.length > 0) {
        const price = currentPrices[0].toJson()
        currentPrice = Number(price?.price?.price * 10 ** price?.price?.expo)
      }
    }
    return currentPrice
  } catch (error) {
    return currentPrice
  }
}

export const allowedTokens = (isTestnet: boolean = false): Array<Token> => {
  console.log('Testnet: ', isTestnet)
  if (isTestnet) {
    return [
      {
        symbol: 'USDT',
        address: '0xedf348C20E8B5C4a1270a3Ff961b42510494EaD5',
        decimals: 18,
        balance: (0.0).toString(),
        amountInUsd: (0.0).toString(),
        info: null,
      },
      {
        symbol: 'LINK',
        address: '0x84b9b910527ad5c03a9ca831909e21e236ea7b06',
        decimals: 18,
        balance: (0.0).toString(),
        amountInUsd: (0.0).toString(),
        info: null,
      },
      {
        symbol: 'BTCB',
        address: '0x6ce8da28e2f864420840cf74474eff5fd80e65b8',
        decimals: 18,
        balance: (0.0).toString(),
        amountInUsd: (0.0).toString(),
        info: null,
      },
    ]
  }
  return [
    {
      symbol: 'BTC',
      address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
      decimals: 18,
      balance: (0.0).toString(),
      amountInUsd: (0.0).toString(),
      info: null,
    },
    {
      symbol: 'ETH',
      address: '0x4DB5a66E937A9F4473fA95b1cAF1d1E1D62E29EA',
      decimals: 18,
      balance: (0.0).toString(),
      amountInUsd: (0.0).toString(),
      info: null,
    },

    {
      symbol: 'USDT',
      address: '0x55d398326f99059ff775485246999027b3197955',
      decimals: 6,
      balance: (0.0).toString(),
      amountInUsd: (0.0).toString(),
      info: null,
    },
    {
      symbol: 'BNB',
      address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      decimals: 18,
      balance: (0.0).toString(),
      amountInUsd: (0.0).toString(),
      info: null,
    },
    {
      symbol: 'USDC',
      address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
      decimals: 6,
      balance: (0.0).toString(),
      amountInUsd: (0.0).toString(),
      info: null,
    },
  ]
}
// ERC20 ABI
export const erc20Abi = [
  'function transfer(address to, uint amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function allowance(address _owner, address _spender) public view returns (uint256 remaining)',
  'function balanceOf(address owner) view returns (uint256)',
  // {
  //   constant: true,
  //   inputs: [{ name: 'who', type: 'address' }],
  //   name: 'balanceOf',
  //   outputs: [{ name: '', type: 'uint256' }],
  //   payable: false,
  //   stateMutability: 'view',
  //   type: 'function',
  // },

  // 'function approve(address _spender, uint256 _value) public returns (bool success)',

  {
    constant: false,
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

export const MAX_INT =
  '115792089237316195423570985008687907853269984665640564039457584007913129639935'

export const pancakeRouter =
  `0x10ED43C718714eb63d5aA57B78B54704E256024E`.toLowerCase()

export interface Overloads {
  gasLimit?: number
  nonce?: number
  gasPrice?: BigNumberish
  maxPriorityFeePerGas?: BigNumberish
  maxFeePerGas?: BigNumberish
  value?: BigNumberish
}

export class ERC20Wrapper {
  private _provider: ethers.JsonRpcProvider | undefined
  private _wallet: ethers.Wallet | undefined
  private _vault: ethers.Contract | undefined

  get provider() {
    if (!this._provider) throw new Error('Provider not set')
    return this._provider
  }

  get wallet() {
    if (!this._wallet) throw new Error('Wallet not set')
    return this._wallet
  }
  get vault() {
    if (!this._vault) throw new Error('Vault not set')
    return this._vault
  }
  // Connect to the blockchain
  async connect(
    privateKey: string,
    rpcUrl: string,
  ): Promise<ERC20Wrapper | null> {
    return new Promise((resolve, reject) => {
      try {
        this._provider = new ethers.JsonRpcProvider(rpcUrl)
        this._wallet = new ethers.Wallet(privateKey, this._provider)
        this._vault = new ethers.Contract(
          contracts.vault.address,
          contracts.vault.abi,
          this.wallet,
        )
        resolve(this)
      } catch (error) {
        reject(null)
      }
    })
  }
  // Get the balance of an ERC20 token
  async getEthBalance(): Promise<string> {
    try {
      const balance = await this.provider.getBalance(this.wallet.address)
      return ethers.formatEther(balance)
    } catch (error) {
      return '0'
    }
  }
  async getTokenBalance(token: string): Promise<string> {
    if (!this.wallet) {
      return '0'
    }
    try {
      console.log(
        'Token:',
        token,
        'Wallet:',
        this.wallet.address,
        'RPC',
        await this.provider.getBlockNumber(),
      )
      const contract = new ethers.Contract(token, erc20Abi, this._wallet!)
      const balance = await contract.balanceOf(this.wallet.address)
      console.log('Balance:', balance)
      const decimals = await contract.decimals()
      console.log('Balance:', balance, 'Decimals:', decimals)

      return ethers.formatUnits(balance, decimals)
    } catch (error) {
      console.log('Error getting token balance:', error)
      return '0'
    }
  }

  async getAllowance(token: string, spender: string): Promise<string> {
    try {
      const contract = new ethers.Contract(token, ABI, this._wallet!)
      const allowance = await contract.allowance(this._wallet?.address, spender)
      const decimals = await contract.decimals()
      return ethers.formatUnits(allowance, decimals)
    } catch (error) {
      return '0'
    }
  }

  // get Decimals
  async getDecimals(token: string): Promise<string> {
    try {
      const contract = new ethers.Contract(token, erc20Abi, this._wallet)
      const decimals = await contract.decimals()
      return decimals
    } catch (error) {
      console.log('Error getting decimals:', error)

      return '0'
    }
  }

  // getAmountsOut
  async getAmountsOut(amountIn: string, path: string[]): Promise<any> {
    try {
      const ABI = [
        'function getAmountsOut(uint amountIn, address[] memory path) public view  returns (uint[] memory amounts)',
      ]

      const contract = new ethers.Contract(pancakeRouter, ABI, this._provider)

      const amountsOut = await contract.getAmountsOut(
        parseEther(amountIn),
        path,
      )
      console.log(
        'Amounts Out:',
        amountsOut,
        'AmountIn:',
        amountIn,
        'Path:',
        path,
      )

      return amountsOut
    } catch (error) {
      console.log('Error getting amountsOut:', error)

      return null
    }
  }

  // getWalletNonce
  async getWalletNonce(wallet: string): Promise<any> {
    try {
      const nonce = await this._provider!.getTransactionCount(wallet)
      return { success: true, data: nonce }
    } catch (error) {
      console.log('Error getting nonce:', error)

      return { success: false, data: 0 }
    }
  }

  async approve(
    token: string,
    spender: string,
    _overloads: Overloads,
  ): Promise<any> {
    try {
      const contract = new ethers.Contract(token, erc20Abi, this.wallet)
      const decimals = await contract.decimals()

      console.log({ decimals })
      const approveTx = await contract.approve(spender, MAX_INT, {})
      console.log({ approveTx })
      const approveTxReceipt = await approveTx.wait()
      console.log(approveTxReceipt)
      if (approveTxReceipt.status === 1) {
        console.log('MAX Approved!')
        return JSON.stringify(approveTxReceipt, null, '\t')
      }

      throw new Error('Approval failed')
    } catch (error) {
      console.log('Error approving::::::::', error)
      throw new Error('Approval failed')
    }
  }

  async checkEth(token: string, isTestnet: boolean): Promise<boolean> {
    const bnb = allowedTokens(isTestnet).find(
      (t) => t.symbol.toLocaleLowerCase() === 'bnb',
    )
    if (!bnb) {
      return false
    }
    if (bnb.address.toLocaleLowerCase() === token.toLocaleLowerCase()) {
      return true
    }
    return false
  }

  // ERC Wallet to ERC Wallet
  async send(
    to: string,
    amount: string,
    token: string,
    isTest: boolean,
  ): Promise<{
    message: string
    status: string
    transaction: ethers.TransactionReceipt | null
  }> {
    console.log({
      'SendingTo:': to,
      'Amount:': amount,
      'Token:': token,
      'isTest:': isTest,
    })
    const is_eth = await this.checkEth(token, isTest)

    try {
      if (is_eth) {
        // ETH transaction
        const balanceEth = await erc20Wrapper.getEthBalance()
        if (parseFloat(balanceEth) < parseFloat(amount)) {
          console.log('Insufficient ETH balance')
          return {
            message: 'Insufficient ETH balance',
            status: 'failed',
            transaction: null,
          }
        }

        const allowance = await erc20Wrapper.getAllowance(token, to)
        if (parseFloat(allowance) < parseFloat(amount)) {
          console.log('Approving...')
          const overloads = {
            gasPrice: 1000000000,
            gasLimit: 200000,
          }

          const approveTx = await erc20Wrapper.approve(token, to, overloads)
          if (!approveTx) {
            return {
              message: 'Approval failed',
              status: 'failed',
              transaction: null,
            }
          }
        }

        const tx = {
          to,
          value: ethers.parseEther(amount),
        }
        const transaction = await this.wallet.sendTransaction(tx)
        const receipt = await transaction.wait()

        if (receipt?.status === 1) {
          return {
            message: 'Transaction successful',
            status: 'success',
            transaction: receipt,
          }
        } else {
          return {
            message: 'Transaction failed',
            status: 'failed',
            transaction: null,
          }
        }
      } else {
        // ERC20 token transaction
        const allowance = await erc20Wrapper.getAllowance(token, to)
        if (parseFloat(allowance) < parseFloat(amount)) {
          console.log('Approving...')
          const overloads = {
            gasPrice: 1000000000,
            gasLimit: 200000,
          }

          const approveTx = await erc20Wrapper.approve(token, to, overloads)
          if (!approveTx) {
            return {
              message: 'Approval failed',
              status: 'failed',
              transaction: null,
            }
          }
        }

        const contract = new ethers.Contract(token, erc20Abi, this.wallet)
        const decimals = await contract.decimals()
        const amountInUnits = ethers.parseUnits(amount, decimals)

        console.log('Contract:', contract)
        console.log('Decimals:', decimals)

        console.log('amountInUnits:', amountInUnits.toString())

        const transaction = await contract.transfer(to, amountInUnits)
        console.log('Transaction:', transaction)

        const receipt = await transaction.wait()
        console.log('Receipt:', receipt)

        if (receipt.status === 1) {
          return {
            message: 'Transaction successful',
            status: 'success',
            transaction: receipt,
          }
        } else {
          return {
            message: 'Transaction failed',
            status: 'failed',
            transaction: null,
          }
        }
      }
    } catch (error) {
      console.log('Error Sending TX:', error)
      return {
        message: 'Failed to send transaction',
        status: 'failed',
        transaction: null,
      }
    }
  }

  // ERC Wallet to Vault (Deposit)
  async deposit(
    traderId: string,
    token: string,
    amount: string,
    userName: string,
    leverage: string,
    userId: string,
    lockPeriod: number,
    userWallet: string,
  ): Promise<{
    message: string
    status: string
    transaction: ethers.TransactionReceipt | null | string
  }> {
    try {
      // GET BALANCE
      // const tokenBalance = await erc20Wrapper.getTokenBalance(token)
      // console.log('Token Balance:', tokenBalance)
      // if (parseFloat(tokenBalance) < parseFloat(amount)) {
      //   console.log('Insufficient token balance')
      //   return {
      //     message: 'Insufficient token balance',
      //     status: 'failed',
      //     transaction: null,
      //   }
      // }

      console.log('Remove balances getting')
      // ALLOWANCE
      const allowance = await erc20Wrapper.getAllowance(
        token,
        contracts.vault.address,
      )
      console.log('Allowance:', allowance)

      if (parseFloat(allowance) < parseFloat(amount)) {
        console.log('Approving...')
        let overloads: Overloads = {
          gasLimit: 200000,
          gasPrice: ethers.parseUnits('2000', 'gwei'),
        }
        const approveTx = await erc20Wrapper.approve(
          token,
          contracts.vault.address,
          overloads,
        )
        console.log('Approve transaction:', approveTx)
        if (!approveTx) {
          console.log('Approval failed')
          return {
            message: 'Approval failed',
            status: 'failed',
            transaction: null,
          }
        }
      }

      // CONTRACT
      // const vaultContract = new ethers.Contract(
      //   contracts.vault.address,
      //   contracts.vault.abi,
      //   this.wallet,
      // )
      const erc20Contract = new ethers.Contract(token, erc20Abi, this.wallet)
      const decimals = await erc20Contract.decimals()
      const amountInUnits = ethers.parseUnits(amount, decimals)
      console.log(
        'Amount in units:',
        amountInUnits.toString(),
        'Decimals:',
        decimals.toString(),
      )

      // DEPOSIT
      console.log('Trader Id: ', traderId)
      const tx = await this.vault.makeCopyTrade(
        token,
        amountInUnits,
        userName,
        leverage,
        userId,
        lockPeriod,
        userWallet,
        { gasLimit: 2000000 },
      )
      const txReceipt = await tx.wait()
      console.log(`Deposit to Vault TX: ${JSON.stringify(txReceipt, null, 2)}`)

      if (txReceipt.status === 1) {
        console.log('Transaction successful')
        return {
          message: 'Transaction successful',
          status: 'success',
          transaction: txReceipt,
        }
      } else {
        console.log('Transaction failed')
        return {
          message: 'Transaction failed',
          status: 'failed',
          transaction: txReceipt,
        }
      }
    } catch (error) {
      console.error('Error depositing to vault:', error)
      return {
        message: 'Error copying the trade. Please try again later.',
        status: 'failed',
        transaction: null,
      }
    }
  }
  /**
   * Swap tokens
   * @param tokenIn
   * @param tokenOut
   * @param amount
   * @returns @string
   */
  async swapTokens(
    tokenIn: string,
    tokenOut: string,
    amount: number,
  ): Promise<{
    message: string
    status: string
    transaction: ethers.TransactionReceipt | null | string
  }> {
    try {
      const swapTx = await this.vault.swapTokens(tokenIn, tokenOut, amount)

      const swapTxReceipt = await swapTx.wait()
      console.log(swapTxReceipt)
      if (swapTxReceipt.status === 1) {
        console.log('MAX Approved!')
        return {
          message: 'Successfully swapped tokens',
          status: 'failed',
          transaction: swapTxReceipt,
        }
      }

      return {
        message: 'Error swapping tokens',
        status: 'failed',
        transaction: null,
      }
    } catch (error) {
      console.log('Error: ', error)
      return {
        message: 'Error swapping tokens',
        status: 'failed',
        transaction: null,
      }
    }
  }
}

export const walletWithProvider = async (
  isTestnet: boolean,
  encryptedPhrase: string,
): Promise<{
  wallet: ethers.HDNodeWallet | null
  ercWrapper: ERC20Wrapper | null
  rpcUrl: string | null
  pk: string | null
}> => {
  try {
    // const hdWallet = new HdWallet()
    // // decrypt the wallet
    // const phrase = hdWallet.decryptPhrase(encryptedPhrase)
    // console.log('Phrase:', phrase)

    const manager = new RPCManager()
    const rpcUrl = await bscRPC(isTestnet)
    const provider = new ethers.JsonRpcProvider(rpcUrl)
    // console.log('Block Number:', (await provider.getBlock('latest'))?.number)

    // Create a new wallet
    const wallet = ethers.Wallet.fromPhrase(encryptedPhrase, provider)
    // TODO:  to be removed
    const walletDetails = await manager.walletWithProvider(wallet)
    // console.log('Wallet Details:', walletDetails)

    if (!walletDetails) {
      return { wallet: null, ercWrapper: null, rpcUrl, pk: null }
    }
    const ercWrapper = await erc20Wrapper.connect(
      walletDetails?.privatekey!,
      rpcUrl,
    )

    return { wallet, ercWrapper, rpcUrl, pk: walletDetails?.privatekey! }
  } catch (error: any) {
    console.error('Error getting WalletWithProvider', error.message)
    return { wallet: null, ercWrapper: null, rpcUrl: null, pk: null }
  }
}

export const walletWithPrivateKey = async (
  isTestnet: boolean,
  privateKey: string,
): Promise<{
  wallet: ethers.BaseWallet | null
  ercWrapper: ERC20Wrapper | null
  rpcUrl: string | null
}> => {
  try {
    // const manager = new RPCManager()
    const rpcUrl = await bscRPC(isTestnet)
    // const provider = new ethers.JsonRpcProvider(rpcUrl)

    // Create a new wallet
    const wallet = new ethers.Wallet(privateKey)

    const ercWrapper = await erc20Wrapper.connect(privateKey!, rpcUrl)

    return { wallet, ercWrapper, rpcUrl }
  } catch (error: any) {
    console.error('Error getting WalletWithProvider', error.message)
    return { wallet: null, ercWrapper: null, rpcUrl: null }
  }
}

/**
 * Swap Tokens on PancakeSwap
 * @param isTestnet - Boolean to indicate if the environment is testnet or mainnet
 * @param encryptedPhrase - Encrypted mnemonic/seed phrase of the user wallet
 * @param tokenIn - Address of the input token
 * @param tokenOut - Address of the output token
 * @param amountIn - Amount of the input token to swap
 * @param slippage - Slippage tolerance (in percentage)
 * @returns Transaction receipt
 */
export async function swaps(
  isTestnet: boolean,
  encryptedPhrase: string,
  tokenIn: string,
  tokenOut: string,
  amountIn: string,
  toAddress: string,
) {
  // Step 1: Initialize wallet and provider
  const { wallet, ercWrapper, rpcUrl } = await walletWithProvider(
    isTestnet,
    encryptedPhrase,
  )

  // AmountIn
  let _amtIn = parseFloat(amountIn).toString()

  const _pancakeRouter = isTestnet
    ? `0x9A082015c919AD0E47861e5Db9A1c7070E81A2C7`.toLowerCase()
    : `0x10ED43C718714eb63d5aA57B78B54704E256024E`.toLowerCase()

  if (!wallet || !rpcUrl || !ercWrapper) {
    throw new Error('Failed to initialize wallet or provider')
  }

  // Step 2: Setup PancakeSwap router and token contracts
  const provider = new ethers.JsonRpcProvider(rpcUrl)
  const walletProvider = wallet.connect(provider)
  console.log('Wallet Provider:', walletProvider)

  // ******************************************************************************
  const SupportedTokens = allowedTokens(isTestnet)

  // Validate that tokenIn and tokenOut are supported
  let tokenInAddress = ''
  let tokenOutAddress = ''
  const isTokenInSupported = SupportedTokens.find(
    (token) => token.symbol === tokenIn,
  )
  const isTokenOutSupported = SupportedTokens.find(
    (token) => token.symbol === tokenOut,
  )
  console.log({ isTokenInSupported, isTokenOutSupported })

  tokenInAddress = isTokenInSupported ? isTokenInSupported.address : ''
  tokenOutAddress = isTokenOutSupported ? isTokenOutSupported.address : ''

  if (!tokenInAddress || !tokenOutAddress) {
    console.log(
      `Error: One or both tokens are not supported. tokenIn: ${tokenIn}, tokenOut: ${tokenOut}`,
    )
    return {
      success: false,
      data: `Unsupported token(s). Supported tokens are: ${SupportedTokens.map(
        (token) => token.symbol,
      ).join(', ')}`,
    }
  }

  const tokenBalance = await erc20Wrapper.getTokenBalance(tokenInAddress)
  console.log('Token Balance:', tokenBalance)

  // Check if tokenIn is ETH
  if (tokenIn === 'BNB') {
    let path = [tokenInAddress, tokenOutAddress]
    const amountsOut = await erc20Wrapper.getAmountsOut(_amtIn, path)
    const decimals = await erc20Wrapper.getDecimals(tokenInAddress)

    if (!amountsOut) {
      console.log('Error getting amounts:', amountsOut)
      return { success: false, data: amountsOut }
    }
    const amountOutMin = amountsOut[1]
    let _amountIn = ethers.parseUnits(_amtIn, decimals).toString()

    console.log({ _amountIn, amountOutMin })

    const tokenBalance = await erc20Wrapper.getTokenBalance(tokenInAddress)

    const walletNonce = await erc20Wrapper.getWalletNonce(toAddress)
    const allowance = await erc20Wrapper.getAllowance(
      tokenInAddress,
      _pancakeRouter,
    )

    console.log({ walletNonce, allowance, amountsOut, decimals, tokenBalance })

    if (!walletNonce.success || !allowance) {
      console.log(
        'Error getting Nonce || Allowance',
        walletNonce.data,
        allowance,
      )
      return { success: false, data: walletNonce.data, allowance }
    }

    const overloads = {
      gasPrice: 2000000000,
      gasLimit: 3000000,
      nonce: walletNonce.data ? Number(walletNonce.data) : 0,
    }

    // approve allowance
    if (allowance < _amountIn) {
      const approve = await erc20Wrapper.approve(
        tokenInAddress,
        pancakeRouter,
        overloads,
      )
      console.log({ approve })
    }

    const routerContract = new ethers.Contract(
      pancakeRouter,
      ABI,
      walletProvider,
    )

    const swap = await swapETHforToken(
      routerContract,
      amountOutMin,
      path,
      toAddress,
      _amountIn,
      overloads,
    )
    console.log({ swap })

    if (!swap.success) {
      console.log('Error swapping tokens:', swap.data)
      return { success: false, data: swap.data }
    }

    return { success: true, data: swap.data }
  } else if (tokenOut === 'BNB') {
    let path = [tokenInAddress, tokenOutAddress]
    const amountsOut = await erc20Wrapper.getAmountsOut(_amtIn, path)
    const decimals = await erc20Wrapper.getDecimals(tokenInAddress)
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20
    const _amountIn = ethers.parseUnits(_amtIn, decimals).toString()
    const amountOutMin = amountsOut[1]

    if (!amountsOut) {
      console.log('Error getting amounts:', amountsOut)
      return { success: false, data: amountsOut }
    }

    const tokenBalance = await erc20Wrapper.getTokenBalance(tokenInAddress)

    const walletNonce = await erc20Wrapper.getWalletNonce(toAddress)
    const allowance = await erc20Wrapper.getAllowance(
      tokenInAddress,
      _pancakeRouter,
    )

    const overloads = {
      gasPrice: 2000000000,
      gasLimit: 30000000,
      nonce: walletNonce.data ? Number(walletNonce.data) + 1 : 1,
    }
    console.log({ amountsOut, overloads, walletNonce, tokenBalance })

    // approve allowance
    if (allowance < _amountIn) {
      const approve = await erc20Wrapper.approve(
        tokenInAddress,
        pancakeRouter,
        overloads,
      )
      console.log({ approve })
    }

    const routerContract = new ethers.Contract(
      pancakeRouter,
      ABI,
      walletProvider,
    )

    const swap = await swapTokenForETH(
      routerContract,
      _amountIn,
      amountOutMin,
      path,
      toAddress,
      deadline,
      overloads,
    )
    console.log({ swap })

    if (!swap.success) {
      console.log('Error swapping tokens:', swap.data)
      return { success: false, data: swap.data }
    }

    return { success: true, data: swap.data }
  } else {
    let path = [tokenInAddress, tokenOutAddress]
    console.log({ path })
    const amountsOut = await erc20Wrapper.getAmountsOut(_amtIn, path)
    const decimals = await erc20Wrapper.getDecimals(tokenInAddress)
    console.log('Amounts Out:', amountsOut, decimals)

    if (!amountsOut) {
      console.log('Error: Insufficient Amounts Input', amountsOut)
      return { success: false, data: amountsOut }
    }

    const deadline = Math.floor(Date.now() / 1000) + 60 * 20
    let _amountOutMin = amountsOut[1].toString()
    let _amountIn = ethers.parseUnits(_amtIn, decimals).toString()
    console.log({ _amountIn, _amountOutMin, tokenInAddress, tokenOutAddress })

    // Get Allowance
    const allowance = await erc20Wrapper.getAllowance(
      tokenInAddress,
      pancakeRouter,
    )

    const overloads = {
      gasPrice: 1000000000,
      gasLimit: 200000,
    }

    if (allowance < _amountIn) {
      const approve = await erc20Wrapper.approve(
        tokenInAddress,
        pancakeRouter,
        overloads,
      )
      console.log({ approve })
    }

    const tokenBalance = await erc20Wrapper.getTokenBalance(tokenInAddress)
    const walletNonce = await erc20Wrapper.getWalletNonce(toAddress)

    console.log({
      walletNonce,
      tokenBalance,
      amountsOut,
      _amountIn,
      _amountOutMin,
      allowance,
    })

    const routerContract = new ethers.Contract(
      _pancakeRouter,
      ABI,
      walletProvider,
    )

    const swap = await swapToken(
      routerContract,
      _amountIn,
      _amountOutMin,
      path,
      toAddress,
      deadline,
      overloads,
    )

    if (!swap.success) {
      console.log('Error swapping tokens:', swap.data)
      return { success: false, data: swap.data }
    }

    return { success: true, data: swap.data }
  }
}

export const erc20Wrapper = new ERC20Wrapper()
