import { gameState } from "../core/state.js";
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
  if (gameState.mode !== "RUNNING") return;

  const { w, h } = getGameBounds();
  const keys = getInput();

  /* -------- Player Movement -------- */
  if (keys["ArrowLeft"] || keys["KeyW"]) {
    gameState.paddle.x -= gameState.paddle.speed * dt;
  }
  if (keys["ArrowRight"] || keys["KeyS"]) {
    gameState.paddle.x += gameState.paddle.speed * dt;
  }

  // Clamp player inside game
  gameState.paddle.x = Math.max(0, Math.min(w - gameState.paddle.width, gameState.paddle.x));

  /* -------- gameState.ball Movement -------- */
  gameState.ball.x += gameState.ball.speedX * dt;
  gameState.ball.y += gameState.ball.speedY * dt;
  //
  /* -------- Wall Collisions -------- */
  if (gameState.ball.y <= 0) {
    gameState.ball.y = 0;
    gameState.ball.speedY *= -1;
  }
  if (gameState.ball.y >= h - gameState.ball.radius * 2) {
    gameState.ball.y = h - gameState.ball.radius * 2;
    gameState.ball.speedY *= -1;
  }

  if (gameState.ball.x >= w - gameState.ball.radius * 2) {
    gameState.ball.x = w - gameState.ball.radius * 2;
    gameState.ball.speedX *= -1;
  }

  /* -------- gameState.paddle Collision -------- */
  if (rectCircleCollision(gameState.paddle, gameState.ball)) {

    // Push gameState.ball out
    // gameState.ball.x = gameState.paddle.x + gameState.paddle.width;

    // Calculate hit position (-1 to 1)
    const hitPos = ((gameState.ball.y + gameState.ball.radius) - (gameState.paddle.y + gameState.paddle.height / 2)) / (gameState.paddle.height / 2);

    // Angle reflection
    const speed = Math.hypot(gameState.ball.speedX, gameState.ball.speedY);
    const angle = hitPos * (Math.PI / 3); // max 60° angle

    gameState.ball.speedX = Math.cos(angle) * speed;
    gameState.ball.speedY = Math.sin(angle) * speed;
  }
}
