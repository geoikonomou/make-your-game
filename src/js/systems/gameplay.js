import { getInput } from "./inputs.js";
import { gameState } from "../core/state.js";

// AABB collision (circle vs rect)
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

function rectFromBounds(b) {
  return {
    x: b.left,
    y: b.top,
    width: b.width ?? b.right - b.left,
    height: b.height ?? b.bottom - b.top,
  };
}

// compute collision metrics used to decide axis and penetration
function collisionInfo(rect, ball) {
  const ballCenterX = ball.x + ball.radius;
  const ballCenterY = ball.y + ball.radius;
  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;

  const dx = ballCenterX - centerX;
  const dy = ballCenterY - centerY;

  const overlapX = Math.abs(dx) - (rect.width / 2 + ball.radius);
  const overlapY = Math.abs(dy) - (rect.height / 2 + ball.radius);

  const axis = Math.abs(overlapX) < Math.abs(overlapY) ? "x" : "y";
  return {
    dx,
    dy,
    overlapX,
    overlapY,
    axis,
    ballCenterX,
    ballCenterY,
    centerX,
    centerY,
  };
}

function reflectAxis(ball, axis) {
  if (axis === "x") {
    if (typeof ball.bounceX === "function") ball.bounceX();
    else ball.speedX = -ball.speedX;
  } else {
    if (typeof ball.bounceY === "function") ball.bounceY();
    else ball.speedY = -ball.speedY;
  }
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

  const balls = gameState.getBalls().slice();

  for (const ball of balls) {
    // -------- SUB STEPPING --------
    const maxStep = 1 / 240; // internal physics at 240hz
    let remaining = dt;

    while (remaining > 0) {
      const step = Math.min(maxStep, remaining);

      ball.move(step);

      /* -------- WALL COLLISION -------- */
      const hit = ball.checkWallCollision(w, h);
      if (hit === "BOTTOM") {
        gameState.removeBall(ball);
        if (gameState.getBalls().length === 0) {
          gameState.loseLife();
          console.log("Ball lost! Lives remaining:", gameState.lives);
        }
        break;
      }

      /* -------- PADDLE COLLISION -------- */
      if (gameState.paddle) {
        const pBounds = gameState.paddle.getBounds();
        const paddleRect = {
          x: pBounds.left,
          y: pBounds.top,
          width: pBounds.right - pBounds.left,
          height: pBounds.bottom - pBounds.top,
        };

        if (rectCircleCollision(paddleRect, ball)) {
          const info = collisionInfo(paddleRect, ball);

          if (info.axis === "x") {
            const penetration =
              paddleRect.width / 2 + ball.radius - Math.abs(info.dx);

            const sign = info.dx > 0 ? 1 : -1;
            ball.x += sign * penetration;
            ball.bounceX();
          } else {
            const penetration =
              paddleRect.height / 2 + ball.radius - Math.abs(info.dy);

            const sign = info.dy > 0 ? 1 : -1;
            ball.y += sign * penetration;
            ball.bounceY();
          }
        }
      }

      /* -------- BRICK COLLISION -------- */
      const bricks = gameState.getBricks();

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

        let pierced = false;
        if (ball.onBrickHit) {
          const res = ball.onBrickHit(brick) || {};
          pierced = !!res.pierced;
        }

        gameState.addScore(brick.getScore());

        if (destroyed) {
          bricks.splice(i, 1);
        }

        if (!pierced) {
          // ----- Penetration Resolution -----
          const ballCenterX = ball.x + ball.radius;
          const ballCenterY = ball.y + ball.radius;
          const brickCenterX = rect.x + rect.width / 2;
          const brickCenterY = rect.y + rect.height / 2;

          const dx = ballCenterX - brickCenterX;
          const dy = ballCenterY - brickCenterY;

          const penetrationX = rect.width / 2 + ball.radius - Math.abs(dx);
          const penetrationY = rect.height / 2 + ball.radius - Math.abs(dy);

          if (penetrationX < penetrationY) {
            const sign = dx > 0 ? 1 : -1;
            ball.x += sign * penetrationX;
            ball.bounceX();
          } else {
            const sign = dy > 0 ? 1 : -1;
            ball.y += sign * penetrationY;
            ball.bounceY();
          }

          break; // only one brick per sub-step
        }
      }

      remaining -= step;
    }
  }
}
