import * as crypto from 'crypto'

export default {
  'md5': (x: string) => {
    const hash = crypto.createHash('md5')
    hash.update(x)
    return hash.digest('hex')
  },
  'sha1': (x: string) => {
    const hash = crypto.createHash('sha1')
    hash.update(x)
    return hash.digest('hex')
  },
  'sha2': (x: string) => {
    const hash = crypto.createHash('sha256')
    hash.update(x)
    return hash.digest('hex')
  },
  'hmac_sha1': (x: string, secretKey: string) => {
    const hmac = crypto.createHmac('sha1', secretKey)
    hmac.update(x)
    return hmac.digest('hex')
  },
  'base64': (x: string) => Buffer.from(x, 'utf8').toString('base64')
}
