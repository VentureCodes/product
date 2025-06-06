interface Performance {
  March: string
  April: string
  May: string
}

interface Strategy {
  strategyId: string
  name: string
  description: string
  averageReturn: string
  riskLevel: string
}

interface Contact {
  email: string
  twitter: string
  linkedin: string
}

export interface CopyTrader {
  name: string
  experience: string
  tradingStyle: string
  averageReturn: string
  platform: string
  followers: number
  tradesCopied: number
  successRate: string
  riskLevel: string
  bio: string
  performance: {
    '2024': Performance
  }
  strategies: Strategy[]
  contact: Contact
}
