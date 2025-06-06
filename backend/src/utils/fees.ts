export const getFees = async () => {
  const additionalAmounts = Number(process.env.ADDITIONAL_AMOUNTS || 1)
  const copyTradeFee = Number(process.env.COPY_TRADE_FEE || 3.5).toString() // 3.5% +  1$ fee
  const ip2pFee = Number(process.env.IP2P_FEE || 0.5).toString() // 0.5% fee

  const platformFee = Number(process.env.PLATFORM_FEE || 1.5).toString() // 1.5% fee
  return {
    copyTradeFee,
    ip2pFee,
    platformFee,
    currency: 'USD',
    additionalAmountInUsd: additionalAmounts.toString(),
  }
}
