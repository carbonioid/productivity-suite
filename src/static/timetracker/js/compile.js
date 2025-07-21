/*
This file handles taking input form the server and compiling it to HTML.
It also handles adding, editing and deleting elements.
*/

export {  addElement, editElement, deleteElement, load, initialiseContainers, populateContent };
import {  format_mins, duration, dayOfWeek, getAllDays } from './utils.js'
import { format_yyyymmdd } from '../../general/js/utils.js';
import {  registerWeekCollapseIcon, displayError, getDisplayOptions } from "./ui.js";
import { registerPopup, registerContextMenu } from "../../general/js/popup.js"
import { registerEditing, registerAddToButton } from './form.js';
import { fetchDay, getDay, getAllEntryDates } from "./cache.js"
import { loadTemplate } from '../../general/js/template.js';

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

/* Load day containers */

function loadWeekContainer(date, parent) {
  // Load this object from its template
  let template = Object.assign(
    loadTemplate(document, 'week-container-template', {
      "formatted-date": format_yyyymmdd(date)
    }),
    {id: `week-${date}`} // Set the object's id
  )

  registerWeekCollapseIcon(template, template.querySelector('.week-collapse-icon'))

  parent.appendChild(template)
  
  return template.querySelector('.days')
}

function initialiseContainers(names) {
  names = names.reverse()

  const parent = document.querySelector('.parent-container');

  // Set week container
  let currentWeekContainer = null;
  if (dayOfWeek(names[0]) != 'Sunday') {
    currentWeekContainer = loadWeekContainer(names[0], parent)
  } // it will be set on the next iteration if the day is already sunday

  // Iterate through names and add appropriate containers
  names.forEach(name => {
    // Update week separator if relevant
    if (dayOfWeek(name) == 'Sunday') {
      currentWeekContainer = loadWeekContainer(name, parent)
    }

    // Load empty div
    const dayObject = document.createElement('div')
    dayObject.id = name;
    dayObject.classList.add('container')

    currentWeekContainer.appendChild(dayObject)
  })
}

/* Load day content */

function loadItem(id, name, start, end, color, container) {
  /*
  Add element HTML with the passed data to the correct container (i.e., day)
  */
  let _duration = duration(start, end);

  let template = loadTemplate(document, 'item-template', {
    "name": name,
    "start": start,
    "end": end,
    "duration": format_mins(_duration)
  })

  // Add properties
  template = Object.assign(template, 
    {
      id: id,
      style: `--col:${color}; --f:${_duration};`,
    }
  )
  template.setAttribute("data-api-info", `${name}\\${start}\\${end}\\${color}`)

  // Register listeners
  registerEditing(template);
  registerPopup(template, template.querySelector('.popup'))

  container.appendChild(template);
}

function loadPadItem(start, end, container) {
  /*
  Add a padding item to the specified table
  */
  let _duration = duration(start, end)

  // Load object from template
  let template = loadTemplate(document, 'pad-item-template', {
    "start": start, 
    "end": end,
    "duration": format_mins(_duration)
  })

  // Set properites
  template.setAttribute("style", `--f:${_duration};`)
  template.setAttribute("data-api-info", `${start}\\${end}`)

  registerPopup(template, template.querySelector('.popup'))
  container.appendChild(template)
}

function loadDayEntries(container, entries) {
  /*
  Load all the entries as formatted HTML into the given container,
  creating the entires based on the given `entries` JSON.
  */
  entries.forEach(row => {
    if (row['pad']) { 
      loadPadItem(row['start'], row['end'], container); }
    else { loadItem(row['id'], row['name'], row['start'], row['end'], row['color'], container); }
  })
}

function loadDayChart(canvas, entries) {
  if (Chart.getChart(canvas)) {
    Chart.getChart(canvas).destroy()
  }
  if (entries.length > 0) {
    // Now, the complex part: load the popup's pie chart (the canvas element)
    // The data is just the amount of time each color took.
    const dictionary = new Object();

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

function loadDayTitle(container, name, entries) {
  // Get day of the week
  let dayName = dayOfWeek(name);
  let formattedDay = format_yyyymmdd(name)

  let title = loadTemplate(document, 'day-title-template', {
    "formatted-date": formattedDay.split(' ')[0]
  })
  title.id = name

  // Create context menu
  const menu = title.querySelector('.context-menu')
  menu.appendChild(loadTemplate(document, 'day-title-menu-title-template', {
    "formatted-day": formattedDay,
    "day-of-week": dayName
  }))

  // Add main part of popup (only if there is data)
  if (entries.length > 0) {
    let body = loadTemplate(document, 'day-title-menu-body-template', {
      "woke": entries[0]['start'],
      "slept": entries[entries.length - 1]['end']
    })
    
    // Manage chart
    const chart = body.querySelector('canvas')
    chart.id = `chart-${name}`
    loadDayChart(chart, entries)

    menu.appendChild(body)
  }

  // Register listeners and load
  registerContextMenu(title.querySelector('.menu-button'), title.querySelector('.context-menu'))
  registerAddToButton(title.querySelector('.add-to-button'), name)

  container.appendChild(title)
}

function loadDay(container, name, entries) {
  /*
  This function loads the initial HTML (container, title, title popup) for any given day.
  The container is selected/made based on `name` (as the container's id)
  */  
  loadDayTitle(container, name, entries)
  loadDayEntries(container, entries)
}

async function load(name, reloadCache) {
  /*
  Load the day with id `name` with or without refreshing the cache, depending on `reloadCache`
  */
  const container = document.getElementById(name)

  let entries = reloadCache ? await fetchDay(name) : getDay(name) // fetchDay() clears the cache and getDay doesn't
  entries = getDisplayOptions()['rigid-mode'] ? addEntryPadding(entries) : entries // show or don't show untracked time depending on rigid mode

  container.innerHTML = ''; // Clear previous content because we are replacing it
  loadDay(container, name, entries)
}

function populateContent() {
  /*
  Load page content from cache. Assumes cache has already been initialised with populateCache()
  */
  const container = document.querySelector('.parent-container')
  container.innerHTML = ''

  const dates = getAllEntryDates()
  initialiseContainers(dates) // Create containers
  dates.forEach(date => { load(date, false) }) // Create elements themselves, but do not reload cache    

  if (dates.length === 1 && getDay(names[0]).length === 0) {
      showEmptyMessage(container, "No data", "You haven't added any data yet. Use the form at the top to get started.") // Show empty message if no entries exist
  }
}

/* Query API and reload days */

async function addElement(name, start, end, color, day) {
  /*
  More general add-element which takes care of the entire process.
  Returns True if succesful, the error message otherwise.
  */

  if (day == undefined) {day = getAllDays()[0].id}

  // Prompt backend with new info using fetch()
  var data = JSON.stringify({
    "name": name,
    "start": start,
    "end": end,
    "color": color
  });

  const response = await fetch("/timetracker/add",  {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'File': day
    },
    body: data
  })

  if (response.status == 201) {
    // Update this change by re-loading the day we just added to 
    await load(day, true)

    return true
  } else {
    return (await response.text()) // return the error so form.js can deal with it.
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
  await fetch("/timetracker/edit",  {
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
      await load(day, true)
    } else {
      displayError(await response.text());
    }
  })
}

async function deleteElement(id, day) {
  var data = JSON.stringify({
    "id": id,
  });
  await fetch("/timetracker/delete",  {
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
      await load(day, true)
  } else {
      displayError(await response.text());
    }
  })
}
