/*
This file holds all functions for adding event listeners to objects.
*/
export { registerWeekCollapseIcon, registerAddToButton, registerEditing, addFormListeners }
import { date_to_yyyymmdd } from "../../general/js/utils.js";
import { getAllDays } from "./utils.js";
import { getCookies } from "../../general/js/utils.js";
import { exitEditMode, enterEditMode, detectColor, setFormContent, submitForm, startAddingTo } from "./form.js"

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
Listeners for the form
*/
function registerEditing(obj) {
    // Register the editing mode (in the form; this doesn't actually do the editing) -
    // what this does is set the input area to the values of this object
    // and set some parameters in the input area to let the form know we are editing
    // So that when the form is submitted, we know what to edit.
    obj.addEventListener('dblclick', (event) => {
        event.preventDefault();
        enterEditMode(obj)
    });
}

function registerAddToButton(button, date) {
    button.addEventListener('click', () => {
        startAddingTo(date)
    })
}

function addFormListeners() {
    let form = document.querySelector(".form-body");

    // Listener for ctrl-equals - sets "end" value to the current time (even if already set) - for me, the power user.
    // Only activates when one of the form elements is selected (hence the forEach)
    document.addEventListener('keyup', async function (event) {
        if (event.ctrlKey && event.key === ' ') {
            // Get curent date in HH:mm
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            let currentTime = `${hours}:${minutes}`;

            // Set it in the form.
            setFormContent(null, null, currentTime, null);

            // Focus form for easy editing/submitting
            form.querySelector("#add").focus()
        }
        // Exit editing mode on escape key press, if the form is in edit mode.
        else if (event.key === 'Escape' && document.querySelector(".form-body").dataset.mode.startsWith('edit')) {
            exitEditMode();
        }

        // Edit most recent item on up arrow press, if input form not selected
        else if (event.key === 'ArrowUp' && 
            (!document.querySelector('#name').contains(document.activeElement) || // Either, the name field is not focused
            document.querySelector('#name').value === "") // Or, the name field is blank (so something was probably just added)
        ) {
            // Enter editing mode for the most recent item
            const lastItem = getAllDays()[0].lastElementChild
            enterEditMode(lastItem)
        }
        })

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        await submitForm();
    });

    // Listener that updates selected label based on currently inputted name.
    const nameInput = document.querySelector('#name');
    const startInput = document.querySelector('#start');
    nameInput.addEventListener("input", (event) => {
        let col = detectColor(nameInput.value);

        // Set appropriate radio button to selected
        setFormContent(null, null, null, col);
    })
    startInput.addEventListener("input", (event) => {
        startInput.dataset.auto = false; // The "auto" property trackers whether the info here has been automatically set; if the user edits it, it has not.
    })

    // Editing indicator Listener
    document.querySelector('.editing-exit-button').addEventListener('click', exitEditMode)

    // Day editing indicator listener
    document.querySelector('.day-editing-exit-button').addEventListener('click', () => {
        startAddingTo(date_to_yyyymmdd(new Date()))
    })
}
