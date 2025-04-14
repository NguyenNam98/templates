import { Injectable } from '@nestjs/common'
import * as crypto from 'crypto'
import * as CryptoJS from 'crypto-js'

@Injectable()
export class CryptoService {
  private readonly ENC_KEY = process.env.ENC_KEY || '' // Encryption key from environment variables
  private readonly SALT = 'salt' // Salt value (can be configured)

  /**
   * Encrypt the provided data using AES-256-CBC algorithm.
   * @param data - The string to be encrypted.
   * @returns Encrypted data with IV prepended.
   */
  encrypt(data: string): string {
    if (!data) {
      return ''
    }
    const key = crypto.scryptSync(this.ENC_KEY, this.SALT, 32) // Generate key using scrypt
    const iv = crypto.randomBytes(16) // Generate initialization vector
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
    let encrypted = cipher.update(data, 'utf8', 'base64')
    encrypted += cipher.final('base64')
    return iv.toString('base64') + ':' + encrypted // Prepend IV for decryption later
  }

  /**
   * Decrypt the provided encrypted data.
   * @param data - The encrypted data to decrypt.
   * @returns Decrypted string.
   */
  decrypt(data: string): string {
    if (!data) {
      return ''
    }
    const key = crypto.scryptSync(this.ENC_KEY, this.SALT, 32) // Generate key using scrypt
    const parts = data.split(':')
    const iv = Buffer.from(parts.shift()!, 'base64') // Extract IV
    const encryptedText = parts.join(':') // Remaining is encrypted data
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    let decrypted = decipher.update(encryptedText, 'base64', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  }

  simpleDecrypt(encryptedData: string): string {
    if (!encryptedData) return ''
    const iv = CryptoJS.lib.WordArray.random(16)

    const bytes = CryptoJS.AES.decrypt(encryptedData, 'vinhdep', { iv: iv })
    return bytes.toString(CryptoJS.enc.Utf8)
  }
}
