import { test } from '../../../stub/render'

describe('filters/date', function () {
  it('should create a new Date when given "now"', function () {
    return test('{{ "now" | date: "%Y"}}', (new Date()).getFullYear().toString())
  })
  it('should parse as Date when given UTC string', function () {
    return test('{{ "1991-02-22T00:00:00" | date: "%Y"}}', '1991')
  })
  it('should render string as string if not valid', function () {
    return test('{{ "foo" | date: "%Y"}}', 'foo')
  })
  it('should render object as string if not valid', function () {
    return test('{{ obj | date: "%Y"}}', '{"foo":"bar"}')
  })
  it('should convert to epoch timestamp', function () {
    return test('{{ "2019-05-18T10:30:00" | date: "%s" }}', '1558175400')
  })
  it('should convert from epoch timestamp', function () {
    return test('{{ 1558175400 | date: "%Y-%m-%dT%H:%M:%S" }}', '2019-05-18T10:30:00')
  })
  it('should convert from epoch timestamp in string format', function () {
    return test('{{ "1558175400" | date: "%Y-%m-%dT%H:%M:%S" }}', '2019-05-18T10:30:00')
  })
  it('should support %c correctly', function () {
    return test('{{ "2019-05-18T10:30:00" | date: "%c" }}', 'Sat May 18 10:30:00 2019')
  })
})
