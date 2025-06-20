/*
This file uses templates to load entries and other HTML components into the page itself.
*/
export { loadEntry }
import { getEntry, fetchEntry } from "./cache.js"
import { loadTemplate } from "../../general/js/template.js"
import { format_yyyymmdd } from "./utils.js"

async function loadEntry(date, refresh, container) {
    /*
    Takes entry date and loads the entry of this name.
    If `refresh` is true, it refreshes the entry in the cache (uses fetchEntry()).
    Otherwise, it does not (uses getEntry())
    */

    if (container == null) {
        container = document.querySelector('.entry-parent')
    }

    const entryData = refresh ? await fetchEntry(date) : getEntry(date)
    
    const entryObject = loadTemplate(document, "entry-container-template", {
        'date': format_yyyymmdd(entryData['date']),
        'entry': entryData['entry']
    })

    // Load data-container entires
    const values = entryData.values
    const valuesContainer = entryObject.querySelector(".data-container")

    values.forEach(value => {
        let valueObject = loadTemplate(document, "data-rect-template", value)

        // Calculate progress based on min, max and value
        const progress = (value['value']-value['min'])/(value['max']-value['min'])
        valueObject.setAttribute("style", `--c:${value['color']}; --p:${progress};`)

        valuesContainer.appendChild(valueObject)
    })

    container.appendChild(entryObject)
}
