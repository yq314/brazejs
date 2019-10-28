import { test } from '../../../stub/render'

describe('braze/filters/number', function () {
  describe('number_with_delimiter', function () {
    it('should return a number formatted with commas', () => test('{{123456 | number_with_delimiter}}', '123,456'))
    it('should return a number formatted with commas', () => test('{{1234 | number_with_delimiter}}', '1,234'))
    it('should return a number with no commas', () => test('{{123 | number_with_delimiter}}', '123'))
    it('should return a float formatted with commas', () => test('{{123456.78 | number_with_delimiter}}', '123,456.78'))
    it('should return a float with 3 decimal places formatted with commas', () => test('{{123456.789 | number_with_delimiter}}', '123,456.789'))
  })
})
