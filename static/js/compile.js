export { addElement, editElement, startup };
import { registerElement } from "./ui.js";
import { displayError } from "./error.js";

async function startup() {
  /*
  Populate the page from a saved file on startup
  */
  await fetch("/data",  {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Scope': '*'
    }
  }).then(response => {
    return response.json()
  }).then(data => {
    Object.entries(data).forEach(day => {
      let name = day[0];
      let entries = day[1];

      // Add a new container to the parent container for this day
      let parent = document.querySelector('.parent-container');
      parent.insertAdjacentHTML("beforeend", `<div class="container" id="${name}"></div>`);
      let new_obj = parent.lastElementChild;

      // Give the container a title
      new_obj.insertAdjacentHTML("beforeend", `<p class="day-title">${name}</p><br>`)

      // Then add all the day's elements into the new flexbox
      entries.forEach(row => {
        loadElementIntoHTML(row['id'], row['name'], row['start'], row['end'], row['color'], new_obj);
      })
    })
  })
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

  if (hours > 0) {  return `${hours}h${minutes}m`; }
  else { return `${minutes}m`; }
}

function createElementHTML(id, name, start, end, color) {
  let start_mins = string_to_mins(start);
  let end_mins = string_to_mins(end);
  let duration = end_mins - start_mins;

  let element = `
  <div class="item" style="--col:${color}; --f:${duration};" data-api-info="${name}\\${start}\\${end}\\${color}" id="${id}">
    <p class="heading">${name}</p>
    <div class="mono popup hover-popup">
      <p><b>${name}</b></p>
      <p>${start} - ${end}</p>
      <p>${format_mins(duration)}</p>
    </div>
  </div>`;
  return element;
}

async function addElement(name, start, end, color, day=null) {
  /*
  More general add-element which takes care of the entire process.
  Returns True is succesful, the error message otherwise.
  */

  if (day === null) {day = document.querySelector('.parent-container').lastElementChild.id}
  // Prompt backend with new info using fetch()
  var data = JSON.stringify({
    "name": name,
    "start": start,
    "end": end,
    "color": color
  });

  const response = await fetch("/add",  {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'File': day
    },
    body: data
  })

  if (response.status == 201) {
    // The first parameter is the ID that was passed to us by the backend
    loadElementIntoHTML(Number(await response.text()), name, start, end, color, document
      .querySelector('.parent-container').querySelector(`[id=\"${day}\"]`));

    return true
  } else {
    return (await response.text()) // return the erro so form.js can deal with it.
  }

}

function loadElementIntoHTML(id, name, start, end, color, container) {
  /*
  Add element HTML with the passed data to the correct container (i.e., day)
  */

  let element = createElementHTML(id, name, start, end, color);

  container.insertAdjacentHTML('beforeend', element);

  let new_elem = container.lastElementChild;
  registerElement(new_elem);
}

async function editElement(id, name, start, end, color, day) {
  var data = JSON.stringify({
    "id": id,
    "name": name,
    "start": start,
    "end": end,
    "color": color
  });
  await fetch("/edit",  {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'File': day
    },
    body: data
  })
  .then(async function(response) {
    if (response.status == 201) {
      // The first parameter is the ID that was passed to us by the backend
      editElementInHTML(id, name, start, end, color, document.querySelector('.parent-container').querySelector(`[id=\"${day}\"]`));

      // Set the start value to the current value of end - QoL.
      // TODO: reset to previous form content
      // TODO: remove `editing:x,y` from form
    } else {
      displayError(await response.text());
    }
  })}

function editElementInHTML(id, name, start, end, color, container) {
  /*
  Add element HTML with the passed data to the correct container (i.e., day)
  */

  let elementHTML = createElementHTML(id, name, start, end, color);
  let target = container.querySelector(`[id=\"${id}\"]`);

  target.outerHTML = elementHTML; // Update element HTML

  // We have to get this again bedcause we just changed it and our element is now out of date.
  target = container.querySelector(`[id=\"${id}\"]`);

  registerElement(target);
}