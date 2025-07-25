/*
This file handles the main form of the page. Some functionality is exported to ui.js
*/
export { addDayEditIndicator, exitEditMode, enterEditMode, detectColor, setFormContent, getFormContent,
          submitForm, startAddingTo }
import { addElement, editElement, deleteElement } from "./compile.js";
import { hideEmptyMessage } from "../../general/js/messages.js";
import { parseElementApiInfo } from "./utils.js";
import { getDay } from "./cache.js";
import { date_to_yyyymmdd, format_yyyymmdd } from "../../general/js/utils.js";

// "dictionary" of colors for different bits of text
let colors = [
  ["psych", "141, 96, 191"],
  ["eng", "127, 210, 81"],
  ["ict", "115, 191, 250"],
  ["phys", "219, 43, 78"],
  ["chem", "250, 159, 78"],
  ["project", "241, 154, 200"],
  ["code", "242, 207, 31"],
  ["coding", "242, 207, 31"],
  ["social", "18, 72, 161"],
  ["discord", "18, 72, 161"]
];

// Choose color based on text content
function detectColor(text) {
  for (const c of colors) {
    if (text.toLowerCase().includes(c[0])) {
      return c[1]
    }
  }

  return "220,220,220";
}

/*
Functions for getting and setting main form content - used exclusively by this file.
*/
function getFormContent() {
  let form = document.querySelector(".form-body");
  let name = form.querySelector('#name').value;
  let start = form.querySelector('#start').value;
  let end = form.querySelector('#end').value;

  // Figure out which radio button is selected)
  let color = "0,0,0"
  Array.from(document.querySelector(".tag-select").children).forEach(button => {
    // If radio button checked
    if (button.checked) {
      color = window.getComputedStyle(button).getPropertyValue('--col');
    }
  })

  return [name, start, end, color];
}

function setFormContent(name, start, end, color) {
  /*
  Set the main form's content to these values. Any values which are null will be ignored and not set.
  */
  let form = document.querySelector(".form-body");
  if (name !== null) { form.querySelector('#name').value = name; }
  if (start !== null) { form.querySelector('#start').value = start; }
  if (end !== null) { form.querySelector('#end').value = end; }
  if (color !== null) {
    Array.from(document.querySelector(".tag-select").children).forEach(button => {
      // If radio button checked
      if (window.getComputedStyle(button).getPropertyValue('--col') == color) {
        button.checked = true;
      }
    })
  }
}

async function submitForm() {
  /*
  This function handles form submission and has two modes:
  - If the data-mode attribute of the form is `add`, it simply adds the element to the DOM and queries the server to add it to the DB.
  - If the data-mdoe attribute of the form is `edit:name,id`, it edits this element and sends that request to the server
  */
  let form = document.querySelector('.form-body');

  let [name, start, end, color] = getFormContent(); // Get current form content

  // If add mode, simply add content
  if (form.getAttribute('data-mode') == 'add') { 
    let params = new URLSearchParams(document.location.search);
    let date = params.get("date"); // Will default to null, which addElement supports.

    let outcome = await addElement(name, start, end, color, date);

    if (outcome === true) {
      hideEmptyMessage(document.querySelector('.parent-container')); // Hide empty message, if it exists (because content now exists in the page)

      // Set the start value to the current value of end - QoL.
      setFormContent('', end, '', '220, 220, 220');
      document.querySelector('#start').dataset.auto = true; // The "auto" property trackers whether the info here has been automatically set

      // Refocus form to add next thing
      form.querySelector('#name').focus()
    } else {
      // It was unsuccessful, display error
      displayError(outcome);
    }
  } 
  // Otherwise (editing mode), get the editing info and edit the data on the serverside, then reset the previous content of the form from the data-mode attribute.
  else {
    // Edit the element on the serverside - this section involves parsing the data-mode attribute.
    let editing_info = form.getAttribute('data-mode').split(';')[1].split('\\');
    let day_name = editing_info[0];
    let id = editing_info[1];

    if (name !== "") {
      await editElement(id, name, start, end, color, day_name);
    } else { // Delete the element if "name" field is blank.
      await deleteElement(id, day_name);
    }

    exitEditMode();
  }
}

