/*
This file handles the main UI of the page, except the form. That is managed by form.js and some of its functionality is impoted here.
*/

export { showOthers, displayError, setCompact, setDisplayOptionsFromCookie,
   addCheckboxListeners, registerWeekCollapseIcon, getDisplayOptions }
import { load, populateContent } from "./compile.js"
import { getCookies, getAllDays } from "./utils.js"

/*
Error displaying
*/

function displayError(msg) {
  let errorbox = document.querySelector(".errorbox")

  console.log(`Receieved error: ${msg}`);
  errorbox.classList.remove("hidden")
  errorbox.textContent = msg;

  setTimeout(() => {
    errorbox.classList.add("hidden");
    errorbox.textContent = "";
  }, 4500)
}

/* 
These functions add event listeners
*/
function registerWeekCollapseIcon(parent, button) {
  const days = parent.querySelector('.days')
  button.addEventListener('click', (event) => {
    // Set the overflow to hidden while the animation rolls up
    if (!parent.classList.contains('collapsed')) {
      parent.querySelector('.days').style.overflow = 'hidden'
    }

    // Toggle rotation
    parent.classList.toggle("collapsed");

    // Save status in cookie
    const status = parent.classList.contains('collapsed') ? 'closed' : 'open'
    document.cookie = `${parent.id}=${status}`
  })

  // Remove this once the animation has rolled down so that popups are visible
  days.addEventListener('transitionend', () => {
    if (!parent.classList.contains('collapsed')) {
      parent.querySelector('.days').style.overflow = ''
    }
  })

  // Respect saved status (in cookie)
  const savedValue = getCookies()[parent.id]
  if (savedValue == 'closed') {
    button.dispatchEvent(new Event('click'))
  }
}

/*
These are the options and functions for the checkboxes that edit the display
of the days themselves. These are also used by run.js to make sure anything saved in these
checkboxes is taken into account on refresh. These functions are added as onclick listeners
to the checkboxes.
*/
function showOthers() {
  const hidden = getDisplayOptions()['show-others']
  const parent = document.querySelector('.parent-container')

  if (hidden) { parent.classList.add("hide-others"); }
  else        { parent.classList.remove("hide-others"); }
}

function setCompact() {
  let compact = getDisplayOptions()['compact-mode']
  if (compact) { document.body.classList.add("padding-on"); }
  else        { document.body.classList.remove("padding-on"); }
}

function getDisplayOptions() {
  return {
    'show-others': document.querySelector('#show-others').classList.contains('switched'),
    'compact-mode': document.querySelector('#compact-mode').classList.contains('switched'),
    'rigid-mode': document.querySelector('#rigid-mode').classList.contains('switched')
  }
}

function setDisplayOptionsFromCookie() {
  const cookies = getCookies()
  Object.entries(cookies).forEach(pair => {
    let name = pair[0]
    if (name.startsWith('display')) {
      const referencedItem = document.getElementById(name.split('display-')[1])
      if (referencedItem && (pair[1] == 'true')) {
        referencedItem.classList.add('switched')
      }
    }
  })
}

function addCheckboxListeners() {
  document.querySelector('#show-others').addEventListener('click', (event) => {
    const hidden = getDisplayOptions()['show-others']
    showOthers();
    document.cookie = `display-show-others=${hidden}`
  })

  document.querySelector('#compact-mode').addEventListener('click', (event) => {
    const compact = getDisplayOptions()['compact-mode']
    setCompact();
    document.cookie = `display-compact-mode=${compact}`
  })

  document.querySelector('#rigid-mode').addEventListener('click', (event) => {
    const rigid = getDisplayOptions()['rigid-mode']
    populateContent(); // reload page content
    document.cookie = `display-rigid-mode=${rigid}`
  })
}
