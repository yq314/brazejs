/* eslint-disable no-template-curly-in-string */
import Liquid from '../../../../src/liquid'
import { expect, should, use } from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import { mock, restore } from '../../../stub/mockfs'
import { ParseError, RenderError } from '../../../../src/util/error'

should()
use(chaiAsPromised)

describe('braze/tags/content_blocks', function () {
  const liquid = new Liquid()

  afterEach(restore)

  it('should support content blocks in current dir', async function () {
    mock({
      './current.liquid': 'foo{{content_blocks.${content_block}}}',
      './content_block': 'bar'
    })
    const html = await liquid.renderFile('./current.liquid')
    return expect(html).to.equal('foobar')
  })

  it('should support content blocks in current dir with default .liquid ext', async function () {
    mock({
      './current.liquid': 'foo{{content_blocks.${content_block}}}',
      './content_block.liquid': 'bar'
    })
    const html = await liquid.renderFile('./current.liquid')
    return expect(html).to.equal('foobar')
  })

  it('should support content blocks in current dir with custom ext', async function () {
    mock({
      './current.liquid': 'foo{{content_blocks.${content_block}}}',
      './content_block.html': 'bar'
    })
    const html = await liquid.renderFile('./current.liquid', {
      '__contentBlocks': {
        ext: '.html'
      }
    })
    return expect(html).to.equal('foobar')
  })

  it('should support content blocks in content_blocks dir', async function () {
    mock({
      './current.liquid': 'foo{{content_blocks.${content_block}}}',
      './content_blocks/content_block': 'bar'
    })
    const html = await liquid.renderFile('./current.liquid')
    return expect(html).to.equal('foobar')
  })

  it('should support content blocks in content_blocks dir with default .liquid ext', async function () {
    mock({
      './current.liquid': 'foo{{content_blocks.${content_block}}}',
      './content_blocks/content_block.liquid': 'bar'
    })
    const html = await liquid.renderFile('./current.liquid')
    return expect(html).to.equal('foobar')
  })

  it('should support content blocks in content_blocks dir with custom ext', async function () {
    mock({
      './current.liquid': 'foo{{content_blocks.${content_block}}}',
      './content_blocks/content_block.html': 'bar'
    })
    const html = await liquid.renderFile('./current.liquid', {
      '__contentBlocks': {
        ext: '.html'
      }
    })
    return expect(html).to.equal('foobar')
  })

  it('should support content blocks in ../content_blocks dir', async function () {
    mock({
      './current.liquid': 'foo{{content_blocks.${content_block}}}',
      '../content_blocks/content_block': 'bar'
    })
    const html = await liquid.renderFile('./current.liquid')
    return expect(html).to.equal('foobar')
  })

  it('should support content blocks in ../content_blocks dir with default .liquid ext', async function () {
    mock({
      './current.liquid': 'foo{{content_blocks.${content_block}}}',
      '../content_blocks/content_block.liquid': 'bar'
    })
    const html = await liquid.renderFile('./current.liquid')
    return expect(html).to.equal('foobar')
  })

  it('should support content blocks in ../content_blocks dir with custom ext', async function () {
    mock({
      './current.liquid': 'foo{{content_blocks.${content_block}}}',
      '../content_blocks/content_block.html': 'bar'
    })
    const html = await liquid.renderFile('./current.liquid', {
      '__contentBlocks': {
        ext: '.html'
      }
    })
    return expect(html).to.equal('foobar')
  })

  it('should support content blocks in custom dir', async function () {
    mock({
      './current.liquid': 'foo{{content_blocks.${content_block}}}',
      '/dir/content_block': 'bar'
    })
    const html = await liquid.renderFile('./current.liquid', {
      '__contentBlocks': {
        root: '/dir'
      }
    })
    return expect(html).to.equal('foobar')
  })

  it('should support content blocks in custom dir with default .liquid ext', async function () {
    mock({
      './current.liquid': 'foo{{content_blocks.${content_block}}}',
      '/dir/content_block.liquid': 'bar'
    })
    const html = await liquid.renderFile('./current.liquid', {
      '__contentBlocks': {
        root: '/dir'
      }
    })
    return expect(html).to.equal('foobar')
  })

  it('should support content blocks in custom dir with custom ext', async function () {
    mock({
      './current.liquid': 'foo{{content_blocks.${content_block}}}',
      '/dir/content_block.html': 'bar'
    })
    const html = await liquid.renderFile('./current.liquid', {
      '__contentBlocks': {
        root: '/dir',
        ext: '.html'
      }
    })
    return expect(html).to.equal('foobar')
  })

  it('should support content blocks in multiple dirs', async function () {
    mock({
      './current.liquid': 'foo{{content_blocks.${content_block}}}{{content_blocks.${content_block2}}}',
      '/dir/content_block.html': 'bar',
      '/dir2/content_block2.html': 'baz'
    })
    const html = await liquid.renderFile('./current.liquid', {
      '__contentBlocks': {
        root: ['/dir', '/dir2'],
        ext: '.html'
      }
    })
    return expect(html).to.equal('foobarbaz')
  })

  it('should support nested content blocks', async function () {
    mock({
      './current.liquid': 'foo{{content_blocks.${content_block}}}',
      './content_block': 'bar{{content_blocks.${content_block_2}}}',
      './content_block_2': '2'
    })
    const html = await liquid.renderFile('./current.liquid')
    return expect(html).to.equal('foobar2')
  })

  it('should support camelCase content blocks', async function () {
    mock({
      './current.liquid': 'foo{{content_blocks.${contentBlockName}}}',
      './content-block-name': 'bar'
    })
    const html = await liquid.renderFile('./current.liquid')
    return expect(html).to.equal('foobar')
  })

  it('should support camelCase content blocks with default .liquid ext', async function () {
    mock({
      './current.liquid': 'foo{{content_blocks.${contentBlockName}}}',
      './content-block-name.liquid': 'bar'
    })
    const html = await liquid.renderFile('./current.liquid')
    return expect(html).to.equal('foobar')
  })

  it('should pass context to content blocks', async function () {
    mock({
      './current.liquid': 'foo{{content_blocks.${contentBlockName}}}',
      './content-block-name': 'bar{{var}}'
    })
    const html = await liquid.renderFile('./current.liquid', {
      var: 'value_of_var'
    })
    return expect(html).to.equal('foobarvalue_of_var')
  })

  it('should fail for invalid format', async function () {
    mock({
      './current.liquid': 'foo{{content_blocks.${}}}'
    })
    return liquid.renderFile('./current.liquid').should.be
      .rejectedWith(ParseError, 'illegal token {{content_blocks.${}}}')
  })

  it('should not search if liquid root has defined multiple roots', async function () {
    const liquidForTest = new Liquid({ root: ['/foo', '/bar'] })
    mock({
      '/foo/current.liquid': 'foo{{content_blocks.${content_block}}}',
      '/foo/content_blocks/content_block': 'bar'
    })
    return liquidForTest.renderFile('/foo/current.liquid').should.be
      .rejectedWith(RenderError, /ENOENT: Failed to lookup/)
  })
})
