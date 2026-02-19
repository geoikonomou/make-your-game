import { update as gameplayUpdate } from "../systems/gameplay.js";
import { render } from "../systems/render.js";
import { gameState } from "./state.js";

let lastTime;
let loopId = 0; // incremented each startLoop; stale loops exit

export function startLoop() {
  // Cancel any previously running loop and reset timing
  loopId++;
  const myId = loopId;
  lastTime = null;

  function loop(now) {
    // If a newer loop was started, stop this one
    if (myId !== loopId) return;

    if (!lastTime) lastTime = now;
    const dtMs = now - lastTime;
    lastTime = now;

    // Cap dt to avoid huge jumps (e.g. after tab was inactive)
    const dt = Math.min(dtMs / 1000, 0.05);

    if (gameState.getMode() === "RUNNING") {
      gameState.update(dtMs);
      gameplayUpdate(dt);
    }

    render();

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}
