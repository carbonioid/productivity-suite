export { format_mins, format_yyyymmdd, duration, string_to_mins, dayOfWeek }

function format_yyyymmdd(string) {
  let [year, month, day] = string.split('-');
  // We ignore the year for now
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "June",
    "July", "Aug", "Sept", "Oct", "Nov", "Dec"
  ];
  month = months[Number(month)]
  return `${Number(day)} ${month}`
}

function string_to_mins(s) {
  let parts = s.split(":");
  let hours = Number(parts[0]);
  let mins = Number(parts[1]);

  return hours * 60 + mins;
}

function format_mins(mins) {
  let hours = Math.floor(mins / 60);
  let minutes = mins % 60;

  if (hours > 0 && minutes > 0) {  return `${hours}h${minutes}m`; }
  else if (hours > 0 && minutes == 0) { return `${hours}h`; }
  else { return `${minutes}m`; }
}

function duration(start, end) {
  let start_mins = string_to_mins(start);
  let end_mins = string_to_mins(end);
  return end_mins - start_mins;
}

function dayOfWeek(date) {
  /* Takes YYYY-MM-DD date and returns day of week */
  let dateObject = new Date(date);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dateObject.getDay()];
}