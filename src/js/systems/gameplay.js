import { gameState } from "../core/state.js";
import { getInput } from "./inputs.js";



// AABB collision
function rectCircleCollision(rect, ball) {
  const closestX = Math.max(rect.x, Math.min(ball.x + ball.radius, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(ball.y + ball.radius, rect.y + rect.height));

  const dx = (ball.x + ball.radius) - closestX;
  const dy = (ball.y + ball.radius) - closestY;

  return (dx * dx + dy * dy) < (ball.radius * ball.radius);
}

export function update(dt) {
  if (gameState.mode !== "RUNNING") return;

  const w = gameState.container.width;
  const h = gameState.container.height;

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
  if (gameState.ball.x <= 0) {
    gameState.ball.x = 0;
    gameState.ball.speedX *= -1;
  }

  // this is a different approach based on vactor(more physical feel, needs adjustments for the speed, not sure if its worth it)
  // if (rectCircleCollision(gameState.paddle, gameState.ball)) {
  //   // Push gameState.ball above gameState.paddle
  //   gameState.ball.y = gameState.paddle.y - gameState.ball.radius * 2;
  //
  //   // gameState.paddle normal
  //   const N = { x: 0, y: -1 };
  //
  //   // Incoming velocity
  //   const V_in = { x: gameState.ball.speedX, y: gameState.ball.speedY };
  //
  //   // Dot product
  //   const dot = V_in.x * N.x + V_in.y * N.y;
  //
  //   // Reflect along normal
  //   let V_out = {
  //     x: V_in.x - 2 * dot * N.x,
  //     y: V_in.y - 2 * dot * N.y
  //   };
  //
  //   // Optional: tweak horizontal based on hit position
  //   const hitPos = ((gameState.ball.x + gameState.ball.radius) - (gameState.paddle.x + gameState.paddle.width / 2)) / (gameState.paddle.width / 2);
  //   const maxTweak = 0.5; // fraction of speed
  //   V_out.x += hitPos * Math.hypot(V_out.x, V_out.y) * maxTweak;
  //
  //   // Apply new velocity
  //   gameState.ball.speedX = V_out.x;
  //   gameState.ball.speedY = V_out.y;
  // }
  //

  if (rectCircleCollision(gameState.paddle, gameState.ball)) {
    // Push gameState.ball above gameState.paddle
    gameState.ball.y = gameState.paddle.y - gameState.ball.radius * 2;

    // Hit position relative to gameState.paddle center
    let hitPos = ((gameState.ball.x + gameState.ball.radius) - (gameState.paddle.x + gameState.paddle.width / 2)) / (gameState.paddle.width / 2);
    hitPos = Math.max(-1, Math.min(1, hitPos));

    // Speed and reflection
    const speed = Math.hypot(gameState.ball.speedX, gameState.ball.speedY);

    const maxXRatio = 0.8;
    gameState.ball.speedX = hitPos * speed * maxXRatio;
    gameState.ball.speedY = -Math.sqrt(speed * speed - gameState.ball.speedX * gameState.ball.speedX); // keep total speed constant
  }
}
