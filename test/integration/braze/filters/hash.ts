import { test } from '../../../stub/render'

describe('braze/filters/hash', function () {
  describe('property_accessor', function () {
    it('should return value by key', () => test('{{obj | property_accessor: "foo"}}', 'bar'))
  })
})
