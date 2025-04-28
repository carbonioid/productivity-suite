/*
This file handles the main form of the page. Some functionality is exported to ui.js
*/

import { addElement, editElement } from "./compile.js";
import { displayError } from "./error.js";
export { addFormListeners, registerEditing }

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

function exitEditMode() {
  // Restore the form content from the data-mode info. Used when editing is exited to get back form content from before it was created.
  // Set back the previous content
  let form = document.querySelector('.form-body');
  let prevContent = form.getAttribute('data-mode').split(';')[3].split('\\');

  let name = prevContent[0];
  let start = prevContent[1];
  let end = prevContent[2];
  let color = prevContent[3];

  setFormContent(name, start, end, color);

  // Hide the editing indicator
  document.querySelector('.editing-indicator').classList.add("soft-hidden")

  // Exit edit mode in the form.
  form.setAttribute('data-mode', `add`);
}

async function submitForm() {
  /*
  This function handles form submission and has two modes:
  - If the data-mode attribute of the form is `add`, it simply adds the element to the DOM and queries the server to add it to the DB.
  - If the data-mdoe attribute of the form is `edit:name,id`, it edits this element and sends that request to the server
  */
  let form = document.querySelector('.form-body');

  let [name, start, end, color] = getFormContent(); // Get current form content

  if (form.getAttribute('data-mode') == 'add') { // If add mode, simply add content
    let outcome = await addElement(name, start, end, color);
    if (outcome === true) {
      // Set the start value to the current value of end - QoL.
      setFormContent('', end, '', '220, 220, 220')
    } else { // It was unsuccessful
      displayError(outcome);
    }
  } else { // Otherwise (editing mode), get the editing info and edit the data on the serverside, then reset the previous content of the form from the data-mode attribute.
    // Edit the element on the serverside - this section involves parsing the data-mode attribute.
    let editing_info = form.getAttribute('data-mode').split(';')[1].split('\\');
    let day_name = editing_info[0];
    let id = editing_info[1];

    editElement(id, name, start, end, color, day_name);

    console.log(`Editing ${id} at ${day_name}`);
    exitEditMode();
  }
}

function addFormListeners() {
  let form = document.querySelector(".form-body");

  // Listener for ctrl-equals - sets "end" value to the current time (even if already set) - for me, the power user.
  // Only activates when one of the form elements is selected (hence the forEach)
  const form_inputs = form.querySelectorAll('input');
  form_inputs.forEach(input => {
    input.addEventListener('keyup', function (event) {
      if (event.ctrlKey && event.key == '=') {
        // Get curent date in HH:mm
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        let currentTime = `${hours}:${minutes}`;

        // Set it in the form.
        setFormContent(null, null, currentTime, null);
      }
    })
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    console.log(event.shiftKey);
    await submitForm();
  });

  // Listener that updates selected label based on currently inputted name.
  let name_input = document.querySelector('#name');
  name_input.addEventListener("input", (event) => {
    let col = detectColor(name_input.value);

    // Set appropriate radio button to selected
    setFormContent(null, null, null, col);
  })

  // Editing indicator Listener
  document.querySelector('.editing-exit-button').addEventListener('click', exitEditMode)
}

/* Used by ui.js */
function registerEditing(obj) {
  // Register the editing mode -
  // what this does is set the input area to the values of this object
  // and set some parameters in the input area to let the rest of the world
  // know we are editing.
  // (It's here because it has event listeners)
  obj.addEventListener('dblclick', (event) => {
    event.preventDefault();

    // Parse data-api-info atrribute to get appropriate data
    let id = obj.id;
    let data = obj.getAttribute('data-api-info').split('\\');
    let name = data[0];
    let start = data[1];
    let end = data[2];
    let color = data[3];

    // Populate the input section with the editing data with this info and save copies of it
    let [tmpName, tmpStart, tmpEnd, tmpColor] = getFormContent();
    setFormContent(name, start, end, color);

    // Set the appropriate mode, which saves the info about which item we are editing and the previous form content (so we can set it back)
    let day_name = obj.parentNode.id;
    let form = document.querySelector('.form-body');
    form.setAttribute('data-mode', `edit;${day_name}\\${id};prev;${tmpName}\\${tmpStart}\\${tmpEnd}\\${tmpColor}`);

    // Activate the editing indicator
    document.querySelector('.editing-indicator').classList.remove("soft-hidden")
  });
}
