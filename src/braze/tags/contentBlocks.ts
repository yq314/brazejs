import TagToken from '../../parser/tag-token'
import { attribute } from '../../parser/lexical'
import Context from '../../context/context'
import ITagImplOptions from '../../template/tag/itag-impl-options'
import assert from "../../util/assert";
import Liquid from "../../liquid";
import BlockMode from "../../context/block-mode";

const camelToSnakeCase = function (text: string) {
    return text.replace(/(.)([A-Z][a-z]+)/, '$1_$2')
      .replace(/([a-z0-9])([A-Z])/, '$1_$2')
      .toLowerCase()
}

const renderContentBlocks = async function (liquid: Liquid, ctx: Context, fileName: string) {
    const customOpts = ctx.environments['__contentBlocks']

    const opts = {
        ...ctx.opts,
        root: (customOpts && customOpts['root']) || ['.', './content_blocks', '../content_blocks'],
    }

    const ext = (customOpts && customOpts['ext']) || '.liquid'

    let template
    try {
        template = await liquid.getTemplate(fileName, opts)
    } catch (err) {
        try {
            template = await liquid.getTemplate(camelToSnakeCase(fileName), opts)
        } catch (err) {
            try {
                template = await liquid.getTemplate(fileName + ext, opts)
            } catch (err) {
                template = await liquid.getTemplate(camelToSnakeCase(fileName) + ext, opts)
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
