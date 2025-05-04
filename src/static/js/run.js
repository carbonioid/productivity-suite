import { addFormListeners } from "./form.js";
import { showOthers } from "./ui.js";
import { load } from "./compile.js"

/*
This file co-ordinates any functions that need to be run (boileplate or otherwise)
when the file is loaded, to avoid any loading order conflicts.
*/

await load('*') // Scope: * (all)

addFormListeners()

// Dummy-run to reflect any saved user preferences
showOthers()
