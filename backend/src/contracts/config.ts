import { VAULT_ABI } from './abis/vault'
import { STRATEGY_ABI } from './abis/strategy'
import { ERC20_ABI } from './abis/erc20'
export const contracts: {
  [key: string]: {
    address?: any
    abi: any[]
  }
} = {
  vault: {
    address: '0x30DBb32b3B653BA1B550a6546692BFf285e0786C',
    abi: VAULT_ABI,
  },
  strategy: {
    address: '0xFe6eD896339455243F690Cc58a611e3Dde4E2c61',
    abi: STRATEGY_ABI,
  },
  erc20: {
    abi: ERC20_ABI,
  },
}
