import { getInput } from "./inputs.js";
import { gameState } from "../core/state.js";
import powerupSystem from "./powerup-system.js";

// AABB collision (circle vs rect)
function rectCircleCollision(rect, ball) {
  const rectStart = rect.x;
  const rectEnd = rect.x + rect.width;
  const ballCenter = ball.x + ball.radius;
  const closestX = Math.max(rectStart, Math.min(ballCenter, rectEnd));
  const closestY = Math.max(
    rect.y,
    Math.min(ball.y + ball.radius, rect.y + rect.height),
  );

  const dx = ball.x + ball.radius - closestX;
  const dy = ball.y + ball.radius - closestY;

  return dx * dx + dy * dy < ball.radius * ball.radius;
}

// Ray vs AABB helper used by swept tests. p0/p1 are points {x,y} for the
// ball center. rect is axis-aligned box {x,y,width,height}.
function sweptPointAABB(p0, p1, rect) {
  const dirX = p1.x - p0.x;
  const dirY = p1.y - p0.y;

  const invDirX = dirX === 0 ? Infinity : 1 / dirX;
  const invDirY = dirY === 0 ? Infinity : 1 / dirY;

  const left = rect.x;
  const right = rect.x + rect.width;
  const top = rect.y;
  const bottom = rect.y + rect.height;

  let tx1 = (left - p0.x) * invDirX;
  let tx2 = (right - p0.x) * invDirX;
  let ty1 = (top - p0.y) * invDirY;
  let ty2 = (bottom - p0.y) * invDirY;

  const txMin = Math.min(tx1, tx2);
  const txMax = Math.max(tx1, tx2);
  const tyMin = Math.min(ty1, ty2);
  const tyMax = Math.max(ty1, ty2);

  const tEnter = Math.max(txMin, tyMin);
  const tExit = Math.min(txMax, tyMax);

  if (tEnter > tExit || tExit < 0 || tEnter > 1) return null;

  // normal: determine which slab produced entry
  let nx = 0;
  let ny = 0;
  if (txMin > tyMin) {
    // X slab
    nx = tx1 < tx2 ? -1 : 1;
  } else {
    // Y slab
    ny = ty1 < ty2 ? -1 : 1;
  }

  return { tEnter: Math.max(0, tEnter), tExit, nx, ny };
}

