import { BRICK_TYPES } from "./brick-config.js";

export const POWERUP_TYPES = {
  EXTRA_LIFE: "extra_life",
  PADDLE_EXPAND: "paddle_expand",
  STICKY_PADDLE: "sticky_paddle",
  MULTI_BALL: "multi_ball",
  BALL_PIERCE: "ball_pierce",
  SLOW_BALL: "slow_ball",
  SCORE_BONUS: "score_bonus",
  BOMB: "bomb",
};

export const POWERUP_CONFIG = {
  // instant effects
  [POWERUP_TYPES.EXTRA_LIFE]: {
    label: "Extra Life",
    description: "Grants one additional life immediately",
    category: "instant",
    durationMs: 0,
    weight: 1,
    iconClass: "powerup--life",
  },

  [POWERUP_TYPES.SCORE_BONUS]: {
    label: "Score Bonus",
    description: "Award immediate bonus points",
    category: "instant",
    bonusPoints: 500,
    durationMs: 0,
    weight: 6,
    iconClass: "powerup--score",
  },

  [POWERUP_TYPES.MULTI_BALL]: {
    label: "Multi Ball",
    description: "Spawn additional balls from the paddle",
    category: "instant",
    durationMs: 0,
    weight: 3,
    iconClass: "powerup--multi",
  },

  [POWERUP_TYPES.BOMB]: {
    label: "Bomb",
    description: "Destroy nearby bricks instantly",
    category: "instant",
    blastRadiusPx: 80,
    durationMs: 0,
    weight: 0.5,
    iconClass: "powerup--bomb",
  },

  // timed effects (systems must manage expiry)
  [POWERUP_TYPES.PADDLE_EXPAND]: {
    label: "Paddle Expand",
    description: "Increase paddle width for a short time",
    category: "timed",
    durationMs: 15000,
    weight: 4,
    iconClass: "powerup--expand",
  },

  [POWERUP_TYPES.STICKY_PADDLE]: {
    label: "Sticky Paddle",
    description: "Ball sticks to paddle on contact for a time",
    category: "timed",
    durationMs: 12000,
    weight: 3,
    iconClass: "powerup--sticky",
  },

  [POWERUP_TYPES.BALL_PIERCE]: {
    label: "Piercing Ball",
    description: "Balls can pass through multiple bricks for a time",
    category: "timed",
    durationMs: 10000,
    weight: 2,
    iconClass: "powerup--pierce",
  },

  [POWERUP_TYPES.SLOW_BALL]: {
    label: "Slow Ball",
    description: "Reduce ball speed temporarily for easier control",
    category: "timed",
    durationMs: 10000,
    weight: 2,
    iconClass: "powerup--slow",
  },
};

// global spawning & behavior settings
export const POWERUP_SPAWN_SETTINGS = {
  baseDropChance: 0.1, // 10% base chance that a destroyed brick will drop a powerup
  perBrickTypeModifiers: {
    [BRICK_TYPES.NORMAL]: 1, // normal bricks: 10% * 1 = 10%
    [BRICK_TYPES.HARD]: 1.5, // hard bricks: 10% * 1.5 = 15%
    [BRICK_TYPES.UNBREAKABLE]: 0, // unbreakable: never drop
  },
  maxSimultaneousPowerups: 5, // avoid screen clutter
  fallSpeedPxPerSec: 120, // how fast powerups fall
  autoExpireIfUncollectedMs: 15000, // remove powerup if not collected
};
