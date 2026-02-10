import { update as gameplayUpdate } from "../systems/gameplay.js";
import { render } from "../systems/render.js";

let lastTime = performance.now();

export function startLoop() {
  function loop(t) {
    const dt = t - lastTime;
    lastTime = t;

    gameplayUpdate(dt);
    render();

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

