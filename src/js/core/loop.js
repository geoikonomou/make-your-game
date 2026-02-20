import { update as gameplayUpdate } from "../systems/gameplay.js";
import { render } from "../systems/render.js";
import { gameState } from "./state.js";

let lastTime;
let reqAnimFrameID = null;

export function startLoop() {
  if (reqAnimFrameID !== null) {
    cancelAnimationFrame(reqAnimFrameID);
    reqAnimFrameID = null;
  }

  function loop(now) {
    if (!lastTime) lastTime = now;
    const dtMs = now - lastTime;
    lastTime = now;
    // Cap dt to avoid huge jumps (e.g. after tab was inactive)
    const dt = Math.min(dtMs / 1000, 0.05);
    if (gameState.getMode() === "RUNNING") {
      gameplayUpdate(dt);
    }
    render();
    reqAnimFrameID = requestAnimationFrame(loop);
  }

  reqAnimFrameID = requestAnimationFrame(loop);
}

export function stopLoop() {
  if (reqAnimFrameID !== null) {
    cancelAnimationFrame(reqAnimFrameID);
    reqAnimFrameID = null;
  }
  lastTime = null;
}
