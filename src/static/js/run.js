import { addFormListeners, addDisplayFormListeners } from "./form.js";
import { addCheckboxListeners, showOthers, setCompact } from "./ui.js";
import { load, initialiseContainers } from "./compile.js"
import { populateCache } from "./cache.js";

/*
This file co-ordinates any functions that need to be run (boileplate or otherwise)
when the file is loaded, to avoid any loading order conflicts.
*/


let names = await populateCache() // Populate cache and get names of all elements

await initialiseContainers(names) // Create containers
names.forEach(name => { load(name, false) }) // Create elements themselves, but do not reload cache

addFormListeners()
addDisplayFormListeners()
addCheckboxListeners()
showOthers()
setCompact()
