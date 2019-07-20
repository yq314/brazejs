import strftime from '../../util/strftime'
import { isString } from '../../util/underscore'

export default {
  'date': (v: string | Date, arg: string) => {
    let date = v
    if (v === 'now') {
      date = new Date()
    } else if (!isNaN(Number(v))) {
      date = toUTCDate(new Date(Number(v) * 1000))
    } else if (isString(v)) {
      date = new Date(v)
    }
    return isValidDate(date) ? strftime(date, arg) : v
  }
}

function toUTCDate (date: Date): Date {
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  )
}

function isValidDate (date: any): date is Date {
  return date instanceof Date && !isNaN(date.getTime())
}
