export { format_yyyymmdd, yyyymmdd_to_date, date_to_yyyymmdd, format_date }

function format_yyyymmdd(string, includeYear) {
  let [year, month, day] = string.split('-');
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString(undefined, {
    'month': 'short',
    'day': '2-digit'
  })
}

function yyyymmdd_to_date(string) {
  let [year, month, day] = string.split('-');
  return new Date(year, month - 1, day);
}

function date_to_yyyymmdd(date) {
  return date.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function format_date(date, format) {
  const typeDict = {
    "long": [true, true, true],
    "medium": [false, true, true],
    "short": [false, false, true]
  }

  let options = {}
  let [year, month, day] = typeDict[format] || [true, true, true];
  if (year) {options.year = 'numeric'}
  if (month) {options.month = 'short'}
  if (day) {options.day = '2-digit'}

  return date.toLocaleDateString(undefined, options)
}
