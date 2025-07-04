import { initCollapseButtonListeners, initMemorySelectListener,
        initTagListeners, initSubmitButtonListeners, 
        initEntryInputListeners } from "./listeners.js";
import { loadPageContent } from "./compile.js";
import { getPageDate } from "./utils.js";

initCollapseButtonListeners();
initMemorySelectListener();
initTagListeners();
initSubmitButtonListeners();
initEntryInputListeners();

// Load content based on ?date query parameter
loadPageContent(getPageDate());
