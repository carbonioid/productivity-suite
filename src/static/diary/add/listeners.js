export { initCollapseButtonListeners, initSliderListeners, initMemorySelectListener }
import { getEntry } from "../js/cache.js"
import { getDateMinusDays } from "./utils.js"

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
        content.innerHTML = entry ? entry.entry : "No entry for this date."
    })

    memorySelect.dispatchEvent(new Event('change')) // Trigger change to load initial value
}
