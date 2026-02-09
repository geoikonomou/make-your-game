import { audioManager } from "../audio/audio-manager.js";
import { startLevel } from "./level-controller.js";

export function showScreen(screenName, DOM) {
  Object.values(DOM.screens).forEach((screen) => screen.classList.add("hidden"));
  if (DOM.screens[screenName]) DOM.screens[screenName].classList.remove("hidden");

  const level = audioManager.settings.selectedLevel || 1;
  startLevel(level, DOM);
}
