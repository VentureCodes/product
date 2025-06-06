export const checkEnv = () => {
  const requiredEnvVars = [
    'NODE_ENV',
    'DATABASE_URL',
    'JWT_SECRET',
    'MAM_LAKA_BASE_URL',
    'MAM_LAKA_USERNAME',
    'MAM_LAKA_PASSWORD',
    'AFRICA_TALKING_SENDER_ID',
    'AFRICA_TALKING_NOW_USERNAME',
    'AFRICA_TALKING_NOW_KEY',
    'BASE_URL',
    'CURRENCY_API_KEY',
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_CHAT_ID',
    'TELEGRAM_USERS',
    'BYBIT_API_KEY',
    'BYBIT_API_SECRET',
  ]

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar],
  )
  //  set default value for BLOCKCHAIN_NETWORK

  if (process.env.BLOCKCHAIN_NETWORK) {
    process.env['BLOCKCHAIN_NETWORK'] = process.env.BLOCKCHAIN_NETWORK!
  } else {
    process.env['BLOCKCHAIN_NETWORK'] = 'mainnet'
  }

  if (missingEnvVars.length > 0) {
    throw new Error(
      `The following environment variables must be defined: ${missingEnvVars.join(
        ', ',
      )}`,
    )
  }
}
