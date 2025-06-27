export { format_yyyymmdd }

function format_yyyymmdd(string, includeYear) {
  let [year, month, day] = string.split('-');
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString(undefined, {
    'month': 'short',
    'day': '2-digit'
  })
}
