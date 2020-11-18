import TagToken from '../../parser/tag-token'
import Context from '../../context/context'
import ITagImplOptions from '../../template/tag/itag-impl-options'
// @ts-ignore
import * as rp_ from 'request-promise-cache'
const rp = rp_

const re = new RegExp(`(https?(?:[^\\s\\{\\}]+|\\{\\{.*?\\}\\})+)(\\s+(\\s|.)*)?$`)
const headerRegex = new RegExp(`:headers\\s+(\\{(.|\\s)*?[^\\}]\\}([^\\}]|$))`)

// supported options: :basic_auth, :content_type, :save, :cache, :method, :body, :headers
export default <ITagImplOptions>{
  parse: function (tagToken: TagToken) {
    const match = tagToken.args.match(re)
    if (!match) {
      throw new Error(`illegal token ${tagToken.raw}`)
    }
    this.url = match[1]
    const options = match[2]
    this.options = {}
    if (options) {
      // first extract the headers option if it exists, because the headers JSON will contain a /\s+:/
      const headersMatch = options.match(headerRegex)
      if (headersMatch != null) {
        this.options.headers = JSON.parse(headersMatch[1])
      }
      // then replace the headers option if it exists, and proceed as normal for the other options
      options.replace(headerRegex, '').split(/\s+:/).forEach((optStr) => {
        if (optStr === '') return

        const opts = optStr.split(/\s+/)
        if (opts[0] === 'headers') {
          console.error('Headers JSON malformed. Check your headers value')
        }
        this.options[opts[0]] = opts.length > 1 ? opts[1] : true
      })
    }
  },
  render: async function (ctx: Context) {
    const renderedUrl = await this.liquid.parseAndRender(this.url, ctx.getAll())

    const method = (this.options.method || 'GET').toUpperCase()
    let cacheTTL = 300 * 1000 // default 5 mins
    if (method !== 'GET') {
      cacheTTL = 0
    } else {
      const cache = parseInt(this.options.cache, 10)
      if (cache > 0) {
        cacheTTL = cache * 1000
      } else if (cache === 0) {
        // This is a hack, nano-cache will not expire cache when ttl = 0
        cacheTTL = 1
      }
    }

    let contentType = this.options.content_type
    if (method === 'POST') {
      contentType = this.options.content_type || 'application/x-www-form-urlencoded'
    }

    const headers = {
      'User-Agent': 'brazejs-client',
      'Content-Type': contentType,
      'Accept': this.options.content_type
    }
    if (this.options.headers) {
      // Add specified headers to the headers
      for (const key of Object.keys(this.options.headers)) {
        headers[key] = await this.liquid.parseAndRender(this.options.headers[key], ctx.getAll())
      }
    }

    let body = this.options.body
    if (this.options.body) {
      if (method.toUpperCase() === 'POST' && contentType.toLowerCase().includes('application/json')) {
        const jsonBody = {}
        for (const element of this.options.body.split('&')) {
          const bodyElementSplit = element.split('=')
          jsonBody[bodyElementSplit[0]] = (await this.liquid.parseAndRender(bodyElementSplit[1], ctx.getAll())).replace(/(?:\r\n|\r|\n|)/g, '')
        }
        body = JSON.stringify(jsonBody)
      } else {
        body = await this.liquid.parseAndRender(this.options.body, ctx.getAll())
      }
    }

    const rpOption = {
      'resolveWithFullResponse': true,
      method,
      headers,
      body,
      uri: renderedUrl,
      cacheKey: renderedUrl,
      cacheTTL,
      timeout: 2000
    }

    if (this.options.basic_auth) {
      const secrets = ctx.environments['__secrets']
      if (!secrets) {
        throw new Error('No secrets defined in context!')
      }
      const secret = secrets[this.options.basic_auth]
      if (!secret) {
        throw new Error(`No secret found for ${this.options.basic_auth}`)
      }

      if (!secret.username || !secret.password) {
        throw new Error(`No username or password set for ${this.options.basic_auth}`)
      }

      rpOption['auth'] = {
        user: secret.username,
        pass: secret.password
      }
    }

    let res
    try {
      res = await rp(rpOption)
    } catch (e) {
      res = e
    }

    try {
      const jsonRes = JSON.parse(res.body)
      if (Object.prototype.toString.call(jsonRes) === '[object Object]') {
        jsonRes.__http_status_code__ = res.statusCode
      }
      ctx.environments[this.options.save || 'connected'] = jsonRes
    } catch (error) {
      console.error(`Could not parse response body: "${res.body}"`)
    }
  }
}
