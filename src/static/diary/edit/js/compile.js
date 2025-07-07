/*
This file uses templates and compiles HTML to the page itself.
*/

import { getEntry } from "../../js/cache.js";
import { getSettings } from "../../js/api.js";
import { loadTemplate } from "../../../general/js/template.js";
import { addSliderListeners } from "./listeners.js";
import { yyyymmdd_to_date, format_date } from "../../../general/js/utils.js";
import { initDeleteButtonListeners } from "./listeners.js";
export { loadTag, loadStatsButton, loadPageContent }

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

function loadTag(container, name) {
    /*
    Load tag into `container` with name `name`.
    */
    const template = loadTemplate(document, "tag-template", {
        name: name
    });

    template.querySelector('.close-button').addEventListener('click', () => {
        template.remove();
    })

    // Insert before last child so that it's not after the add button
    container.insertBefore(template, container.lastElementChild);
}

function loadStatsButton(date) {
    // Set date on "see stats" button
    const statsDate = document.querySelector(".stats-button").querySelector(".stats-date");
    statsDate.outerHTML = format_date(date, "medium");
}

async function loadPageContent(date) {
    /*
    Loads the page content for the given date.
    This includes loading the entry, sliders, tags, and stats button.
    Takes `date` in YYYY-MM-DD format.

    It follows these steps:
    (0) Populate title span with formatted date
    (1) Get entry data
    (2) Load entry & title & page title
    (3) Load tags
    (4) Load sliders
    (5) Load stats button
    (6) Conditionally load delete button if entry exists
    */

    // Page title - populate span
    const valueSpan = document.querySelector('.title-date-value');
    valueSpan.textContent = format_date(date, "medium");

    // (0) Get entry data
    const entry = await getEntry(date, false);
    if (!entry) {
        console.info(`No entry found for date: ${date}. Loading empty page.`);
        // Load sliders anyway, so that the user can add a new entry
        const settings = await getSettings();
        const container = document.querySelector('.rating-container');
        settings.ratings.forEach(rating => {
            loadSlider(container, rating)
        })

        loadStatsButton(date)
        return;
    }

    // (1) Load entry & title & page title
    const entryInput = document.querySelector('.entry-input');
    const titleInput = document.querySelector('.entry-title');
    titleInput.value = entry.title || "";
    entryInput.value = entry.entry || "";

    // (2) Load tags
    const tagContainer = document.querySelector('.tag-container');
    entry.tags.forEach(tag => {
        loadTag(tagContainer, tag);
    })

    // (3) Load sliders
    const container = document.querySelector('.rating-container');
    entry.ratings.forEach(rating => {
        loadSlider(container, rating)
    })

    // (4) Load stats button
    loadStatsButton(date);

    // (5) Conditionally load delete button if entry exists (if we got to this point, we know we are editing so the button should appear)
    const deleteButton = document.querySelector('.delete-button');
    deleteButton.classList.remove('hidden');
    initDeleteButtonListeners();
}
