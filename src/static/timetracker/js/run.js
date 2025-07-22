import { addFormListeners, addDayEditIndicator } from "./form.js";
import { populateContent } from "./compile.js"
import { populateCache } from "./cache.js";
import { init } from "../../general/js/display.js";

/*
This file co-ordinates any functions that need to be run (boileplate or otherwise)
when the file is loaded, to avoid any loading order conflicts.
*/

// Populate page
await populateCache()
populateContent();

// Add listeners
addFormListeners()

// Init display options
const parent = document.querySelector('.parent-container');
init([
    {
        id: "timetracker-compact-mode",
        targetNode: document.body,
        targetClass: "padding-on",
        triggerNode: document.querySelector('#compact-mode')
    },
    {
        id: "timetracker-show-others",
        targetNode: parent, 
        targetClass: "hide-others",
        triggerNode: document.querySelector("#show-others")
    },
    {
        id: "timetracker-rigid-mode",
        targetNode: parent,
        targetFunction: (on) => populateContent(), // Reload page content as the value has now automatically changed
        triggerNode: document.querySelector("#rigid-mode"),
        default: true
    }
])  

// Get ?date if exists and add appropriate indicator
const url = new URL(window.location.href);
const params = url.searchParams;
if (params.has('date')) {
    addDayEditIndicator(params.get('date'))
}
