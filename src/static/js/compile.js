/*
This file handles taking input form the server and compiling it to HTML.
It also handles adding, editing and deleting elements.
*/

export { addElement, editElement, deleteElement, load, initialiseContainers, loadDayChart };
import { registerEditing, registerPopup, setCompact, setRigidity, displayError, showOthers, 
  registerContextMenu, registerWeekCollapseIcon, getDisplayOptions} from "./ui.js";
import { format_mins, format_yyyymmdd, string_to_mins, duration, dayOfWeek, parseElementApiInfo } from './utils.js'

function addEntryPadding(entries) {
  /*
  Adds padding items (untracked time) to a list of entries.
  e.g. if one activity ends at 10:30 and the next one starts at 10:50, this
  program will add a "padding element" from 10:30 to 10:50.
  This takes a single list of entries (a single day)
  */
  let new_entries = [];
  if (entries.length > 0) {
    let prev_end = entries[0]['start']
    entries.forEach(row => {
      if (prev_end !== row['start']) {
        new_entries.push({
          "pad": true,
          "start": prev_end,
          "end": row['start']
        })
      }

      new_entries.push({
        "pad": false,
        ...row
      })
      prev_end = row['end']
    })
  }

  return new_entries
}

async function initialiseContainers() {
  await fetch("/data", {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Scope': '*'
    }
  }).then(response => {
    return response.json()
  }).then(data => {
    let days = [...Object.entries(data)].reverse();

    const parent = document.querySelector('.parent-container');

    // Set week container
    let currentWeekContainer = null;
    if (dayOfWeek(days[0][0]) != 'Sunday') {
      currentWeekContainer = loadWeekContainer(days[0][0], parent)
    } // it will be set on the next iteration if the day is already sunday

    // This syntactic mess reverses the object
    days.forEach(day => {
      let name = day[0];

      // Update week separator if relevant
      if (dayOfWeek(name) == 'Sunday') {
        currentWeekContainer = loadWeekContainer(name, parent)
      }

      const dayObject = document.createElement('div')
      dayObject.id = name;

      currentWeekContainer.appendChild(dayObject)
    })
  })
}

function loadItem(id, name, start, end, color, container) {
  /*
  Add element HTML with the passed data to the correct container (i.e., day)
  */
  let _duration = duration(start, end);

  let html = `
  <div class="item" style="--col:${color}; --f:${_duration};" data-api-info="${name}\\${start}\\${end}\\${color}" id="${id}">
    <p class="heading">${name}</p>
    <div class="mono popup hover-popup">
      <p><b>${name}</b></p>
      <p>${start} - ${end}</p>
      <p>${format_mins(_duration)}</p>
    </div>
  </div>`;

  container.insertAdjacentHTML('beforeend', html);

  let new_elem = container.lastElementChild;
  registerEditing(new_elem);
  registerPopup(new_elem, new_elem.querySelector('.popup'));
}

function loadPadItem(start, end, container) {
  /*
  Add a padding item to the specified table
  */
  let start_mins = string_to_mins(start);
  let end_mins = string_to_mins(end);
  let duration = end_mins - start_mins;

  let html = `
  <div class="pad-item hidden" style="--f:${duration};" data-api-info="${start}\\${end}">
    <div class="mono popup">
      <p>${start} - ${end}</p>
      <p>${format_mins(duration)}</p>
    </div>
  </div>`;

  container.insertAdjacentHTML('beforeend', html);

  let new_elem = container.lastElementChild;
  registerPopup(new_elem, new_elem.querySelector('.popup'));
}

function loadDayEntries(entries, container) {
  /*
  Load all the entries as formatted HTML into the given container,
  creating the entires based on the given `entries` JSON.
  */
  let padded_entries = addEntryPadding(entries)
  padded_entries.forEach(row => {
    if (row['pad']) { loadPadItem(row['start'], row['end'], container); }
    else { loadItem(row['id'], row['name'], row['start'], row['end'], row['color'], container); }
  })
}

function loadDayChart(canvas, entries) {
  if (entries.length > 0) {
    // Now, the complex part: load the popup's pie chart (the canvas element)
    // The data is just the amount of time each color took.
    const dictionary = new Object();

    if (getDisplayOptions()['rigid-mode']) {
      entries = addEntryPadding(entries); // We want to count untracked/padded time as well if rigid mode is enabled
    }

    entries.forEach(row => {
      let _duration = duration(row['start'], row['end'])
      let color = row['pad'] ? '255, 255, 255' : row['color'] // Untracked/padded time is just white

      // Then, add this duration to the appropriate place in the dictionary
      if (dictionary[color] == null) { dictionary[color] = _duration }
      else { dictionary[color] = dictionary[color] + _duration }
    })

    let data = Object.values(dictionary)
    let colors = Object.keys(dictionary).map(color => {
      return `rgb(${color})`
    })

    const dataTotal = data.reduce((a, b) => a + b); // sum values
    
    new Chart(canvas.getContext('2d'), {
      type: 'pie',
      data: {
        labels: colors,
        datasets: [{
          label: `${name}`,
          data: data,
          backgroundColor: colors,
          hoverOffset: 0
        }]
      },
      options: {
        responsive: false, // Ensure the size is fixed
        maintainAspectRatio: false,
        animation: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            displayColors: false,
            backgroundColor: "rgb(192, 192, 192)",
            cornerRadius: 0,
            borderColor: "#ccc",
            borderWidth: 1,
            bodyFont: {
              family: `font-family: Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`,
            },
            callbacks: {
              label: function (context) {
                // e.g. 1h1m (50%)
                return `${format_mins(context.formattedValue)} (${(100 * Number(context.formattedValue) / dataTotal).toFixed(0)}%)`;
              },
              title: () => { return '' }
            }
          }
        }
      }
    });
  }
}