// Swept circle vs rect: expand rect by radius and perform swept-point test
// on the circle center moving from p0Center -> p1Center.
function sweptCircleRect(p0Center, p1Center, radius, rect) {
  const expanded = {
    x: rect.x - radius,
    y: rect.y - radius,
    width: rect.width + radius * 2,
    height: rect.height + radius * 2,
  };

  // If starting inside, report t=0 with a separation normal
  if (
    p0Center.x >= expanded.x &&
    p0Center.x <= expanded.x + expanded.width &&
    p0Center.y >= expanded.y &&
    p0Center.y <= expanded.y + expanded.height
  ) {
    const centerX = expanded.x + expanded.width / 2;
    const centerY = expanded.y + expanded.height / 2;
    const dx = p0Center.x - centerX;
    const dy = p0Center.y - centerY;
    if (Math.abs(dx) > Math.abs(dy))
      return { t: 0, nx: Math.sign(dx) || 1, ny: 0 };
    return { t: 0, nx: 0, ny: Math.sign(dy) || 1 };
  }

  const hit = sweptPointAABB(p0Center, p1Center, expanded);
  if (!hit) return null;
  return { t: hit.tEnter, nx: hit.nx, ny: hit.ny };
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
  const balls = gameState.getBalls();
  for (const ball of balls) {
    // If ball is attached to paddle, let it be positioned by move() and
    // skip swept collision for this frame.
    if (ball.attachedTo) {
      ball.move(dt);
      // attached balls shouldn't hit walls or bricks while attached
      continue;
    } else {
      const radius = ball.radius;
      const maxIters = 3;
      let iter = 0;
      // remaining time in seconds
      let remaining = dt;

      // start center
      let curCenter = { x: ball.x + radius, y: ball.y + radius };

      while (remaining > 0 && iter < maxIters) {
        iter++;

        const nextCenter = {
          x: curCenter.x + ball.speedX * remaining,
          y: curCenter.y + ball.speedY * remaining,
        };

        // find earliest collision among paddle + bricks
        let earliest = { t: 1.1, type: null, brickIndex: -1, nx: 0, ny: 0 };

        // paddle
        if (gameState.paddle) {
          const pBounds = gameState.paddle.getBounds();
          const paddleRect = rectFromBounds(pBounds);
          const pHit = sweptCircleRect(
            curCenter,
            nextCenter,
            radius,
            paddleRect,
          );
          if (pHit && pHit.t < earliest.t) {
            earliest = { t: pHit.t, type: "paddle", nx: pHit.nx, ny: pHit.ny };
          }
        }

        // bricks
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
          const hit = sweptCircleRect(curCenter, nextCenter, radius, rect);
          if (hit && hit.t < earliest.t) {
            earliest = {
              t: hit.t,
              type: "brick",
              brickIndex: i,
              nx: hit.nx,
              ny: hit.ny,
            };
          }
        }

        if (earliest.type === null) {
          // no collision this sub-step: move to nextCenter and finish
          ball.x = nextCenter.x - radius;
          ball.y = nextCenter.y - radius;
          curCenter = { ...nextCenter };
          remaining = 0;
          break;
        }

        // collision at fraction t of this remaining segment
        const t = Math.max(0, Math.min(1, earliest.t));
        const contact = {
          x: curCenter.x + (nextCenter.x - curCenter.x) * t,
          y: curCenter.y + (nextCenter.y - curCenter.y) * t,
        };

        // move ball to contact point (center -> translate back to top-left)
        const EPS = 0.001;
        ball.x = contact.x - radius + earliest.nx * EPS;
        ball.y = contact.y - radius + earliest.ny * EPS;
        // update current center
        curCenter = { x: ball.x + radius, y: ball.y + radius };

        // handle collision
        if (earliest.type === "paddle") {
          const pBounds = gameState.paddle.getBounds();
          const paddleRect = rectFromBounds(pBounds);
          if (gameState.paddle.sticky) {
            gameState.paddle.attachBall(ball, { force: true });
            // attach consumes the ball; stop processing further movement
            remaining = 0;
            break;
          } else {
            // reuse existing collision handling but compute based on contact
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

            // after reflecting/steering, continue with remaining time using new velocity
          }
        } else if (earliest.type === "brick") {
          // call hit on the brick (brickIndex refers to the bricks snapshot earlier)
          const bricksArr = gameState.getBricks();
          // the index i we stored corresponds to the bricks array at the time we scanned
          const idx = earliest.brickIndex;
          const brick = bricksArr[idx];
          if (brick) {
            const destroyed = brick.hit();
            // let ball handle pierce behaviour
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
              // remove the brick from current array
              bricksArr.splice(idx, 1);
              try {
                powerupSystem.trySpawnFromBrick(brick, { allowSpawn: true });
              } catch (e) {
                // eslint-disable-next-line no-console
                console.error("powerup spawn error", e);
              }
            }

            if (!pierced) {
              // reflect velocity based on normal
              if (earliest.nx !== 0) {
                if (typeof ball.bounceX === "function") ball.bounceX();
                else ball.speedX = -ball.speedX;
              }
              if (earliest.ny !== 0) {
                if (typeof ball.bounceY === "function") ball.bounceY();
                else ball.speedY = -ball.speedY;
              }
            }
            // if pierced, ball keeps its velocity and continues
          }
        }

        // update remaining time: fraction consumed is t, so remaining scales
        let consumed = t * remaining;
        // avoid zero-time consumption loops when t==0 by forcing a tiny step
        if (consumed <= 0) consumed = Math.min(remaining, 0.0001);
        remaining = Math.max(0, remaining - consumed);

        // prepare next sub-step: curCenter already set to contact center
        // nextCenter for the next loop will be computed from new speeds and remaining
      }
      // end swept loop
      // after movement this frame, check wall collisions as before
      const hit = ball.checkWallCollision(w, h);
      if (hit === "BOTTOM") {
        gameState.removeBall(ball);
        if (gameState.getBalls().length === 0) {
          gameState.loseLife();
          // eslint-disable-next-line no-console
          console.log("Ball lost! Lives remaining:", gameState.lives);
        }
        // move to next ball
        continue;
      }
    }
  }

  // update powerups (advance y, expiry, collision with paddle)
  try {
    powerupSystem.update(dt);
  } catch (e) {
    // don't let powerup update errors break the main loop
    // eslint-disable-next-line no-console
    console.error("powerupSystem update error", e);
  }
}
