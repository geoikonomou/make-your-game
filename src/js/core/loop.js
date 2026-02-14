import { update as gameplayUpdate } from "../systems/gameplay.js";
import { render } from "../systems/render.js";
import { gameState } from "./state.js";

let lastTime = performance.now();

export function startLoop() {
  function loop(now) {
    const dtMs = now - lastTime;
    lastTime = now;

    // physics expects seconds; timers use ms
    const dt = dtMs / 1000;

    if (gameState.getMode() === "RUNNING") {
      gameState.update(dtMs);
      gameplayUpdate(dt);
    }

    render();

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}
