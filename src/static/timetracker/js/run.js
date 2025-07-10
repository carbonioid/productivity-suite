import { addFormListeners, addDisplayFormListeners, addDayEditIndicator } from "./form.js";
import { addCheckboxListeners, showOthers, setCompact, setDisplayOptionsFromCookie } from "./ui.js";
import { load, initialiseContainers } from "./compile.js"
import { getDay, populateCache } from "./cache.js";
import { showEmptyMessage } from "../../general/js/display.js";

/*
This file co-ordinates any functions that need to be run (boileplate or otherwise)
when the file is loaded, to avoid any loading order conflicts.
*/

setDisplayOptionsFromCookie()

let names = await populateCache() // Populate cache and get names of all elements

if (names.length === 1 && getDay(names[0]).length === 0) {
    const container = document.querySelector('.parent-container')
    showEmptyMessage(container, "No data", "You haven't added any data yet. Use the form at the top to get started.") // Show empty message if no entries exist
}

await initialiseContainers(names) // Create containers
names.forEach(name => { load(name, false) }) // Create elements themselves, but do not reload cache    

addFormListeners()
addDisplayFormListeners()
addCheckboxListeners()
showOthers()
setCompact()

// Get ?date if exists and add appropriate indicator
const url = new URL(window.location.href);
const params = url.searchParams;
if (params.has('date')) {
    addDayEditIndicator(params.get('date'))
}
