import { update as gameplayUpdate } from "../systems/gameplay.js";
import { render } from "../systems/render.js";

let lastTime = performance.now();

export function startLoop() {
  function loop(now) {
    const dt = now - lastTime;
    lastTime = now;

    gameplayUpdate(dt);
    render();

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

