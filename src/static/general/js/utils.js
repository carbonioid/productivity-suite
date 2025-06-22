export { format_yyyymmdd }

function format_yyyymmdd(string, includeYear) {
    let [year, month, day] = string.split('-');
    // We ignore the year for now
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "June",
      "July", "Aug", "Sept", "Oct", "Nov", "Dec"
    ];
    month = months[Number(month)-1]
    return includeYear ? `${Number(day)} ${month} ${year}` : `${Number(day)} ${month}`
}
  