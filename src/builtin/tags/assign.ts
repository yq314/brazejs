import assert from '../../util/assert'
import { identifier } from '../../parser/lexical'
import TagToken from '../../parser/tag-token'
import Context from '../../context/context'
import ITagImplOptions from '../../template/tag/itag-impl-options'

const re = new RegExp(`(${identifier.source})\\s*=\\s*([^]*)`)

export default {
  parse: function (token: TagToken) {
    const match = token.args.match(re) as RegExpMatchArray
    assert(match, `illegal token ${token.raw}`)
    this.key = match[1]
    this.value = match[2]
    this.token = token
  },
  render: async function (ctx: Context) {
    const value = this.value
      .replace(ctx.opts.outputDelimiterLeft, '')
      .replace(ctx.opts.outputDelimiterRight, '')
    ctx.front()[this.key] = await this.liquid.evalValue(value, ctx)
  }
} as ITagImplOptions
