import Powerup from "../entities/powerup.js";
import {
  POWERUP_CONFIG,
  POWERUP_SPAWN_SETTINGS,
  POWERUP_TYPES,
} from "../config/powerup-config.js";
import { gameState } from "../core/state.js";
import {
  getCurrentPaddle,
  getCurrentBricks,
  getCurrentLevel,
} from "../controllers/level-controller.js";
import { LevelSystem } from "./level-system.js";

const activePowerups = [];
const activeTimedEffects = [];

function getDropChance(brickType) {
  const base = Number(POWERUP_SPAWN_SETTINGS.baseDropChance) || 0;
  const mod = POWERUP_SPAWN_SETTINGS.perBrickTypeModifiers[brickType] ?? 1;
  return Math.min(1, Math.max(0, base * mod));
}

function pickWeightedPowerup() {
  const items = Object.keys(POWERUP_CONFIG).map((k) => ({
    type: k,
    weight: Number(POWERUP_CONFIG[k].weight) || 0,
  }));
  const filtered = items.filter((i) => i.weight > 0);
  const total = filtered.reduce((s, i) => s + i.weight, 0);
  if (total <= 0) return null;
  let r = Math.random() * total;
  for (const it of filtered) {
    r -= it.weight;
    if (r <= 0) return it.type;
  }
  return filtered[filtered.length - 1].type;
}

const handlers = new Map();
function registerHandler(type, fn) {
  handlers.set(type, fn);
}

