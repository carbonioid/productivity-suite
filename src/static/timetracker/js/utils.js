export { format_mins, duration, string_to_mins, dayOfWeek, parseElementApiInfo, getAllDays }

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

function parseElementApiInfo(element) {
  /*
  Parse the `data-api-info` parameter of an HTML object into a computer-readable JSON format.
  */
  let id = element.id;
  let data = element.getAttribute('data-api-info').split('\\');
  let name = data[0];
  let start = data[1];
  let end = data[2];
  let color = data[3];

  return {
    "pad": false,
    "id": id,
    "name": name,
    "start": start,
    "end": end,
    "color": color
  }
}

function getAllDays() {
  return Array.from(document.querySelectorAll('.container'))
}
