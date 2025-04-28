import { addFormListeners } from "./form.js";
import { showOthers, compactMode } from "./ui.js";
import { load } from "./compile.js"

/*
This file co-ordinates any functions that need to be run (boileplate or otherwise)
when the file is loaded, to avoid any loading order conflicts etc.
*/

await load('*') // Scope: * (all)

await load('25-apr') // Scope: * (all)

addFormListeners()

// Dummy-run these to reflect any saved user  preferences
showOthers()
compactMode()