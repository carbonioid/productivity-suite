import { initCollapseButtonListeners, initSliderListeners } from "./listeners.js";
import { loadSliders } from "./compile.js";

await loadSliders();

initCollapseButtonListeners();
initSliderListeners();
