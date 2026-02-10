import { World, GameState } from "../core/state.js";
import { getInput } from "./inputs.js";

let gameEl = null;

function getGameBounds() {
  if (!gameEl) gameEl = document.getElementById("gameContainer");
  return {
    w: gameEl.clientWidth,
    h: gameEl.clientHeight
  };
}

// AABB collision
function rectCircleCollision(rect, ball) {
  const closestX = Math.max(rect.x, Math.min(ball.x + ball.r, rect.x + rect.w));
  const closestY = Math.max(rect.y, Math.min(ball.y + ball.r, rect.y + rect.h));

  const dx = (ball.x + ball.r) - closestX;
  const dy = (ball.y + ball.r) - closestY;

  return (dx * dx + dy * dy) < (ball.r * ball.r);
}

export function update(dt) {
  if (GameState.mode !== "RUNNING") return;

  const { ball, player } = World;
  const { w, h } = getGameBounds();
  const keys = getInput();

  /* -------- Player Movement -------- */
  if (keys["ArrowLeft"] || keys["KeyW"]) {
    player.x -= player.speed * dt;
  }
  if (keys["ArrowRight"] || keys["KeyS"]) {
    player.x += player.speed * dt;
  }

  // Clamp player inside game
  player.y = Math.max(0, Math.min(h - player.h, player.y));

  /* -------- Ball Movement -------- */
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  /* -------- Wall Collisions -------- */
  if (ball.y <= 0) {
    ball.y = 0;
    ball.vy *= -1;
  }
  if (ball.y >= h - ball.r * 2) {
    ball.y = h - ball.r * 2;
    ball.vy *= -1;
  }

  if (ball.x >= w - ball.r * 2) {
    ball.x = w - ball.r * 2;
    ball.vx *= -1;
  }

  /* -------- Player Collision -------- */
  if (rectCircleCollision(player, ball)) {

    // Push ball out
    ball.x = player.x + player.w;

    // Calculate hit position (-1 to 1)
    const hitPos = ((ball.y + ball.r) - (player.y + player.h / 2)) / (player.h / 2);

    // Angle reflection
    const speed = Math.hypot(ball.vx, ball.vy);
    const angle = hitPos * (Math.PI / 3); // max 60° angle

    ball.vx = Math.cos(angle) * speed;
    ball.vy = Math.sin(angle) * speed;
  }
}