function loadDay(name, entries) {
  /*
  This function loads the initial HTML (container, title, title popup) for any given day.
  The container is selected/made based on `name` (as the container's id)
  */
  // Get day of the week
  let dayName = dayOfWeek(name);

  // Create popup body
  let popup_body = `
  <p><b>${format_yyyymmdd(name)}</b></p>
  <p>${dayName}</p>`;

  if (entries.length > 0) {
    popup_body += `<br><canvas id="chart-${name}" width="100" height="100"></canvas>`

    let wokeAt = entries[0]['start'];
    popup_body += `<br>Woke at <b>${wokeAt}</b><br>`

    let sleptAt = entries[entries.length - 1]['end'];
    popup_body += `Slept at <b>${sleptAt}</b><br>`
  }

  // Create classes
  let classes = "container";
  if (!document.querySelector('#compact-mode').checked) {classes += " padded-container"}

  // Create HTML
  let initial_html = `<div class="${classes}" id="${name}">
    <div class="day-title">
    <img src="/static/img/menu.png" width="12px" height="12px" class="menu-button">
    <p class="title">${format_yyyymmdd(name)}</p>
    <div class="mono context-menu hidden soft-hidden">
      ${popup_body}
    </div>
    </div>
  </div>`;

  // Add initial HTML (This code assumes the container already exists)
  let target_obj = document.getElementById(name);
  target_obj.outerHTML = initial_html;
  target_obj = document.getElementById(name) // Reselect to reflect changes - otherwise listeners aren't added properly
  registerContextMenu(target_obj.firstElementChild.querySelector('.menu-button'), target_obj.firstElementChild.querySelector('.context-menu'))
  if (entries.length > 0) {
    loadDayChart(document.getElementById(`chart-${name}`), entries)
  }
}

function loadWeekContainer(date, parent) {
  parent.insertAdjacentHTML("beforeend", `<div class="week-container" id="week-${date}"><div class="week-separator">Week ending ${format_yyyymmdd(date)}<img src="/static/img/arrow.png" width="12px" height="12px" class="week-collapse-icon rotated"></div><div class="days"></div></div>`)
  parent = document.querySelector('.parent-container'); // Reselect to reflect changes

  registerWeekCollapseIcon(parent.lastElementChild, parent.lastElementChild.querySelector('.week-collapse-icon'));

  return parent.lastElementChild.querySelector('.days'); // Return week container
}

async function load(scope) {
  /*
  Populate parts of the page from the given scope.
  */
  await fetch("/data", {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Scope': scope
    }
  }).then(response => {
    return response.json()
  }).then(data => {
    let days = [...Object.entries(data)].reverse();

    const parent = document.querySelector('.parent-container');

    // This syntactic mess reverses the object
    days.forEach(day => {
      let name = day[0];
      let entries = day[1];

      // Add a new container to the parent container for this day, as well as the title and its popup
      loadDay(name, entries);

      // Then add all the day's elements (from the given entries) into the new flexbox.
      let container = document.getElementById(name);
      loadDayEntries(entries, container)

      // These change the display of rigid items and the element's padding respectively, to reflect user choices
      setRigidity(container)
      setCompact(container)
    })
  })
}

async function addElement(name, start, end, color, day=null) {
  /*
  More general add-element which takes care of the entire process.
  Returns True is succesful, the error message otherwise.
  */

  if (day === null) {day = Array.from(document.querySelector('.parent-container').firstElementChild.children)[1].firstElementChild.id}

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
    // Update this change by re-loading the day we just added to
    load(day)

    return true
  } else {
    return (await response.text()) // return the erro so form.js can deal with it.
  }
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
      // Update this change by re-loading the day we just edited
      load(day)
    } else {
      displayError(await response.text());
    }
  })
}

async function deleteElement(id, day) {
  var data = JSON.stringify({
    "id": id,
  });
  await fetch("/delete",  {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'File': day
    },
    body: data
  })
  .then(async function(response) {
    if (response.status == 201) {
      // Update this change by re-loading the day we just edited
      load(day)
    } else {
      displayError(await response.text());
    }
  })
}
