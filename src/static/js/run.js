import { addFormListeners } from "./form.js";
import { addCheckboxListeners, showOthers } from "./ui.js";
import { reload, initialiseContainers } from "./compile.js"
import { populateCache, getDay } from "./cache.js";

/*
This file co-ordinates any functions that need to be run (boileplate or otherwise)
when the file is loaded, to avoid any loading order conflicts.
*/

await initialiseContainers()

let names = await populateCache()
names.forEach(name => {
    reload(name)
})

addCheckboxListeners()
addFormListeners()
showOthers()
