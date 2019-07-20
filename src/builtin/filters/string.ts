import * as _ from '../../../src/util/underscore'

export default {
  'append': (v: string, arg: string) => v + arg,
  'prepend': (v: string, arg: string) => arg + v,
  'capitalize': (str: string) => _.stringify(str).charAt(0).toUpperCase() + str.slice(1),
  'lstrip': (v: string) => _.stringify(v).replace(/^\s+/, ''),
  'downcase': (v: string) => _.stringify(v).toLowerCase(),
  'upcase': (str: string) => _.stringify(str).toUpperCase(),
  'remove': (v: string, arg: string) => v.split(arg).join(''),
  'remove_first': (v: string, l: string) => v.replace(l, ''),
  'replace': (v: string, pattern: string, replacement: string) =>
    _.stringify(v).split(pattern).join(replacement),
  'replace_first': (v: string, arg1: string, arg2: string) => _.stringify(v).replace(arg1, arg2),
  'rstrip': (str: string) => _.stringify(str).replace(/\s+$/, ''),
  'split': (v: string, arg: string) => _.stringify(v).split(arg),
  'strip': (v: string) => _.stringify(v).trim(),
  'strip_newlines': (v: string) => _.stringify(v).replace(/\n/g, ''),
  'truncate': (v: string, l: number = 50, o: string = '...') => {
    v = _.stringify(v)
    if (v.length <= l) return v
    return v.substr(0, l - o.length) + o
  },
  'truncatewords': (v: string, l: number = 15, o: string = '...') => {
    const arr = v.split(/\s+/)
    let ret = arr.slice(0, l).join(' ')
    if (arr.length >= l) ret += o
    return ret
  }
}
