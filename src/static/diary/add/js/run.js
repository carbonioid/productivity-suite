import { initCollapseButtonListeners, initMemorySelectListener,
        initTagListeners, initEntryInputListeners, 
        initSubmitButtonListeners} from "./listeners.js";
import { loadSliders, loadStatsButton } from "./compile.js";

initCollapseButtonListeners();
initMemorySelectListener();
initTagListeners();
initEntryInputListeners();
initSubmitButtonListeners();

loadStatsButton();
await loadSliders();
