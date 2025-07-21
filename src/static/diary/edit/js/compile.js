/*
This file uses templates and compiles HTML to the page itself.
*/

import { getEntry } from "../../js/cache.js";
import { getSettings } from "../../js/api.js";
import { loadTemplate } from "../../../general/js/template.js";
import { addSliderListeners } from "./listeners.js";
import { format_date } from "../../../general/js/utils.js";
import { initDeleteButtonListeners } from "./listeners.js";
import { loadTagInput } from "../../js/tag-select.js";
import { setSelectedTags } from "../../js/tag-select.js";
export { loadPageContent }

async function loadSlider(container, data) {
    /*
    Loads a single slider into the page.
    `data` should contain the properties of the slider.
    */
    const sliderTemplate = loadTemplate(document, "slider-template", data);
    const sliderObj = sliderTemplate.querySelector('.slider');

    // Set attributes for the slider
    sliderObj.min = data.min;
    sliderObj.max = data.max;
    sliderObj.title = data.name;
    sliderTemplate.style.setProperty('--c', data.color);

    sliderObj.value = data.value || data.min; // Default to min if no value is set (if we are loading from settings.json, there will be no value)

    addSliderListeners(sliderTemplate);
    
    container.appendChild(sliderTemplate);
}

async function loadPageContent(date) {
    /*
    Loads the page content for the given date.
    This includes loading the entry, sliders, tags, and stats button.
    Takes `date` in YYYY-MM-DD format.
    */

    // Populate date in page title
    const valueSpan = document.querySelector('.title-date-value');
    valueSpan.textContent = format_date(date, "medium");

    // Load tags
    await loadTagInput(document.querySelector(".tag-select"), true)

    // Get entry data
    const entry = await getEntry(date, false);

    // If entry is new, then run a smaller subset of commands
    if (entry == undefined || entry.empty) {
        console.info(`No entry found for date: ${date}. Loading empty page.`);
        
        // Load sliders anyway, so that the user can add a new entry
        // but use settings defaults because there are no values yet
        const settings = await getSettings();
        const container = document.querySelector('.rating-container');
        settings.ratings.forEach(rating => {
            loadSlider(container, rating)
        })
    }
    // Otherwise, run behaviour for editing
    else {

        // Load entry & title & page title
        const entryInput = document.querySelector('.entry-input');
        const titleInput = document.querySelector('.entry-title');
        titleInput.value = entry.title || "";
        entryInput.value = entry.entry || "";

        // Select tags
        setSelectedTags(entry.tags, document.querySelector(".tag-select"))

        // Load sliders
        const container = document.querySelector('.rating-container');
        entry.ratings.forEach(rating => {
            loadSlider(container, rating)
        })

        // Conditionally load delete button if entry exists
        // (if we got to this point, we know we are editing so the button should appear, becuase otherwise the "new entry" thing would've been tripped and the function would've returned)
        const deleteButton = document.querySelector('.delete-button');
        deleteButton.classList.remove('hidden');
        initDeleteButtonListeners();
    }   
}
