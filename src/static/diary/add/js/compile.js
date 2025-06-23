/*
This file uses templates and compiles HTML to the page itself.
*/

import { loadTemplate } from "../../../general/js/template.js";
import { addSliderListeners } from "./listeners.js";
export { loadSliders, loadTag }

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
                sliderObj.title = slider.name;
                sliderTemplate.style.setProperty('--c', slider.color);

                addSliderListeners(sliderTemplate);
                // Append to container
                container.appendChild(sliderTemplate);
            });
        })
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
