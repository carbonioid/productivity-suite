import { addFormListeners } from "./form.js";
import { addCheckboxListeners } from "./ui.js";
import { load, initialiseContainers } from "./compile.js"

/*
This file co-ordinates any functions that need to be run (boileplate or otherwise)
when the file is loaded, to avoid any loading order conflicts.
*/

await initialiseContainers()
await load('*') // Scope: * (all)

addCheckboxListeners()
addFormListeners()
