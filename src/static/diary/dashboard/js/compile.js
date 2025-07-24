/*
This file uses templates to load entries and other HTML components into the page itself.
*/
export { loadPageContent, loadEntry, loadAllEntries }
import { allEntries, populateCache } from "../../js/cache.js"
import { loadTemplate } from "../../../general/js/template.js"
import { addEditListener, initFormListeners } from "./listeners.js"
import { date_to_yyyymmdd, format_date } from "../../../general/js/utils.js"
import { showEmptyMessage } from "../../../general/js/messages.js"
import { loadTagInput } from "../../js/tag-select.js"
import { init } from "../../../general/js/display.js";

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
        'title': entryData['title'] || "Untitled",
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

function loadAllEntries() {
    /*
    Load all entries into page. Returns true if all entries were empty,
    false otherwise.
    */
    const entries = allEntries();

    // Load all entries into page from newly populated cache
    const container = document.querySelector('.entry-parent')
    let nonEmptyEntry = false;
    for (const entry of entries) {
        if (entry.empty) {
            loadEmptyEntry(entry.date, container)
        } else {
            nonEmptyEntry = true;
            loadEntry(entry, container)
        }
    }

    if (!nonEmptyEntry) {
        // Load empty message
        showEmptyMessage(document.querySelector('.entry-parent'), "No entries", "You haven't written any diary entries yet. Click on the add button above to get started.")
    }
}

async function loadPageContent() {
    /*
    Load entries into page
    */
   
    // Initialise display options
    init([
        {
            id: "diary-reader-view",
            targetNode: document.querySelector(".entry-parent"),
            targetClass: "reader-view",
            targetFunction: (on) => {
                if (on) document.querySelector(".entry-parent").classList.add("hide-empty")
                else document.querySelector(".entry-parent").classList.remove("hide-empty")
            },
            triggerNode: document.querySelector(".view")
        },
        {
            id: "diary-show-empty",
            targetNode: document.querySelector(".entry-parent"),
            targetClass: "hide-empty",
            triggerNode: document.querySelector(".show-empty"),
        }
    ])

    // init other listeners
    initFormListeners();

    // load tag input
    await loadTagInput(document.querySelector(".tag-select"), false); // The version for this page is not adaptable because the user shouldn't be able to add custom tags (hence false)
    
    // Populate cache and load entries
    await populateCache()
    loadAllEntries();
}
