export { initCollapseButtonListeners, initSliderListeners, initMemorySelectListener, initTagListeners }
import { format_yyyymmdd } from "../../general/js/utils.js"
import { getEntry } from "../js/cache.js"
import { getDateMinusDays } from "./utils.js"
import { loadTag } from "./compile.js"

function initSliderListeners() {
    const containers = document.querySelectorAll('.slider-container')

    containers.forEach(container => {
        const slider = container.querySelector('.slider')
        const sliderValue = container.querySelector('.slider-value')

        sliderValue.textContent = slider.value
        slider.addEventListener('input', () => {
            sliderValue.textContent = slider.value
        })
    })
}

function initCollapseButtonListeners() {
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
    const memorySelect = document.querySelector('.delay-select')
    memorySelect.addEventListener('change', async () => {
        const value = memorySelect.options[memorySelect.selectedIndex].value
        const selectedDate = getDateMinusDays(value)
 
        // Load the entry for this date
        const entry = await getEntry(selectedDate, true)
        
        // Update the memory container with the entry
        const content = memorySelect.parentElement.parentElement.querySelector('.content')
        const entrySpan = content.querySelector('.entry-value')
        const dateSpan = content.querySelector('.date-value')

        entrySpan.innerHTML = entry ? entry.entry : "No entry for this date."
        dateSpan.innerHTML = format_yyyymmdd(selectedDate, true)
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

            // Create tag
            const container = document.querySelector('.tag-container');
            loadTag(container, tagName)
        }
    });
}

