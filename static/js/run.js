import { addFormListeners } from "./form.js";
import { showOthers, compactMode } from "./ui.js";
import { startup } from "./compile.js"

/*
This file co-ordinates any functions that need to be run (boileplate or otherwise)
when the file is loaded, to avoid any loading order conflicts etc.
*/

await startup()
addFormListeners()

// Dummy-run these to reflect any saved user  preferences
showOthers()
compactMode()