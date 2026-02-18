export const PADDLE_TYPES = {
  NORMAL: "normal",
  WIDE: "wide",
  NARROW: "narrow",
};

export const DEFAULT_PADDLE_TYPE = PADDLE_TYPES.NORMAL;
export const DEFAULT_PADDLE_BOTTOM_OFFSET = 30;

export const PADDLE_CONFIG = {
  [PADDLE_TYPES.NORMAL]: {
    widthFraction: 0.13,
    height: 15,
    speed: 600,
    sticky: false,
    description: "Standard paddle",
  },

  [PADDLE_TYPES.WIDE]: {
    widthFraction: 0.3,
    height: 15,
    speed: 520,
    sticky: false,
    description: "Wider paddle",
  },

  [PADDLE_TYPES.NARROW]: {
    widthFraction: 0.14,
    height: 15,
    speed: 720,
    sticky: false,
    description: "Narrow paddle",
  },
};

export const PADDLE_LIMITS = {
  minWidthPx: 60,
  maxWidthFraction: 0.5,
};
