import crypto from 'crypto'

export const authenticate = (privateKeyString: string, message: object) => {
  const privateKey = crypto.createPrivateKey({
    key: privateKeyString,
    format: 'der',
    type: 'pkcs8',
    encoding: 'hex',
  })
  const publicKey = crypto.createPublicKey(privateKey).export({
    type: 'pkcs1',
    format: 'der',
  })

  const signature = crypto.sign(
    'sha256',
    Buffer.from(JSON.stringify(message)),
    {
      //   key: privateKey,
      //   type: 'pkcs8',
      //   format: 'der',
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    },
  )

  return {
    signature: signature.toString('base64'),
    publicKey: crypto.createHash('sha256').update(publicKey).digest('base64'),
    message,
  }
}
