import { initCollapseButtonListeners, initMemorySelectListener,
    initTagListeners, initSubmitButtonListeners, 
    initEntryInputListeners } from "./listeners.js";
import { loadPageContent } from "./compile.js";
import { getPageDate } from "./utils.js";

window.addEventListener('DOMContentLoaded', async () => {
    // Load content based on ?date query parameter
    await loadPageContent(getPageDate());

    // Initialize listeners
    initCollapseButtonListeners();
    initMemorySelectListener();
    initTagListeners();
    initSubmitButtonListeners();
    initEntryInputListeners();
})
