import TagToken from '../../parser/tag-token'
import { attribute } from '../../parser/lexical'
import Context from '../../context/context'
import ITagImplOptions from '../../template/tag/itag-impl-options'
import assert from '../../util/assert'
import Liquid from '../../liquid'
import BlockMode from '../../context/block-mode'
import { resolve } from 'path'

const toKebabCase = (str: String) =>
  str!.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)!
    .map(x => x.toLocaleLowerCase())
    .join('-')

const renderContentBlocks = async function (liquid: Liquid, ctx: Context, fileName: string) {
  const customOpts = ctx.environments['__contentBlocks']

  const opts = {}
  const root = ctx.opts.root.slice(0)
  if (root.length === 1) {
    const base = root[0]

    if (customOpts && customOpts.root) {
      opts['root'] = resolve(base, customOpts.root)
    } else {
      opts['root'] = ['./content_blocks', '../content_blocks'].map(p => resolve(base, p))
    }
  }

  const ext = (customOpts && customOpts.ext) || '.liquid'

  let template
  try {
    template = await liquid.getTemplate(fileName, opts)
  } catch (err) {
    try {
      template = await liquid.getTemplate(toKebabCase(fileName), opts)
    } catch (err) {
      try {
        template = await liquid.getTemplate(fileName + ext, opts)
      } catch (err) {
        template = await liquid.getTemplate(toKebabCase(fileName) + ext, opts)
      }
    }
  }

  return liquid.renderer.renderTemplates(template, ctx)
}

export default <ITagImplOptions>{
  parse: function (tagToken: TagToken) {
    const match = tagToken.value.match(attribute)
    if (!match) {
      throw new Error(`illegal token ${tagToken.raw}`)
    }
    this.fileName = match[2]
    this.extension = '.liquid'
  },
  render: async function (ctx: Context) {
    assert(this.fileName, `content blocks name is undefined`)

    const originBlocks = ctx.getRegister('blocks')
    const originBlockMode = ctx.getRegister('blockMode')
    ctx.setRegister('blocks', {})
    ctx.setRegister('blockMode', BlockMode.OUTPUT)

    const html = renderContentBlocks(this.liquid, ctx, this.fileName)
    ctx.setRegister('blocks', originBlocks)
    ctx.setRegister('blockMode', originBlockMode)

    return html
  }
}
