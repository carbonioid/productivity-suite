/*
This file uses templates to load entries and other HTML components into the page itself.
*/
export { loadPageContent, loadEntry, loadAllEntries, loadTag }
import { allEntries, populateCache } from "../../js/cache.js"
import { loadTemplate } from "../../../general/js/template.js"
import { addEditListener, addTagListeners, initFormListeners, initNavListeners, initTagListeners } from "./listeners.js"
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

function loadTag(name, container, initAsSelected) {
    /*
    Load a tag into `container` with name `name`.
    if initAsSelected is true, the tag will be initialised with the selected class
    */
    if (container == undefined) {
        container = document.querySelector(".tag-menu")
    }
    
    const tagObj = loadTemplate(document, 'tag-template', {"name": name});
    if (initAsSelected) {tagObj.classList.add("selected")}
    addTagListeners(tagObj, container);

    container.appendChild(tagObj)
}

async function loadPageContent() {
    /*
    Load entries into page
    */

    initFormListeners();
    initNavListeners();

    await loadTagInput(false); // The version for this page is not adaptable because the user shouldn't be able to add custom tags (hence false)

    // Populate cache and load entries
    await populateCache()
    loadAllEntries();
}

async function loadTagInput(adaptable) {
    /*
    Fully load tag input with class .tag-menu.
    If `adaptable` is true, this function will look for a .adapt-tag and will place the user input in that tag, and allow it to be selected
    If `adaptable` is false, the function will ook for a .empty-msg and display that if there are no results.

    If `floatSelected` is true, when a tag is selected, it will be placed at the top of the tag list. Otherwise, the tags will not move.
    */
    // Load tags into search box
    const tagContainer = document.querySelector(".tag-menu")

    const tags = Object.entries(await getTagIndex());
    tags.sort((a, b) => b[1]-a[1]) // Sort, putting items with most instances at the top.
    for (const tag of tags) {
        const [name, _] = tag;
        loadTag(name)
    }

    // Show empty message if there are no tags
    if (tags.length == 0) {
        document.querySelector(".empty-msg").classList.remove("hidden")
    }

    initTagListeners(adaptable);
}
