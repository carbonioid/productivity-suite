import { initCollapseButtonListeners, initSliderListeners, initMemorySelectListener } from "./listeners.js";
import { loadSliders } from "./compile.js";

initCollapseButtonListeners();
initMemorySelectListener();

await loadSliders();
initSliderListeners();
