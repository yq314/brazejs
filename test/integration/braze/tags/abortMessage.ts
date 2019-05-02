import Liquid from '../../../../src/liquid'
import { expect, should, use } from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import { ParseError } from '../../../../src/util/error'

should()
use(chaiAsPromised)

describe('braze/tags/abort_message', function () {
  const liquid = new Liquid()

  it('should abort message with default output', async function () {
    const src = 'test {% abort_message() %}'
    const html = await liquid.parseAndRender(src)
    return expect(html).to.equal('message is aborted')
  })

  it('should abort with custom output in single quote', async function () {
    const src = 'test {% abort_message(\'my message\') %}'
    const html = await liquid.parseAndRender(src)
    return expect(html).to.equal('my message')
  })

  it('should abort with custom output in double quote', async function () {
    const src = 'test {% abort_message("my message") %}'
    const html = await liquid.parseAndRender(src)
    return expect(html).to.equal('my message')
  })

  it('should fail for non string literals', async function () {
    const src = 'test {% abort_message(ddd) %}'
    return liquid.parseAndRender(src).should.be
      .rejectedWith(ParseError, 'illegal token {% abort_message(ddd)')
  })

  it('should abort only once and ignore the rest', async function () {
    const src = '{% if abort %} {% abort_message("abort 1") %} {% endif %}' +
      '{% if abort %} {% abort_message("abort 2") %} {% endif %}'
    const html = await liquid.parseAndRender(src, { abort: true })
    return expect(html).to.equal('abort 1')
  })
})
