/**
 * Displays a specific screen and hides all others.
 *
 * @param {"menu"|"levels"|"options"|"game"} screenName - Target screen key.
 * @param {Object} DOM - Centralized DOM reference object.
 */
export function showScreen(screenName, DOM) {
  Object.values(DOM.screens).forEach((screen) =>
    screen.classList.add("hidden"),
  );
  if (DOM.screens[screenName])
    DOM.screens[screenName].classList.remove("hidden");
}
