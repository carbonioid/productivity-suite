import { initCollapseButtonListeners, initMemorySelectListener,
        initTagListeners, initEntryInputListeners, 
        initSubmitButtonListeners} from "./listeners.js";
import { loadPageContent } from "./compile.js";
import { getPageDate } from "./utils.js";

initCollapseButtonListeners();
initMemorySelectListener();
initTagListeners();
initEntryInputListeners();
initSubmitButtonListeners();


// Load content based on ?date query parameter
loadPageContent(getPageDate());
