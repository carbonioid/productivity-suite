export { initCollapseButtonListeners, addSliderListeners, initMemorySelectListener, 
    initTagListeners, initEntryInputListeners, initSubmitButtonListeners, 
    initDeleteButtonListeners}
import { format_date } from "../../../general/js/utils.js"
import { getEntry } from "../../js/cache.js"
import { getDateMinusDays, getPageDate, dashboardRedirect } from "./utils.js"
import { loadTag } from "./compile.js"
import { getFormData } from "./form.js"
import { addEntry, editEntry, deleteEntry } from "../../js/api.js"

function addSliderListeners(container) {
    /*
    Add listeners to the slider in the container. The listener updates the text content of the label
    when the slider is moved.
    */
    const slider = container.querySelector('.slider')
    const sliderValue = container.querySelector('.slider-value')

    slider.addEventListener('input', () => {
        sliderValue.textContent = slider.value

        // Add progress value for data-rect
        const min = parseFloat(slider.min)
        const max = parseFloat(slider.max)
        const progress = (slider.value - min) / (max - min)

        container.querySelector('.data-rect').style.setProperty('--p', progress)
    })

    slider.dispatchEvent(new Event('input')) // Trigger input to set initial value
}

function initCollapseButtonListeners() {
    /*
    Initialize the collapse button listeners. This toggles the visibility of the memory container
    when the collapseButton is pressed.
    */
    const collapseButton = document.querySelector('.collapse-button')
    const memoryContainer = document.querySelector('.memory-container')

    collapseButton.addEventListener('click', () => {
        memoryContainer.classList.toggle('hidden')
        collapseButton.classList.toggle('switched')
    })
}

function initMemorySelectListener() {
    /*
    Initialize the memory select listener. This sets the content of the memory containter
    to the content of a specific entry when the user selects a time delta from the memory select.
    */
    const date = getPageDate(); // Get date being edited

    const memorySelect = document.querySelector('.delay-select')
    memorySelect.addEventListener('change', async () => {
        const value = memorySelect.options[memorySelect.selectedIndex].value
        const selectedDate = getDateMinusDays(new Date(date), value)
 
        // Load the entry for this date
        const entry = await getEntry(selectedDate, true)
        
        // Update the memory container with the entry
        const content = memorySelect.parentElement.parentElement.querySelector('.content')
        const entrySpan = content.querySelector('.entry-value')
        const dateSpan = content.querySelector('.date-value')

        entrySpan.innerHTML = entry ? entry.entry : "No entry for this date."
        dateSpan.innerHTML = format_date(selectedDate, "long")
    })

    memorySelect.dispatchEvent(new Event('change')) // Trigger change to load initial value
}

function initTagListeners() {
    /*
    Initialize the tag listeners.
    - Add click listener to add button to add a new tag
    */

    const addTag = document.querySelector('.add-tag')
    const addButton = addTag.querySelector('.add-tag span')
    const tagInput = addTag.querySelector('.tag-input')

    addButton.addEventListener('click', () => {
        tagInput.classList.remove('hidden')
        tagInput.focus()
    })

    // listen for keydown instead of submit so that the page doesn't reload 
    // (we can prevent the event before it bubbles to submit stage)
    tagInput.addEventListener('keydown', (event) => { 
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default behavior

            const tagName = tagInput.value.trim();
            tagInput.value = ""; 
            tagInput.classList.add('hidden');

            if (tagName) {
                // Create tag if name not empty
                const container = document.querySelector('.tag-container');
                loadTag(container, tagName)
            }
        }
        
        if (event.key === 'Escape') {
            // Hide input if Escape is pressed
            tagInput.classList.add('hidden');
            tagInput.value = ""; // Clear input
        }
    });
}

function initEntryInputListeners() {
    /*
    Initialise listeners for the entry input, which create and remove a placeholder
    */
    const entryInput = document.querySelector('.entry-input');
    entryInput.addEventListener('focusout', () => {
        if (!entryInput.textContent.length) {
            entryInput.innerHTML = '' // Empty text so placeholder exists again
        }
    })

   entryInput.innerHTML = '' // Trigger ::before psuedo-element on load
}

function initSubmitButtonListeners() {
    const submitButton = document.querySelector('.submit-button');
    submitButton.addEventListener('click', async (event) => {
        const data = getFormData()
        if (data[0].length == 0 || data[1].length == 0) {
            alert("Please fill in both title and entry.")
            return
        }

        const entryExists = await getEntry(getPageDate(), false)

        let response = null
        if (entryExists) { // If the page alr exists, we are editing.
            response = await editEntry(getPageDate(), ...data)
        } else { // otherwise, we are adding a new entry.
            response = await addEntry(...data)
        }
        
        if (response.ok) {
            dashboardRedirect(); // Redirect to dashboard after submission
        } else {
            console.error(`Failed to submit entry: ${response.statusText}`);
        }
    })
}

function initDeleteButtonListeners() {
    const deleteButton = document.querySelector('.delete-button');
    deleteButton.addEventListener('click', async (event) => {
        const sure = confirm("Are you sure you want to delete this entry? This cannot be undone.");

        if (!sure) {
            return;
        }

        await deleteEntry(getPageDate()).then(response => {
            if (response.ok) {
                dashboardRedirect();
            } else {
                console.error(`Failed to delete entry: ${response.statusText}`);
            }
        })
    })
}
