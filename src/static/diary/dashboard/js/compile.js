/*
This file uses templates to load entries and other HTML components into the page itself.
*/
export { loadPageContent }
import { populateCache } from "../../js/cache.js"
import { loadTemplate } from "../../../general/js/template.js"
import { addEditListener, addTagListeners } from "./listeners.js"
import { date_to_yyyymmdd, format_date } from "../../../general/js/utils.js"
import { showEmptyMessage } from "../../../general/js/display.js"
import { getTagIndex } from "../../js/api.js"

function loadEntry(entryData, container) {
    /*
    Takes entry date and loads the entry of this name.
    If `refresh` is true, it refreshes the entry in the cache (uses fetchEntry()).
    Otherwise, it does not (uses getEntry())
    */

    if (!entryData) {
        console.warn(`Entry for date ${date} does not exist.`)
        return
    }
    const entryObject = loadTemplate(document, "entry-container-template", {
        'date': format_date(entryData['date'], "long"),
        'title': entryData['title'],
        'entry': entryData['entry']
    })

    addEditListener(entryObject, entryData.date)

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

function loadEmptyEntry(date, container) {
    const template = loadTemplate(document, 'empty-entry-template', {
        'date': format_date(date)
    })
    
    template.href = `/diary/edit?date=${date_to_yyyymmdd(date)}`

    container.appendChild(template)
}

async function loadPageContent() {
    /*
    Load entries into page
    */

    // Load tags into search box
    const tagContainer = document.querySelector(".tag-menu")

    const tags = Object.entries(await getTagIndex());
    tags.sort((a, b) => b[1]-a[1]) // Sort, putting items with most instances at the top.
    for (const tag of tags) {
        const [name, _] = tag;
        const tagObj = loadTemplate(document, 'tag-template', {"name": name});
        addTagListeners(tagObj);
        
        tagContainer.appendChild(tagObj)
    }

    // Populate cache and get dates of all entries
    const entryDates = await populateCache()

    // Load all entries into page from newly populated cache
    const container = document.querySelector('.entry-parent')
    for (const entry of entryDates) {
        if (entry.empty) {
            loadEmptyEntry(entry.date, container)
        } else {
            loadEntry(entry, container)
        }
    }

    // Load empty message
    if (entryDates.filter(e => {return !e.empty}).length === 0) {
        showEmptyMessage(document.querySelector('.entry-parent'), "No entries", "You haven't written any diary entires yet. Click on the add button above to get started.")
    }
}
