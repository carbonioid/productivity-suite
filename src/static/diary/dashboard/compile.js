/*
This file uses templates to load entries and other HTML components into the page itself.
*/
export { loadEntry }
import { getEntry } from "../js/cache.js"
import { loadTemplate } from "../../general/js/template.js"
import { format_yyyymmdd } from "../js/utils.js"

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
    
    const entryObject = loadTemplate(document, "entry-container-template", {
        'date': format_yyyymmdd(entryData['date']),
        'entry': entryData['entry']
    })

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
