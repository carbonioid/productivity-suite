export { format_yyyymmdd, yyyymmdd_to_date, date_to_yyyymmdd, format_date, getCookies }

function getCookies() {
  const cookies = {};
  const cookieString = document.cookie;
  if (cookieString) {
    const cookieArray = cookieString.split('; ');
    for (let i = 0; i < cookieArray.length; i++) {
      const cookie = cookieArray[i].split('=');
      cookies[decodeURIComponent(cookie[0])] = decodeURIComponent(cookie[1]);
    }
  }
  return cookies;
}

function format_yyyymmdd(string, includeYear) {
  let [year, month, day] = string.split('-');
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString(undefined, {
    'month': 'short',
    'day': 'numeric'
  })
}

function yyyymmdd_to_date(string) {
  if (typeof string !== 'string') {
    throw Error("String object not provided to yyyymmdd_to_date")
  }
  let [year, month, day] = string.split('-');
  return new Date(year, month - 1, day);
}

function date_to_yyyymmdd(date) {
  if (!(date instanceof Date)) {
    throw Error("Date object not provided to date_to_yyyymmdd")
  }

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
  if (day) {options.day = 'numeric'}

  return date.toLocaleDateString(undefined, options)
}
