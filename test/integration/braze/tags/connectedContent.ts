import Liquid from '../../../../src/liquid'
import { expect, should, use } from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as nock from 'nock'
import * as sinon from 'sinon'
import { ParseError, RenderError } from '../../../../src/util/error'

should()
use(chaiAsPromised)

describe('braze/tags/connected_content', function () {
  before(function () {
    nock.disableNetConnect()

    nock('http://localhost:8080', {
      reqheaders: {
        'User-Agent': 'brazejs-client'
      }
    })
      .get('/json/1')
      .reply(200, { first_name: 'Qing', last_name: 'Ye' })
      .persist()
  })

  afterEach(function () {
    nock.cleanAll()
  })

  after(function () {
    nock.enableNetConnect()
    nock.restore()
  })

  const liquid = new Liquid()

  it('should save result to default var', async function () {
    const src = '{% connected_content http://localhost:8080/json/{{user_id}} %}{{connected.first_name}}'
    const html = await liquid.parseAndRender(src, { 'user_id': '1' })
    return expect(html).to.equal('Qing')
  })

  it('should parse output in url', async function () {
    const src = '{% connected_content http://localhost:8080/json/{{user_id | plus: 1}} %}{{connected.first_name}}'
    const html = await liquid.parseAndRender(src, { 'user_id': '0' })
    return expect(html).to.equal('Qing')
  })

  it('should save to var', async function () {
    const src = '{% connected_content http://localhost:8080/json/1 :retry :save user %}' +
      '{{user.first_name}} {{user.__http_status_code__}}'
    const html = await liquid.parseAndRender(src)
    expect(html).to.equal('Qing 200')
  })

  it('should fail if passed non url', async function () {
    const src = '{% connected_content aabbcc %}'
    return liquid.parseAndRender(src).should.be
      .rejectedWith(ParseError, 'illegal token {% connected_content aabbcc %}')
  })

  it('should output directly if response is not json', async function () {
    nock('http://localhost:8080', {
      reqheaders: {
        'User-Agent': 'brazejs-client'
      }
    })
      .get('/text')
      .reply(200, { res: 'text response' })

    const src = '{% connected_content http://localhost:8080/text %}{{connected.res}}'
    const html = await liquid.parseAndRender(src)
    return expect(html).to.equal('text response')
  })

  it('should add status code to result', async function () {
    nock('http://localhost:8080', {
      reqheaders: {
        'User-Agent': 'brazejs-client'
      }
    })
      .get('/500')
      .reply(500, { a: 'b' })

    const src = '{% connected_content http://localhost:8080/500 :save user %}{{user.__http_status_code__}}'
    const html = await liquid.parseAndRender(src)
    return expect(html).to.equal('500')
  })

  it('should not add status code if result is not object', async function () {
    nock('http://localhost:8080', {
      reqheaders: {
        'User-Agent': 'brazejs-client'
      }
    })
      .get('/200')
      .reply(200, [1, 2])

    const src = '{% connected_content http://localhost:8080/200 :save user %}{{user.__http_status_code__}}'
    const html = await liquid.parseAndRender(src)
    return expect(html).to.equal('')
  })

  describe('basic auth should work', async function () {
    it('should set basic auth', async function () {
      nock('http://localhost:8080', {
        reqheaders: {
          'User-Agent': 'brazejs-client'
        }
      })
        .get('/auth')
        .basicAuth({ user: 'username', pass: 'password' })
        .reply(200, { res: 'auth successful' })

      const src = '{% connected_content http://localhost:8080/auth :basic_auth secrets %}{{connected.res}}'
      const html = await liquid.parseAndRender(src, {
        __secrets: {
          secrets: {
            username: 'username',
            password: 'password'
          }
        }
      })
      return expect(html).to.equal('auth successful')
    })

    it('should fail if no secrets in context', async function () {
      const src = '{% connected_content http://localhost:8080/auth :basic_auth secrets %}'
      return liquid.parseAndRender(src).should.be
        .rejectedWith(RenderError, 'No secrets defined in context!')
    })

    it('should fail if no key defined for secrets in context', async function () {
      const src = '{% connected_content http://localhost:8080/auth :basic_auth secrets %}'
      return liquid.parseAndRender(src, {
        __secrets: {}
      }).should.be.rejectedWith(RenderError, 'No secret found for secrets')
    })

    it('should fail if no username in context', async function () {
      const src = '{% connected_content http://localhost:8080/auth :basic_auth secrets %}'
      return liquid.parseAndRender(src, {
        __secrets: {
          secrets: {
            password: 'password'
          }
        }
      }).should.be.rejectedWith(RenderError, 'No username or password set for secrets')
    })

    it('should fail if no password in context', async function () {
      const src = '{% connected_content http://localhost:8080/auth :basic_auth secrets %}'
      return liquid.parseAndRender(src, {
        __secrets: {
          secrets: {
            username: 'username'
          }
        }
      }).should.be.rejectedWith(RenderError, 'No username or password set for secrets')
    })
  })

  it('should work for POST', async function () {
    nock('http://localhost:8080', {
      reqheaders: {
        'User-Agent': 'brazejs-client',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .post('/post', 'a=b&c=d')
      .reply(201, { res: 'ok' })

    const src = '{% connected_content http://localhost:8080/post :method post :body a=b&c=d %}{{connected.res}}'
    const html = await liquid.parseAndRender(src)
    return expect(html).to.equal('ok')
  })

  it('should set content-type', async function () {
    nock('http://localhost:8080', {
      reqheaders: {
        'User-Agent': 'brazejs-client',
        'Accept': 'text/plain'
      }
    })
      .get('/plain')
      .reply(200, { res: 'plain text response' })

    const src = '{% connected_content http://localhost:8080/plain :content_type text/plain %}{{connected.res}}'
    const html = await liquid.parseAndRender(src)
    return expect(html).to.equal('plain text response')
  })

  describe('cache should work', async function () {
    let clock: sinon.SinonFakeTimers
    beforeEach(function () {
      clock = sinon.useFakeTimers()
      nock('http://localhost:8080', {
        reqheaders: {
          'User-Agent': 'brazejs-client'
        }
      })
        .get('/cache')
        .reply(200, { res: 'cached response' })
        .post('/cache', 'a=b')
        .reply(201, { res: 'cached response' })
    })

    afterEach(function () {
      clock.restore()
    })

    it('should cache for 5 mins by default', async function () {
      const src = '{% connected_content http://localhost:8080/cache %}{{connected.res}}'
      const html = await liquid.parseAndRender(src)
      expect(html).to.equal('cached response')

      clock.tick(300 * 1000 - 1)
      const html2 = await liquid.parseAndRender(src)
      expect(html2).to.equal('cached response')

      clock.tick(2)
      const html3 = await liquid.parseAndRender(src)
      expect(html3).to.equal('')
    })

    it('should not cache for non GET request', async function () {
      const src = '{% connected_content http://localhost:8080/cache :method post :body a=b %}{{connected.res}}'
      const html = await liquid.parseAndRender(src)
      expect(html).to.equal('cached response')

      const html2 = await liquid.parseAndRender(src)
      expect(html2).to.equal('')
    })

    it('should cache for specified period', async function () {
      const src = '{% connected_content http://localhost:8080/cache :cache 100 %}{{connected.res}}'
      const html = await liquid.parseAndRender(src)
      expect(html).to.equal('cached response')

      clock.tick(100 * 1000 - 1)
      const html2 = await liquid.parseAndRender(src)
      expect(html2).to.equal('cached response')

      clock.tick(2)
      const html3 = await liquid.parseAndRender(src)
      expect(html3).to.equal('')
    })

    it('should not cache if set to 0', async function () {
      const src = '{% connected_content http://localhost:8080/cache :cache 0 %}{{connected.res}}'
      const html = await liquid.parseAndRender(src)
      expect(html).to.equal('cached response')

      clock.tick(1)
      const html2 = await liquid.parseAndRender(src)
      expect(html2).to.equal('')
    })
  })

  describe('headers should be pulled correctly', async function () {
    beforeEach(function () {
      nock('http://localhost:8080', {
        reqheaders: {
          'User-Agent': 'brazejs-client',
          'testHeader': 'headerValue'
        }
      })
        .post('/headertest')
        .reply(200, { res: 'pass' })
        .persist()

      nock('http://localhost:8080', {
        reqheaders: {
          'User-Agent': 'differentAgent',
          'testHeader': 'headerValue'
        }
      })
        .post('/agent2')
        .reply(200, { res: 'pass' })
        .persist()

      nock('http://localhost:8080', {
        reqheaders: {
          'User-Agent': 'brazejs-client'
        }
      })
        .post('/noheaders')
        .reply(200, { res: 'pass no headers' })
        .persist()
    })

    it('should pull correct header from connected content block', async function () {
      const src = '{% connected_content http://localhost:8080/headertest :headers { "testHeader": "headerValue" } \n:method post %}{{connected.res}}'
      const html = await liquid.parseAndRender(src)
      expect(html).to.equal('pass')
    })

    it('should pull correct header from multi-line connected content block', async function () {
      const src = '{% connected_content \nhttp://localhost:8080/headertest \n:headers { \n"testHeader": "headerValue" \n} \n:content_type application/json \n:method post \n%}{{connected.res}}'
      const html = await liquid.parseAndRender(src)
      expect(html).to.equal('pass')
    })

    it('should pull differently formatted JSON header from multi-line connected content block', async function () {
      const src = '{% connected_content \nhttp://localhost:8080/headertest \n:headers { \n"testHeader" :      "headerValue",\n "someId": 2123  \n} \n:content_type application/json \n:method post \n%}{{connected.res}}'
      const html = await liquid.parseAndRender(src)
      expect(html).to.equal('pass')
    })

    it('should handle malformed json headers', async function () {
      const src = '{% connected_content http://localhost:8080/noheaders :headers { "User-Agent": "differentAgent", "testHeader": "header :method post %}{{connected.res}}'
      const html = await liquid.parseAndRender(src)
      expect(html).to.equal('pass no headers')
    })

    it('should handle json headers with attribute tags', async function () {
      const src = '{% connected_content http://localhost:8080/agent2 :headers { "User-Agent": "{{otherAgent}}", "testHeader": "headerValue" } :method post %}{{connected.res}}'
      const html = await liquid.parseAndRender(src, { 'otherAgent': 'differentAgent' })
      expect(html).to.equal('pass')
    })

    it('should overwrite user-agent header from connected content block', async function () {
      const src = '{% connected_content http://localhost:8080/agent2 :headers { "User-Agent": "differentAgent", "testHeader": "headerValue" } :method post %}{{connected.res}}'
      const html = await liquid.parseAndRender(src)
      expect(html).to.equal('pass')
    })
  })

  describe('process json body', async function () {
    beforeEach(function () {
      nock('http://localhost:8080', {
        reqheaders: {
          'User-Agent': 'brazejs-client'
        }
      })
        .post('/bodytest', { body: 'content' })
        .reply(200, { res: 'pass' })
        .post('/bodytest_multiple', { body: 'content', body2: 'content2' })
        .reply(200, { res: 'pass' })
        // You can't pass nested objects in Braze, but you can pass json strings
        .post('/bodytest_nested', { body: '{ "nest": "nestedcontent" }' })
        .reply(200, { res: 'pass' })
        .persist()
    })

    it('should parse body to json', async function () {
      const src = `{% connected_content http://localhost:8080/bodytest :method post :content_type application/json :body body=content } %}{{connected.res}}`
      const html = await liquid.parseAndRender(src)
      expect(html).to.equal('pass')
    })

    it('should parse body to json using variables', async function () {
      const src = `{% connected_content http://localhost:8080/bodytest :method post :content_type application/json :body body={{content}} } %}{{connected.res}}`
      const html = await liquid.parseAndRender(src, { content: 'content' })
      expect(html).to.equal('pass')
    })

    it('should parse multiple body fields to json', async function () {
      const src = `{% connected_content http://localhost:8080/bodytest_multiple :method post :content_type application/json :body body={{content}}&body2=content2 } %}{{connected.res}}`
      const html = await liquid.parseAndRender(src, { content: 'content' })
      expect(html).to.equal('pass')
    })

    it('should parse a nested body to json using variables', async function () {
      const src = `{% connected_content http://localhost:8080/bodytest_nested :method post :content_type application/json :body body={{content}} } %}{{connected.res}}`
      const html = await liquid.parseAndRender(src, { content: '{ "nest": "nestedcontent" }' })
      expect(html).to.equal('pass')
    })
  })

  describe('process json body', async function () {
    beforeEach(function () {
      nock('http://localhost:8080', {
        reqheaders: {
          'User-Agent': 'brazejs-client'
        }
      })
        .post('/bodytest', { body: 'content' })
        .reply(200, { res: 'pass' })
        .post('/bodytest_multiple', { body: 'content', body2: 'content2' })
        .reply(200, { res: 'pass' })
        // You can't pass nested objects in Braze, but you can pass json strings
        .post('/bodytest_nested', { body: '{ "nest": "nestedcontent" }' })
        .reply(200, { res: 'pass' })
        .persist()
    })

    it('should parse body to json', async function () {
      const src = `{% connected_content http://localhost:8080/bodytest :method post :content_type application/json :body body=content } %}{{connected.res}}`
      const html = await liquid.parseAndRender(src)
      expect(html).to.equal('pass')
    })

    it('should parse body to json using variables', async function () {
      const src = `{% connected_content http://localhost:8080/bodytest :method post :content_type application/json :body body={{content}} } %}{{connected.res}}`
      const html = await liquid.parseAndRender(src, { content: 'content' })
      expect(html).to.equal('pass')
    })

    it('should parse multiple body fields to json', async function () {
      const src = `{% connected_content http://localhost:8080/bodytest_multiple :method post :content_type application/json :body body={{content}}&body2=content2 } %}{{connected.res}}`
      const html = await liquid.parseAndRender(src, { content: 'content' })
      expect(html).to.equal('pass')
    })

    it('should parse a nested body to json using variables', async function () {
      const src = `{% connected_content http://localhost:8080/bodytest_nested :method post :content_type application/json :body body={{content}} } %}{{connected.res}}`
      const html = await liquid.parseAndRender(src, { content: '{ "nest": "nestedcontent" }' })
      expect(html).to.equal('pass')
    })
  })
})
