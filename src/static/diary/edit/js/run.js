import { initCollapseButtonListeners, initMemorySelectListener,
        initTagListeners, initEntryInputListeners, 
        initSubmitButtonListeners} from "./listeners.js";
import { loadPageContent } from "./compile.js";

initCollapseButtonListeners();
initMemorySelectListener();
initTagListeners();
initEntryInputListeners();
initSubmitButtonListeners();


// Load content based on ?date query parameter
const urlParams = new URLSearchParams(window.location.search);
const dateParam = urlParams.get('date');
if (dateParam) {
    // If date is provided, load stats button with that date
    await loadPageContent(dateParam);
} else {
    await loadPageContent(new Date().toLocaleDateString('en-CA')); // Default to today
}
