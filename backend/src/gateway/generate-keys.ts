import crypto from 'crypto'

/**
 * Generate a public and private key pair for the Changelly API.
 * @returns {publicKey: string, privateKey: string, apiKey: string}
 */
export const changelyGeneratePublicAndPrivateKeys = (): {
  publicKey: string
  privateKey: string
  apiKey: string
} => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'der',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'der',
    },
  })

  return {
    publicKey: publicKey.toString('base64'),
    privateKey: privateKey.toString('hex'),
    apiKey: crypto.createHash('sha256').update(publicKey).digest('base64'),
  }
}