function addDayEditIndicator(date) {
  const indicator = document.querySelector('#day-editing-indicator')

  indicator.classList.remove("hidden")
  indicator.querySelector('.name-value').textContent = format_yyyymmdd(date)
}

/*
Functions concerning editing, mainly used by listeners.js
These mostly add indicators and restore content to the main form.
*/
function exitEditMode() {
  // Restore the form content from the data-mode info. Used when editing is exited to get back form content from before it was created.
  // Set back the previous content
  let form = document.querySelector('.form-body');
  let prevContent = form.getAttribute('data-mode').split(';')[3].split('\\');

  let name = prevContent[0];
  let end = prevContent[2];
  let color = prevContent[3];

  // If the start property was set automatically (and we just edited the last item) we want to set
  // the start time to that, not the past one for QoL.
  let start = null;
  if (document.querySelector('#start').dataset.auto === 'true') {
    const dayName = form.getAttribute('data-mode').split(';')[1].split('\\')[0]
    const day = getDay(dayName)
    let lastItem = day[day.length - 1]

    if (lastItem) {
      start = lastItem.end
    } else {
      start = '';
    }
  } else { // Otherwise (if the user inputted that start time manually) do it normally.
    start = prevContent[1];
  }

  setFormContent(name, start, end, color);

  // Hide the editing indicator
  document.querySelector('#editing-indicator').classList.add("hidden")

  // Exit edit mode in the form attributes.
  form.setAttribute('data-mode', `add`);
}

function enterEditMode(itemObject) {
  // Parse data-api-info atrribute to get appropriate data
  let [_, id, name, start, end, color] = Object.values(parseElementApiInfo(itemObject))

  // Populate the input section with the editing data with this info and save copies of it
  let form = document.querySelector('.form-body');

  // Explanation for this:
  // If we are already editing the form, we do not want to go back to that content. If we were to do so,
  // consider the case where we are editing an element and switch to another:
  // once we finish editing that, the data that that is restored is is the
  // info of the FIRST element we were editing.
  // Therefore, if we are already in edit mode, we should not change the prev; property in data-mode
  // this saves the content before *any* editing not just the most recent one.
  let [tmpName, tmpStart, tmpEnd, tmpColor] = [null, null, null, null];
  if (form.getAttribute('data-mode').startsWith('add')) {
    [tmpName, tmpStart, tmpEnd, tmpColor] = getFormContent();
  } else {
    let prevContent = form.getAttribute('data-mode').split(';')[3].split('\\');

    [tmpName, tmpStart, tmpEnd, tmpColor] = prevContent;
  }
  setFormContent(name, start, end, color);

  // Set the appropriate mode, which saves the info about which item we are editing and the previous form content (so we can set it back)
  let day_name = itemObject.parentNode.id;
  form.setAttribute('data-mode', `edit;${day_name}\\${id};prev;${tmpName}\\${tmpStart}\\${tmpEnd}\\${tmpColor}`);

  // Activate the editing indicator
  const indicator = document.querySelector('#editing-indicator')
  indicator.classList.remove("hidden")
  indicator.querySelector('.name-value').textContent = name

  form.querySelector('#name').focus()
}

function startAddingTo(date) {
  const indicator = document.querySelector('#day-editing-indicator')

  const currentDate = date_to_yyyymmdd(new Date())

    if (date === currentDate) {
      // Clear the ?date param as this is the current day and needs no such declaration
      const url = new URL(window.location.href);
      const params = url.searchParams;

      if (params.has('date')) {
        params.delete('date'); // Remove the 'date' parameter
        history.replaceState({}, '', url.pathname + url.search + url.hash);
      }
    
      indicator.classList.add("hidden")
    } else {
      const newParams = new URLSearchParams({ "date": date });
      window.history.pushState({}, "", "?" + newParams.toString());

      addDayEditIndicator(date)
    }
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
