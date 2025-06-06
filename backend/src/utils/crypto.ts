import { Wallet } from 'ethers'
import crypto from 'crypto'

export class HdWallet {
  create = () => {
    // Generate wallet
    return Wallet.createRandom()
  }

  encryptPhrase(phrase: string) {
    // generate a random IV
    const iv = crypto.randomBytes(16)

    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(process.env.WALLET_SALT!, 'hex'),
      iv,
    )
    let encrypted = cipher.update(phrase, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    // output as iv:ciphertext
    return iv.toString('hex') + ':' + encrypted
  }

  decryptPhrase(phrase: string) {
    const textParts = phrase.split(':')
    const iv = Buffer.from(textParts.shift()!, 'hex')

    const encryptedText = textParts.join(':')
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(process.env.WALLET_SALT!, 'hex'),
      iv,
    )
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }
}
