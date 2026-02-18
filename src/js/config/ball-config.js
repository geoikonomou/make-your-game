export const BALL_TYPES = {
  NORMAL: "normal",
  FAST: "fast",
  PIERCE: "pierce",
  MULTI: "multi",
  HEAVY: "heavy",
};

export const DEFAULT_BALL_FROM_PADDLE = 10;
export const DEFAULT_BALL_TYPE = BALL_TYPES.NORMAL;

export const BALL_CONFIG = {
  [BALL_TYPES.NORMAL]: {
    speedMultiplier: 1.0,
    radius: 6,
    pierce: 0,
    spawn: 0,
    extraDamage: 0,
    description: "Standard ball",
  },

  [BALL_TYPES.FAST]: {
    speedMultiplier: 1.6,
    radius: 5,
    pierce: 0,
    spawn: 0,
    extraDamage: 0,
    description: "Faster, slightly smaller ball",
  },

  [BALL_TYPES.PIERCE]: {
    speedMultiplier: 1.0,
    radius: 6,
    pierce: 3,
    spawn: 0,
    extraDamage: 0,
    description: "Can pierce several bricks before reflecting",
  },

  [BALL_TYPES.MULTI]: {
    speedMultiplier: 1.0,
    radius: 5,
    pierce: 0,
    spawn: 2,
    extraDamage: 0,
    description: "Spawns additional balls (power-up)",
  },
  [BALL_TYPES.HEAVY]: {
    speedMultiplier: 0.9,
    radius: 7,
    pierce: 0,
    spawn: 0,
    extraDamage: 1,
    description: "Heavy ball that deals extra damage",
  },
};

export const MAX_BALLS = 5;
