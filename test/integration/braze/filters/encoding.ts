import { test } from '../../../stub/render'

describe('braze/filters/encoding', function () {
  describe('md5', function () {
    it('should return a md5 encoded string', () => test('{{"hey" | md5}}', '6057f13c496ecf7fd777ceb9e79ae285'))
  })

  describe('sha1', function () {
    it('should return a sha1 encoded string', () => test('{{"hey" | sha1}}', '7f550a9f4c44173a37664d938f1355f0f92a47a7'))
  })

  describe('sha2', function () {
    it('should return a sha256 encoded string', () => test('{{"hey" | sha2}}', 'fa690b82061edfd2852629aeba8a8977b57e40fcb77d1a7a28b26cba62591204'))
  })

  describe('hmac_sha1', function () {
    it('should return a hmac-sha1 encoded string', () => test('{{"hey" | hmac_sha1: "secret_key"}}', '2a3969bed25bfeefb00aca4063eb9590b4df8f0e'))
  })

  describe('base64', function () {
    it('should return a base64 encoded string', () => test('{{"blah" | base64}}', 'YmxhaA=='))
  })
})
