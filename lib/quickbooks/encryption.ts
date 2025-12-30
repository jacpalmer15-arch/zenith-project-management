import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'

/**
 * Get encryption key from environment variable
 * Throws error if key is not configured
 */
function getEncryptionKey(): Buffer {
  const key = process.env.QUICKBOOKS_ENCRYPTION_KEY
  if (!key) {
    throw new Error('QUICKBOOKS_ENCRYPTION_KEY environment variable is not set')
  }
  if (key.length !== 64) {
    throw new Error('QUICKBOOKS_ENCRYPTION_KEY must be 64 hex characters (32 bytes)')
  }
  return Buffer.from(key, 'hex')
}

/**
 * Encrypt sensitive text using AES-256-GCM
 * Returns encrypted string in format: iv:authTag:encryptedText
 */
export function encrypt(text: string): string {
  const KEY = getEncryptionKey()
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

/**
 * Decrypt text encrypted with encrypt()
 * Expects format: iv:authTag:encryptedText
 */
export function decrypt(encrypted: string): string {
  const KEY = getEncryptionKey()
  const [ivHex, authTagHex, encryptedText] = encrypted.split(':')
  
  if (!ivHex || !authTagHex || !encryptedText) {
    throw new Error('Invalid encrypted text format')
  }
  
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv)
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}
