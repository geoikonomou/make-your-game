import { STORY } from "../config/story-config.js";
import { showScreen } from "./screen-controller.js";

/**
 * Cutscene Controller
 *
 * Manages the story-mode cutscene panel — populates image, title, and
 * narrative from the story config, handles entrance/exit animations,
 * and invokes a callback when the player presses "Continue".
 */

/** @type {Object|null} Cached DOM references */
let _DOM = null;
/** @type {Function|null} Current continue callback */
let _onContinue = null;

/**
 * Initializes the cutscene controller. Call once at startup.
 * Registers the click handler for the Continue button via delegation.
 *
 * @param {Object} DOM - Centralized DOM reference object.
 */
export function initCutsceneController(DOM) {
  _DOM = DOM;

  document.addEventListener("click", (e) => {
    if (e.target.id === "cutsceneContinueBtn" && _onContinue) {
      // Trigger fade-out animation, then invoke callback
      const screen = _DOM.screens.cutscene;
      screen.classList.add("fade-out");

      const onAnimEnd = () => {
        screen.removeEventListener("animationend", onAnimEnd);
        screen.classList.remove("fade-out");
        _onContinue();
        _onContinue = null;
      };
      screen.addEventListener("animationend", onAnimEnd);
    }
  });
}

/**
 * Shows a cutscene panel for the given level (or "complete" key).
 * Populates image/title/narrative, transitions to the cutscene screen,
 * and calls `onComplete` when the player clicks Continue.
 *
 * @param {number|string} levelKey  - Level number (1-6) or "complete".
 * @param {Object}        DOM       - Centralized DOM reference object.
 * @param {Function}      onComplete - Called after the player dismisses the cutscene.
 */
export function showCutscene(levelKey, DOM, onComplete) {
  const entry = STORY[levelKey];
  if (!entry) {
    // No story entry for this level — skip cutscene
    onComplete?.();
    return;
  }

  const { title, narrative, image } = entry;
  const els = DOM.cutscene;

  // Populate text
  if (els.title) els.title.textContent = title;
  if (els.narrative) els.narrative.textContent = narrative;

  // Populate image — try loading the image, fall back to gradient
  if (els.image && els.imageFallback) {
    els.image.style.display = "";
    els.imageFallback.classList.remove("active");

    if (image) {
      els.image.src = image;
      els.image.onerror = () => {
        // Image not found — show gradient fallback
        els.image.style.display = "none";
        els.imageFallback.classList.add("active");
      };
    } else {
      els.image.style.display = "none";
      els.imageFallback.classList.add("active");
    }
  }

  // Store callback
  _onContinue = onComplete;

  // Reset any leftover fade-out class and force animation restart
  const screen = DOM.screens.cutscene;
  screen.classList.remove("fade-out");

  // Show cutscene screen (hides all others)
  showScreen("cutscene", DOM);

  // Force re-trigger entrance animations by removing and re-adding children classes
  // This handles the case where we show cutscene → cutscene without a different screen in between
  void screen.offsetWidth; // reflow to restart CSS animations
}
