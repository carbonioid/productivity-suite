import { addFormListeners, addDisplayFormListeners, addDayEditIndicator } from "./form.js";
import { addCheckboxListeners, showOthers, setCompact, setDisplayOptionsFromCookie } from "./ui.js";
import { populateContent } from "./compile.js"
import { populateCache } from "./cache.js";

/*
This file co-ordinates any functions that need to be run (boileplate or otherwise)
when the file is loaded, to avoid any loading order conflicts.
*/

// Populate page
await populateCache()
populateContent();

// Add listeners
addFormListeners()
addDisplayFormListeners()
addCheckboxListeners()

// Display options
setDisplayOptionsFromCookie()
showOthers()
setCompact()

// Get ?date if exists and add appropriate indicator
const url = new URL(window.location.href);
const params = url.searchParams;
if (params.has('date')) {
    addDayEditIndicator(params.get('date'))
}
