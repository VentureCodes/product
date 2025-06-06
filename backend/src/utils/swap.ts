import { ethers, JsonRpcProvider } from 'ethers'
import ABI from '../erc20Abi/pancakeswap.json'

const PancakeRouter = `0x10ED43C718714eb63d5aA57B78B54704E256024E`.toLowerCase()

// getTokenBalance
export const getTokenBalance = async (
  tokenAddress: string,
  wallet: string,
  provider: JsonRpcProvider,
) => {
  try {
    const contract = new ethers.Contract(tokenAddress, ABI, provider)
    const balance = await contract.balanceOf(wallet)

    return { success: true, data: balance }
  } catch (error) {
    console.log('Error getting balance:', error)

    return { success: false, data: error }
  }
}

// GetAmountsOut
export const getAmountsOut = async (
  amountIn: string,
  path: string[],
  provider: JsonRpcProvider,
) => {
  const amountsOutABI = [
    'function getAmountsOut(uint amountIn, address[] memory path) public view  returns (uint[] memory amounts)',
  ]
  const contract = new ethers.Contract(PancakeRouter, amountsOutABI, provider)
  try {
    const amounts = await contract.getAmountsOut(amountIn, path)
    console.log('AMOUNTS:', amounts)

    return amounts
  } catch (error: any) {
    console.log('Error getting amounts:', error)

    return null
  }
}

// Get walletNonce
export const getWalletNonce = async (
  wallet: string,
  provider: JsonRpcProvider,
) => {
  try {
    const nonce = await provider.getTransactionCount(wallet)

    return { success: true, data: nonce }
  } catch (error) {
    console.log('Error getting nonce:', error)

    return { success: false, data: 0 }
  }
}

// Get Allowance for token
export const getAllowance = async (
  token: string,
  account: ethers.Wallet,
): Promise<string> => {
  try {
    const contract = new ethers.Contract(token, ABI, account)
    const allowance = await contract.allowance(account, PancakeRouter)
    const decimals = await contract.decimals()
    return ethers.formatUnits(allowance, decimals)
  } catch (error) {
    return '0'
  }
}

// Approve Allowance

const MAX_INT =
  '115792089237316195423570985008687907853269984665640564039457584007913129639935'
export const approveAllowance = async (
  token: string,
  account: ethers.Wallet,
) => {
  try {
    const overloads = {
      gasPrice: 2000000000,
      gasLimit: 300000,
    }
    console.log('APPROVING ALLOWANCE')
    const contract = new ethers.Contract(token, ABI, account)
    let approveTx = await contract.approve(PancakeRouter, MAX_INT, overloads)
    // await approveTx.wait();
    return { success: true, data: approveTx }
  } catch (error) {
    console.log('Error approving allowance:', error)
    return { success: false, data: error }
  }
}

// SwapTokens
export const swapToken = async (
  routerContract: ethers.Contract,
  amountIn: string,
  amountOutMin: string,
  path: string[],
  to: string,
  deadline: number,
  overloads?: any,
) => {
  try {
    const transaction =
      await routerContract.swapExactTokensForTokensSupportingFeeOnTransferTokens(
        amountIn,
        amountOutMin,
        path,
        to,
        deadline,
        overloads,
      )
    const receipt = await transaction.wait()

    return { success: true, data: receipt }
  } catch (error) {
    console.log('Error swapping tokens:', error)

    return { success: false, data: error }
  }
}

// SwapETH

export const swapETHforToken = async (
  routerContract: ethers.Contract,
  amountOutMin: string,
  path: string[],
  to: string,
  amountIn: string,
  overloads?: any,
) => {
  try {
    const deadline = Math.floor(Date.now() / 1000) + 60 * 2 // 2 minutes
    const _overloads = {
      ...overloads,
      value: amountIn,
    }
    const transaction =
      await routerContract.swapExactETHForTokensSupportingFeeOnTransferTokens(
        amountOutMin,
        path,
        to,
        deadline,
        _overloads,
      )
    console.log('ETH FOR TOKEN SWAP TRANSACTION SENT...', transaction)
    const receipt = await transaction.wait()
    console.log('ETH FOR TOKEN SWAP TRANSACTION CONFIRMED...', receipt)

    return { success: true, data: receipt }
  } catch (error) {
    console.log('Error swapping ETH:', error)

    return { success: false, data: error }
  }
}

// SwapTokenForETH

export const swapTokenForETH = async (
  routerContract: ethers.Contract,
  amountIn: string,
  amountOutMin: string,
  path: string[],
  to: string,
  deadline: number,
  overloads?: any,
) => {
  console.log(
    `SWAPPING TOKEN FOR ETH: ${amountIn}, ${amountOutMin}, ${path}, ${to}, ${deadline}, ${overloads}`,
  )
  try {
    const transaction =
      await routerContract.swapExactTokensForETHSupportingFeeOnTransferTokens(
        amountIn,
        amountOutMin,
        path,
        to,
        deadline,
        overloads,
      )

    console.log('TOKEN FOR ETH SWAP TRANSACTION SENT...', transaction)
    const receipt = await transaction.wait()
    console.log('TOKEN FOR ETH SWAP TRANSACTION CONFIRMED...', receipt)

    return { success: true, data: receipt }
  } catch (error) {
    console.log('Error swapping tokens:', error)

    return { success: false, data: error }
  }
}
