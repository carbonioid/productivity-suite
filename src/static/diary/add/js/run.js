import { initCollapseButtonListeners, initMemorySelectListener,
        initTagListeners, initEntryInputListeners } from "./listeners.js";
import { loadSliders } from "./compile.js";

initCollapseButtonListeners();
initMemorySelectListener();
initTagListeners();
initEntryInputListeners();

await loadSliders();
