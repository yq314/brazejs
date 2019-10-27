import { test } from '../../../stub/render'

describe('braze/filters/url', function () {
  describe('url_escape', function () {
    it('should encode special characters', () => test('{{"hey<>hi" | url_escape}}', 'hey%3C%3Ehi'))
  })

  describe('url_param_escape', function () {
    it('should decode special characters', () => test('{{"hey<&>hi"} | url_param_escape}}', 'hey%3C%26%3Ehi'))
  })
})
