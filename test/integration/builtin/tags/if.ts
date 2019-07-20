import Liquid from '../../../../src/liquid'
import { expect, use } from 'chai'
import * as chaiAsPromised from 'chai-as-promised'

use(chaiAsPromised)

describe('tags/if', function () {
  const liquid = new Liquid()
  const ctx = {
    one: 1,
    two: 2,
    emptyString: '',
    emptyArray: []
  }

  it('should throw if not closed', function () {
    const src = '{% if false%}yes'
    return expect(liquid.parseAndRender(src, ctx))
      .to.be.rejectedWith(/tag {% if false%} not closed/)
  })
  it('should support nested', async function () {
    const src = '{%if false%}{%if true%}{%else%}a{%endif%}{%endif%}'
    const html = await liquid.parseAndRender(src, ctx)
    return expect(html).to.equal('')
  })

  describe('single value as condition', function () {
    it('should support boolean', async function () {
      const src = '{% if false %}1{%elsif true%}2{%else%}3{%endif%}'
      const html = await liquid.parseAndRender(src, ctx)
      return expect(html).to.equal('2')
    })
    it('should treat Array truthy', async function () {
      const src = '{%if emptyArray%}a{%endif%}'
      const html = await liquid.parseAndRender(src, ctx)
      return expect(html).to.equal('a')
    })
    it('should return true if empty string', async function () {
      const src = '{%if emptyString%}a{%endif%}'
      const html = await liquid.parseAndRender(src, ctx)
      return expect(html).to.equal('a')
    })
  })
  describe('expression as condition', function () {
    it('should support ==', async function () {
      const src = '{% if 2==3 %}yes{%else%}no{%endif%}'
      const html = await liquid.parseAndRender(src, ctx)
      return expect(html).to.equal('no')
    })
    it('should support >=', async function () {
      const src = '{% if 1>=2 and one<two %}a{%endif%}'
      const html = await liquid.parseAndRender(src, ctx)
      return expect(html).to.equal('')
    })
    it('should support !=', async function () {
      const src = '{% if one!=two %}yes{%else%}no{%endif%}'
      const html = await liquid.parseAndRender(src, ctx)
      return expect(html).to.equal('yes')
    })
    it('should support value and expression', async function () {
      const src = `X{%if version and version != '' %}x{{version}}y{%endif%}Y`
      const ctx = { 'version': '' }
      const html = await liquid.parseAndRender(src, ctx)
      return expect(html).to.equal('XY')
    })
  })
  describe('comparasion to null', function () {
    it('should evaluate false for null < 10', async function () {
      const src = '{% if null < 10 %}yes{% else %}no{% endif %}'
      const html = await liquid.parseAndRender(src, ctx)
      return expect(html).to.equal('no')
    })

    it('should evaluate false for null > 10', async function () {
      const src = '{% if null > 10 %}yes{% else %}no{% endif %}'
      const html = await liquid.parseAndRender(src, ctx)
      return expect(html).to.equal('no')
    })

    it('should evaluate false for null <= 10', async function () {
      const src = '{% if null <= 10 %}yes{% else %}no{% endif %}'
      const html = await liquid.parseAndRender(src, ctx)
      return expect(html).to.equal('no')
    })

    it('should evaluate false for null >= 10', async function () {
      const src = '{% if null >= 10 %}yes{% else %}no{% endif %}'
      const html = await liquid.parseAndRender(src, ctx)
      return expect(html).to.equal('no')
    })

    it('should evaluate false for 10 < null', async function () {
      const src = '{% if 10 < null %}yes{% else %}no{% endif %}'
      const html = await liquid.parseAndRender(src, ctx)
      return expect(html).to.equal('no')
    })

    it('should evaluate false for 10 > null', async function () {
      const src = '{% if 10 > null %}yes{% else %}no{% endif %}'
      const html = await liquid.parseAndRender(src, ctx)
      return expect(html).to.equal('no')
    })

    it('should evaluate false for 10 <= null', async function () {
      const src = '{% if 10 <= null %}yes{% else %}no{% endif %}'
      const html = await liquid.parseAndRender(src, ctx)
      return expect(html).to.equal('no')
    })

    it('should evaluate false for 10 >= null', async function () {
      const src = '{% if 10 >= null %}yes{% else %}no{% endif %}'
      const html = await liquid.parseAndRender(src, ctx)
      return expect(html).to.equal('no')
    })

    it('should support variable value', async function () {
      const src = '{% if {{a}} > 1 %}{{b}}{% else %}{{c}}{% endif %}'
      const html = await liquid.parseAndRender(src, {
        a: 2,
        b: 'yes',
        c: 'no'
      })
      return expect(html).to.equal('yes')
    })

    it('should check falsy correctly', async function () {
      const src = '{% if {{a}} %}{{x}}{% endif %}{% if {{b}} %}{{y}}{% endif %}{% if {{c}} %}{{z}}{% endif %}'
      const html = await liquid.parseAndRender(src, {
        a: '',
        b: [],
        x: 'x',
        y: 'y',
        z: 'z'
      })
      return expect(html).to.equal('xy')
    })

    it('should strictly compare with true', async function () {
      const src = '{% if {{a}} == true %}{{x}}{% endif %}{% if {{b}} == true %}{{y}}{% endif %}'
      const html = await liquid.parseAndRender(src, {
        a: true,
        x: 'x',
        y: 'y'
      })
      return expect(html).to.equal('x')
    })

    it('should strictly compare with false', async function () {
      const src = '{% if {{a}} == false %}{{x}}{% endif %}{% if {{b}} == false %}{{y}}{% endif %}'
      const html = await liquid.parseAndRender(src, {
        a: false,
        x: 'x',
        y: 'y'
      })
      return expect(html).to.equal('x')
    })
  })
})
