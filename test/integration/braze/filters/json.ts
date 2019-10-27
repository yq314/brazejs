import { test } from '../../../stub/render'

describe('braze/filters/json', function () {
  describe('json_escape', function () {
    it('should escape double quote', () => test(`{{'123"456' | json_escape}}`, '123\\"456'))
  })
})
