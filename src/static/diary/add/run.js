import { initCollapseButtonListeners, initSliderListeners, initMemorySelectListener,
        initTagListeners } from "./listeners.js";
import { loadSliders } from "./compile.js";

initCollapseButtonListeners();
initMemorySelectListener();
initTagListeners();

await loadSliders();
initSliderListeners();
