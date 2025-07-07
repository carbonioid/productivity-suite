/*
This file uses templates to load entries and other HTML components into the page itself.
*/
export { loadEntry, loadAddButton }
import { getEntry } from "../../js/cache.js"
import { loadTemplate } from "../../../general/js/template.js"
import { addEditListener } from "./listeners.js"
import { format_date } from "../../../general/js/utils.js"

async function loadEntry(date, refresh, container) {
    /*
    Takes entry date and loads the entry of this name.
    If `refresh` is true, it refreshes the entry in the cache (uses fetchEntry()).
    Otherwise, it does not (uses getEntry())
    */

    if (container == null) {
        container = document.querySelector('.entry-parent')
    }

    const entryData = await getEntry(date, refresh)
    if (!entryData) {
        console.warn(`Entry for date ${date} does not exist.`)
        return
    }
    const entryObject = loadTemplate(document, "entry-container-template", {
        'date': format_date(entryData['date'], "long"),
        'title': entryData['title'],
        'entry': entryData['entry']
    })

    addEditListener(entryObject, date)

    // Load data-container entires
    const ratings = entryData.ratings
    const ratingsContainer = entryObject.querySelector(".data-container")

    ratings.forEach(rating => {
        let ratingObject = loadTemplate(document, "data-rect-template", rating)

        // Calculate progress based on min, max and value
        const progress = (rating['value']-rating['min'])/(rating['max']-rating['min'])
        ratingObject.setAttribute("style", `--c:${rating['color']}; --p:${progress};`)

        ratingsContainer.appendChild(ratingObject)
    })

    container.appendChild(entryObject)
}

async function loadAddButton() {
    /*
    * Loads the add button into the page, only if the entry for today does not exist.
    */
    const entryData = await getEntry(new Date(), false)

    if (entryData) {
        const addButton = document.querySelector('.add-button');
        addButton.classList.add('hidden')
    }
}