function applyEffect(powerup) {
  const handler = handlers.get(powerup.type);
  const cfg = POWERUP_CONFIG[powerup.type] || {};
  const ctx = {
    gameState,
    cfg,
    getCurrentPaddle,
    getCurrentBricks,
    getCurrentLevel,
    spawnPowerup,
  };
  try {
    const res = handler ? handler(ctx, powerup) : null;
    if (res && typeof res.revert === "function") {
      const dur =
        typeof res.durationMs === "number"
          ? res.durationMs
          : cfg.durationMs || 0;
      activeTimedEffects.push({
        id: powerup.id,
        expireAt: performance.now() + dur,
        revert: res.revert,
      });
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("powerup handler error", e);
  }
}

// --- Handlers ---
registerHandler(POWERUP_TYPES.EXTRA_LIFE, ({ gameState }) => {
  gameState.lives = (gameState.lives || 0) + 1;
});

registerHandler(POWERUP_TYPES.SCORE_BONUS, ({ gameState, cfg }) => {
  const pts = Number(cfg.bonusPoints) || 500;
  gameState.addScore(pts);
});

registerHandler(POWERUP_TYPES.MULTI_BALL, ({ getCurrentPaddle }) => {
  const paddle = getCurrentPaddle();
  if (!paddle) return;
  const count = 2;
  for (let i = 0; i < count; i++) {
    const newBall = LevelSystem.createBall(paddle, gameState.container.height);
    gameState.addBall(newBall);
    const c =
      typeof document !== "undefined" &&
      document.getElementById("gameContainer");
    if (c && newBall.element) c.appendChild(newBall.element);
  }
});

registerHandler(POWERUP_TYPES.BOMB, ({ getCurrentBricks }, powerup) => {
  const bricks = getCurrentBricks();
  if (!bricks || bricks.length === 0) return;
  const radius = powerup.cfg.blastRadiusPx || 80;
  const centerX = powerup.x + powerup.size / 2;
  const centerY = powerup.y + powerup.size / 2;
  for (let i = bricks.length - 1; i >= 0; i--) {
    const b = bricks[i];
    if (!b || !b.isActive || !b.isActive()) continue;
    const bb = b.getBounds();
    const dx = bb.centerX - centerX;
    const dy = bb.centerY - centerY;
    if (dx * dx + dy * dy <= radius * radius) {
      try {
        b.destroy();
      } catch (e) {}
      bricks.splice(i, 1);
      gameState.addScore(b.getScore());
    }
  }
});

registerHandler(POWERUP_TYPES.PADDLE_EXPAND, ({ getCurrentPaddle, cfg }) => {
  const paddle = getCurrentPaddle();
  if (!paddle) return null;
  const prevWidth = paddle.width;
  const factor = Number(cfg.expandFactor) || 1.5;
  const newWidth = Math.round(prevWidth * factor);
  paddle.setWidth(newWidth);
  return {
    durationMs: cfg.durationMs || 15000,
    revert: () => {
      const p = getCurrentPaddle();
      if (p) p.setWidth(prevWidth);
    },
  };
});

registerHandler(POWERUP_TYPES.STICKY_PADDLE, ({ getCurrentPaddle, cfg }) => {
  const paddle = getCurrentPaddle();
  if (!paddle) return null;
  const dur = cfg.durationMs || 12000;
  paddle.setSticky(true, dur);
  return null;
});

function getCurrentBalls() {
  return gameState.getBalls ? gameState.getBalls() : [];
}

registerHandler(POWERUP_TYPES.BALL_PIERCE, ({ cfg }) => {
  const balls = getCurrentBalls();
  if (!balls || balls.length === 0) return;
  const add = Number(cfg.pierceHits) || 3;
  for (const b of balls) b.pierceRemaining = (b.pierceRemaining || 0) + add;
});

registerHandler(POWERUP_TYPES.SLOW_BALL, ({ cfg }) => {
  const balls = getCurrentBalls();
  if (!balls || balls.length === 0) return null;
  const factor = Number(cfg.slowFactor) || 0.6;
  const prev = [];
  for (const b of balls) {
    prev.push({ ball: b, speedX: b.speedX, speedY: b.speedY });
    b.speedX *= factor;
    b.speedY *= factor;
  }
  return {
    durationMs: cfg.durationMs || 10000,
    revert: () => {
      for (const p of prev) {
        if (p.ball) {
          p.ball.speedX = p.speedX;
          p.ball.speedY = p.speedY;
        }
      }
    },
  };
});

function spawnPowerup(type, x, y, { onCollect = null } = {}) {
  const container =
    typeof document !== "undefined" && document.getElementById("gameContainer");
  const p = new Powerup({
    type,
    x,
    y,
    parent:
      container || (typeof document !== "undefined" ? document.body : null),
    onCollect: (pw) => {
      applyEffect(pw);
      if (typeof onCollect === "function") onCollect(pw);
    },
  });
  activePowerups.push(p);
  return p;
}

export const powerupSystem = {
  update(dt) {
    const containerH =
      gameState.container.height ||
      (typeof document !== "undefined" &&
        document.documentElement.clientHeight) ||
      Infinity;
    for (let i = activePowerups.length - 1; i >= 0; i--) {
      const p = activePowerups[i];
      if (!p) continue;
      p.update(dt, {
        fallSpeedPxPerSec: POWERUP_SPAWN_SETTINGS.fallSpeedPxPerSec,
        containerHeight: containerH,
      });
      if (p.removed) {
        activePowerups.splice(i, 1);
        continue;
      }
      const paddle = getCurrentPaddle();
      if (paddle) {
        const pf = p.getBounds();
        const pad = paddle.getBounds ? paddle.getBounds() : paddle;
        if (
          !(
            pf.right < pad.left ||
            pf.left > pad.right ||
            pf.bottom < pad.top ||
            pf.top > pad.bottom
          )
        ) {
          p.collect();
          activePowerups.splice(i, 1);
        }
      }
    }
    const now = performance.now();
    for (let i = activeTimedEffects.length - 1; i >= 0; i--) {
      const t = activeTimedEffects[i];
      if (now >= t.expireAt) {
        try {
          if (typeof t.revert === "function") t.revert();
        } catch (e) {
          console.error("timed effect revert error", e);
        }
        activeTimedEffects.splice(i, 1);
      }
    }
  },
  trySpawnFromBrick(brick, { allowSpawn = true } = {}) {
    if (!allowSpawn) return null;
    if (!brick || !brick.getBounds) return null;
    if (
      activePowerups.length >=
      (POWERUP_SPAWN_SETTINGS.maxSimultaneousPowerups || 5)
    )
      return null;
    const chance = getDropChance(brick.type);
    if (Math.random() >= chance) return null;
    const picked = pickWeightedPowerup();
    if (!picked) return null;
    const b = brick.getBounds();
    const x = b.centerX - (POWERUP_CONFIG[picked].sizePx || 28) / 2;
    const y = b.bottom;
    return spawnPowerup(picked, x, y);
  },
  spawnPowerup(type, x, y) {
    return spawnPowerup(type, x, y);
  },
  _getActive: () => activePowerups.slice(),
  _getTimed: () => activeTimedEffects.slice(),
};

export default powerupSystem;
