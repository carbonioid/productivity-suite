import { initCollapseButtonListeners, initMemorySelectListener,
        initTagListeners, initEntryInputListeners, 
        initSubmitButtonListeners} from "./listeners.js";
import { loadSliders } from "./compile.js";

initCollapseButtonListeners();
initMemorySelectListener();
initTagListeners();
initEntryInputListeners();
initSubmitButtonListeners();

await loadSliders();
