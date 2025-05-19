/*
This file handles the main UI of the page, except the form. That is managed by form.js and some of its functionality is impoted here.
*/

export { registerPopup, registerEditing, setCompact, setRigidity, showOthers, displayError,
   addCheckboxListeners, registerContextMenu, registerWeekCollapseIcon, getDisplayOptions }
import { registerEditing } from "./form.js"
import { loadDayChart } from "./compile.js"
import { getCookies, getEntriesFromDays } from "./utils.js"


function getAllDays() {
  let days = [];
  Array.from(document.querySelector('.parent-container').children).forEach(week => {
    days = [...days, ...Array.from(week.querySelector('.days').children)] // slice(1) so that we don't include the title
  })

  return days;
}

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
These are the options and functions that add event listeners
*/

function setPopupPosition(popup, mouseX, mouseY) {
  // Adjust the popup position so it follows the cursor
  // You might want to add some offset to prevent overlap
  popup.style.left = mouseX + 1 + 'px'; // Add 10px offset to the right
  popup.style.top = mouseY + 1 + 'px';  // Add 10px offset to the bottom

  // Keep the popup within the viewport
  const popupWidth = popup.offsetWidth;
  const popupHeight = popup.offsetHeight;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  if (mouseX + popupWidth > windowWidth) {
    popup.style.left = mouseX - popupWidth - 1 + 'px'; // Move to the left
  }

  if (mouseY + popupHeight > windowHeight) {
    popup.style.top = mouseY - popupHeight - 1 + 'px';   // Move upwards
  }
}

function registerPopup(parent, popup) {
  /*
  Register the correct event listeners for this object's popup (with class .popup).
  */
  parent.addEventListener('mouseenter', () => {
    popup.style.display = 'block';
  });

  parent.addEventListener('mouseleave', () => {
    popup.style.display = 'none';
  })

  parent.addEventListener('mousemove', (event) => {
    // Get the coordinates of the mouse relative to the viewport
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    setPopupPosition(popup, mouseX, mouseY);
  })
}

function registerContextMenu(button, popup) {
  button.addEventListener('click', (event) => {
    // Toggle whether hidden
    popup.classList.toggle("hidden");
    popup.classList.toggle("soft-hidden");
  })

  document.addEventListener('click', (event) => {
    // Check if the target is `button` or a child of `button`. If not, make this popup disappear.
    if (!button.contains(event.target) && !popup.contains(event.target)) {
      popup.classList.add("soft-hidden");
      popup.classList.add("hidden");
    }
  })
}

function registerWeekCollapseIcon(parent, button) {
  const days = parent.querySelector('.days')
  button.addEventListener('click', (event) => {
    // Set the overflow to hidden while the animation rolls up
    if (!parent.classList.contains('collapsed')) {
      parent.querySelector('.days').style.overflow = 'hidden'
    }

    // Toggle rotation
    parent.classList.toggle("collapsed");
    button.classList.toggle("rotated");

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

  // First, hide all week containers.
  let weeks = parent.children
  weeks = Array.from(weeks); // Do not include first element
  weeks.forEach(week => {
    if (hidden) { week.classList.add("hidden"); }
    else        { week.classList.remove("hidden"); }
  })

  if (hidden) {
      // Then, find the first day and move that to a different location where it can be seen
    parent.appendChild(getAllDays()[0])
  } else {
    // If we are unhiding, there are two conditions:
    // (1) either this is on load, and there is no element to move back,
    // (2) or we are unchecking the hidden option, and we need to move an item back
    let toMove = parent.lastElementChild;
    let moveTo = parent.firstElementChild.querySelector('.days');
    if (toMove.classList.contains('container')) { // If the first item is a day, we need to move it back
      moveTo.prepend(toMove)
    }
  }
}

function setCompact(obj) {
  let compact = getDisplayOptions()['compact-mode']
  if (compact) { obj.classList.remove("padded-container"); }
  else             { obj.classList.add("padded-container"); }
}

function setRigidity(obj) {
  let rigid = getDisplayOptions()['rigid-mode']
  Array.from(obj.children).forEach(item => {
    if (item.classList.contains("pad-item")) { // We only do this for padding items
      if (rigid) { item.classList.remove("hidden"); }
      else { item.classList.add("hidden"); }
    }
  })

  // Reload the chart to show/not show the rigid (white) data
  const chart = document.getElementById(`chart-${obj.id}`)
  const chartJsObject = Chart.getChart(chart)
  if (chartJsObject) {
    chartJsObject.destroy() // Destroy current chart instance
  }

  loadDayChart(chart, getEntriesFromDays(obj))
}

function getDisplayOptions() {
  return {
    'show-others': document.querySelector('#show-others').checked,
    'compact-mode': document.querySelector('#compact-mode').checked,
    'rigid-mode': document.querySelector('#rigid-mode').checked
  }
}

function addCheckboxListeners() {
  document.querySelector('#show-others').addEventListener('click', (event) => { 
    showOthers(); 
  })

  document.querySelector('#compact-mode').addEventListener('click', (event) => {
    getAllDays().forEach(day => setCompact(day))
  })

  document.querySelector('#rigid-mode').addEventListener('click', (event) => {
    getAllDays().forEach(day => setRigidity(day))
  })
}
