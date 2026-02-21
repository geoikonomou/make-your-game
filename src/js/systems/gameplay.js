import { getInput } from "./inputs.js";
import { gameState } from "../core/state.js";

const SUBSTEPS = 5;

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
    const subDt = dt / SUBSTEPS;
    let hitBottom = false;

    for (let step = 0; step < SUBSTEPS; step++) {
      ball.move(subDt);

      const hit = ball.checkWallCollision(w, h);
      if (hit === "BOTTOM") {
        hitBottom = true;
        break;
      }

      // ---- Brick collisions ----
      // Two-pass: scan first (no side effects), then act on one brick only.
      const bricks = gameState.getBricks();

      // Pass 1: find the single closest colliding brick
      let bestIndex = -1;
      let bestDist = Infinity;

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

        const brickCX = b.left + (b.right - b.left) / 2;
        const brickCY = b.top + (b.bottom - b.top) / 2;
        const dist = Math.hypot(
          ball.x + ball.radius - brickCX,
          ball.y + ball.radius - brickCY,
        );

        if (dist < bestDist) {
          bestDist = dist;
          bestIndex = i;
        }
      }

      // Pass 2: process the single chosen brick
      if (bestIndex !== -1) {
        const brick = bricks[bestIndex];
        const b = brick.getBounds();

        const destroyed = brick.hit();

        let pierced = false;
        if (ball.onBrickHit) {
          try {
            const res = ball.onBrickHit(brick) || {};
            pierced = !!res.pierced;
          } catch (e) {
            // ignore
          }
        }

        gameState.addScore(brick.getScore());

        if (destroyed) {
          bricks.splice(bestIndex, 1);
        }

        if (!pierced) {
          const ballCenterX = ball.x + ball.radius;
          const ballCenterY = ball.y + ball.radius;
          const brickCenterX = b.left + (b.right - b.left) / 2;
          const brickCenterY = b.top + (b.bottom - b.top) / 2;

          const dx = ballCenterX - brickCenterX;
          const dy = ballCenterY - brickCenterY;

          const overlapX =
            Math.abs(dx) - ((b.right - b.left) / 2 + ball.radius);
          const overlapY =
            Math.abs(dy) - ((b.bottom - b.top) / 2 + ball.radius);

          if (Math.abs(overlapX) < Math.abs(overlapY)) {
            if (typeof ball.bounceX === "function") ball.bounceX();
            else ball.speedX = -ball.speedX;
            ball.x +=
              dx > 0 ? Math.abs(overlapX) + 1 : -(Math.abs(overlapX) + 1);
          } else {
            if (typeof ball.bounceY === "function") ball.bounceY();
            else ball.speedY = -ball.speedY;
            ball.y +=
              dy > 0 ? Math.abs(overlapY) + 1 : -(Math.abs(overlapY) + 1);
          }

          // Velocity changed — stop sub-stepping, paddle check runs next
          break;
        }
        // pierced: continue sub-stepping through the brick
      }
    }

    if (hitBottom) {
      gameState.removeBall(ball);
      if (gameState.getBalls().length === 0) {
        gameState.loseLife();
        console.log("Ball lost! Lives remaining:", gameState.lives);
      }
      continue;
    }

    // ---- Paddle collision (outside substep loop) ----

    if (gameState.paddle) {
      const pBounds = gameState.paddle.getBounds();
      const paddleRect = rectFromBounds(pBounds);
      if (rectCircleCollision(paddleRect, ball)) {
        if (gameState.paddle.sticky) {
          gameState.paddle.attachBall(ball, { force: true });
        } else {
          const info = collisionInfo(paddleRect, ball);
          if (info.axis === "x") {
            const maxYRatio = 0.8;
            const speed = ball.getSpeed();

            let hitPosY =
              (info.ballCenterY - info.centerY) / (paddleRect.height / 2);
            hitPosY = Math.max(-1, Math.min(1, hitPosY));

            const paddleBottom = paddleRect.y + paddleRect.height;
            const bottomBuffer = 30;
            const maxYRatioEffective =
              hitPosY > 0 && paddleBottom > h - bottomBuffer
                ? Math.min(0.5, maxYRatio)
                : maxYRatio;

            const newSpeedY = hitPosY * speed * maxYRatioEffective;
            const horizMag = Math.sqrt(
              Math.max(1, speed * speed - newSpeedY * newSpeedY),
            );
            const horizSign = info.dx > 0 ? 1 : -1;

            ball.speedX = horizSign * horizMag;
            ball.speedY = newSpeedY;
          } else {
            let hitPos =
              (ball.x + ball.radius - (paddleRect.x + paddleRect.width / 2)) /
              (paddleRect.width / 2);
            hitPos = Math.max(-1, Math.min(1, hitPos));
            const speed = ball.getSpeed();
            const maxXRatio = 0.8;
            ball.speedX = hitPos * speed * maxXRatio;
            ball.speedY = -Math.sqrt(
              Math.max(1, speed * speed - ball.speedX * ball.speedX),
            );
          }
        }
      }
    }
  }
}
