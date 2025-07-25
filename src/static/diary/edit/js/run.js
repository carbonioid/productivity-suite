import { initCollapseButtonListeners, initMemorySelectListener,
        initEntryInputListeners, initSubmitButtonListeners, addBackButtonListeners} from "./listeners.js";
import { loadPageContent } from "./compile.js";
import { getPageDate } from "./utils.js";

// Load content based on ?date query parameter
loadPageContent(getPageDate());

initCollapseButtonListeners();
initMemorySelectListener();
initEntryInputListeners();
initSubmitButtonListeners();
addBackButtonListeners();
