/*
This file uses templates and compiles HTML to the page itself.
*/

import { loadTemplate } from "../../general/js/template.js";
export { loadSliders}

async function loadSliders() {
    // Fetch settings from settings.json
    await fetch('/diary/settings')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error; status: ${response.status}`);
            }
            return response.json();
        })
        .catch(error => { console.error('Error fetching settings:', error); })
        .then(settings => {
            const container = document.querySelector('.rating-container')
            settings.values.forEach(slider => {
                const sliderTemplate = loadTemplate(document, "slider-template", {});
                const sliderObj = sliderTemplate.querySelector('.slider');

                // Set attributes for the slider
                sliderObj.min = slider.min;
                sliderObj.max = slider.max;
                sliderTemplate.style.setProperty('--c', slider.color);

                // Append to container
                container.appendChild(sliderTemplate);
            });
        })
}