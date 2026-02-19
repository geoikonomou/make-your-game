const keys = {};

const arrowKeysDownHandler = function(e) {
  keys[e.code] = true;
};
const arrowKeysUpHandler = function(e) {
  keys[e.code] = false;
};

export function initInput() {
  window.addEventListener("keydown", arrowKeysDownHandler);
  window.addEventListener("keyup", arrowKeysUpHandler);
}

export function stopGameInputListeners() {
  window.removeEventListener("keydown", arrowKeysDownHandler);
  window.removeEventListener("keyup", arrowKeysUpHandler);
  initialized = false;
}

export function getInput() {
  return keys;
}
