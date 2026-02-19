import { getInput } from "./inputs.js";
import { gameState } from "../core/state.js";
import { LevelSystem } from "./level-system.js";
import { BRICK_TYPES } from "../config/brick-config.js";

/**
 * Respawn a new ball on the paddle after losing a life.
 */
function respawnBall() {
  const paddle = gameState.getPaddle();
  if (!paddle) return;

  const containerH = gameState.container.height;
  const newBall = LevelSystem.createBall(paddle, containerH);

  // Add the new ball element into the game container
  const container = document.getElementById("gameContainer");
  if (container && newBall.element) {
    container.appendChild(newBall.element);
  }

  gameState.addBall(newBall);
  // Pause so the player can prepare — Space to resume
  gameState.setMode("PAUSED");
}

// AABB collision
function rectCircleCollision(rect, ball) {
  const closestX = Math.max(
    rect.x,
    Math.min(ball.x + ball.radius, rect.x + rect.width),
  );
  const closestY = Math.max(
    rect.y,
    Math.min(ball.y + ball.radius, rect.y + rect.height),
  );

  const dx = ball.x + ball.radius - closestX;
  const dy = ball.y + ball.radius - closestY;

  return dx * dx + dy * dy < ball.radius * ball.radius;
}

export function update(dt) {
  if (gameState.getMode() !== "RUNNING") return;

  const w = gameState.container.width;
  const h = gameState.container.height;

  const keys = getInput();

  /* -------- Paddle Movement -------- */
  if ((keys["ArrowLeft"] || keys["KeyW"]) && gameState.paddle) {
    gameState.paddle.moveLeft(dt);
  }
  if ((keys["ArrowRight"] || keys["KeyS"]) && gameState.paddle) {
    gameState.paddle.moveRight(dt);
  }

  if (gameState.paddle) gameState.paddle.hitBorders(w);

  // Iterate balls array (make a copy because we may modify it during loop)
  const balls = gameState.getBalls().slice();
  for (const ball of balls) {
    ball.move(dt);

    const hit = ball.checkWallCollision(w, h);
    if (hit === "BOTTOM") {
      // remove ball element from DOM
      if (ball.element && ball.element.parentNode) {
        ball.element.remove();
      }
      // remove ball and handle life loss if no balls remain
      gameState.removeBall(ball);
      if (gameState.getBalls().length === 0) {
        gameState.loseLife();
        console.log("Ball lost! Lives remaining:", gameState.lives);

        if (gameState.lives > 0) {
          // Respawn a new ball on the paddle
          respawnBall();
        } else {
          // Game over — save high score
          const stored = parseInt(localStorage.getItem("highScore") || "0", 10);
          if (gameState.score > stored) {
            localStorage.setItem("highScore", gameState.score.toString());
          }
          gameState.setMode("GAME_OVER");
          console.log("GAME OVER! Final score:", gameState.score);
        }
      }
      continue;
    }

    // paddle collision
    if (gameState.paddle && rectCircleCollision(gameState.paddle, ball)) {
      console.log("Paddle hit!");
      // if paddle sticky, attach
      if (gameState.paddle.sticky) {
        gameState.paddle.attachBall(ball, { force: true });
      } else {
        // reflect based on hit position
        ball.y = gameState.paddle.y - ball.radius * 2;
        let hitPos =
          (ball.x +
            ball.radius -
            (gameState.paddle.x + gameState.paddle.width / 2)) /
          (gameState.paddle.width / 2);
        hitPos = Math.max(-1, Math.min(1, hitPos));

        const speed = ball.getSpeed();
        const maxXRatio = 0.8;
        ball.speedX = hitPos * speed * maxXRatio;
        ball.speedY = -Math.sqrt(
          Math.max(1, speed * speed - ball.speedX * ball.speedX),
        );
      }
    }

    // TODO: brick collisions
    // Brick collisions — iterate bricks and test collision against each active brick
    const bricks = gameState.getBricks();
    // iterate backwards so removals are safe
    for (let i = bricks.length - 1; i >= 0; i--) {
      const brick = bricks[i];
      if (!brick || !brick.isActive || !brick.isActive()) continue;

      const b = brick.getBounds();
      const rect = {
        x: b.left,
        y: b.top,
        width: b.right - b.left,
        height: b.bottom - b.top,
      };

      if (!rectCircleCollision(rect, ball)) continue;

      const destroyed = brick.hit();

      // let ball handle pierce behaviour (returns { pierced: true } or similar)
      let pierced = false;
      if (ball.onBrickHit) {
        try {
          const res = ball.onBrickHit(brick) || {};
          pierced = !!res.pierced;
        } catch (e) {
          // ignore
        }
      }

      // award score
      gameState.addScore(brick.getScore());

      // if destroyed, remove from game state and call destroy() already called inside brick.hit()
      if (destroyed) {
        bricks.splice(i, 1);
      }

      // if the ball didn't pierce, reflect based on collision axis and stop checking more bricks
      if (!pierced) {
        // determine bounce axis by comparing penetration on X and Y
        const ballCenterX = ball.x + ball.radius;
        const ballCenterY = ball.y + ball.radius;
        const brickCenterX = b.left + (b.right - b.left) / 2;
        const brickCenterY = b.top + (b.bottom - b.top) / 2;

        const dx = ballCenterX - brickCenterX;
        const dy = ballCenterY - brickCenterY;

        const overlapX = Math.abs(dx) - ((b.right - b.left) / 2 + ball.radius);
        const overlapY = Math.abs(dy) - ((b.bottom - b.top) / 2 + ball.radius);

        // whichever overlap is smaller (more negative) is the axis of collision
        if (Math.abs(overlapX) < Math.abs(overlapY)) {
          // reflect X
          if (typeof ball.bounceX === "function") ball.bounceX();
          else ball.speedX = -ball.speedX;
        } else {
          // reflect Y
          if (typeof ball.bounceY === "function") ball.bounceY();
          else ball.speedY = -ball.speedY;
        }

        // stop after first non-pierce collision for this ball
        break;
      }
      // if pierced, continue checking other bricks
    }
  }

  // --- Win check: all breakable bricks destroyed ---
  const remainingBricks = gameState.getBricks();
  const breakableLeft = remainingBricks.some(
    (b) => b.isActive() && b.type !== BRICK_TYPES.UNBREAKABLE,
  );
  if (!breakableLeft) {
    // Save high score
    const stored = parseInt(localStorage.getItem("highScore") || "0", 10);
    if (gameState.score > stored) {
      localStorage.setItem("highScore", gameState.score.toString());
    }
    gameState.setMode("PAUSED");
    console.log(`Level ${gameState.level} complete! Score: ${gameState.score}`);
  }
}
