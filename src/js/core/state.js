import {
  getCurrentPaddle,
  getCurrentBall,
  getCurrentBricks,
  getCurrentLevel,
} from "../controllers/level-controller.js";

export class GameState {
  constructor() {
    this.mode = "INIT"; // INIT || READY || RUNNING || PAUSED || GAME_OVER

    this.container = { width: 0, height: 0 };

    // Entities
    this.paddle = null;
    // Primary ball kept for backward compatibility; balls[] is the authoritative list
    this.ball = null;
    this.balls = [];
    this.bricks = [];

    // Progress / HUD
    this.level = 1;
    this.score = 0;
    this.lives = 3;

    // Timing
    this.timeStarted = null;
    this.elapsedMs = 0;
  }

  // Accepts a Ball instance or an array of Ball instances as first arg
  setEntities(ballOrBalls, paddle, bricks) {
    if (Array.isArray(ballOrBalls)) {
      this.balls = ballOrBalls.slice();
      this.ball = this.balls[0] || null;
    } else if (ballOrBalls) {
      this.balls = [ballOrBalls];
      this.ball = ballOrBalls;
    } else {
      this.balls = [];
      this.ball = null;
    }

    this.paddle = paddle || null;
    this.bricks = bricks || [];
  }

  addBall(ball) {
    if (!ball) return;
    this.balls.push(ball);
    if (!this.ball) this.ball = ball;
  }

  removeBall(ball) {
    const idx = this.balls.indexOf(ball);
    if (idx >= 0) this.balls.splice(idx, 1);
    if (this.ball === ball) this.ball = this.balls[0] || null;
  }

  getBalls() {
    return this.balls;
  }

  getPaddle() {
    return this.paddle;
  }

  getBricks() {
    return this.bricks;
  }

  getPrimaryBall() {
    return this.ball;
  }

  setContainerSize(width, height) {
    this.container.width = width;
    this.container.height = height;
  }

  // backwards-compatible name
  loselife() {
    this.lives = Math.max(0, this.lives - 1);
    if (this.lives <= 0) this.mode = "GAME_OVER";
  }

  // newer camelCase
  loseLife() {
    return this.loselife();
  }

  addScore(points) {
    this.score += Number(points) || 0;
  }

  setLevel(level) {
    this.level = level;
  }

  setMode(mode) {
    this.mode = mode;
  }

  getMode() {
    return this.mode;
  }

  // dtMs: milliseconds since last tick — used to advance time-based effects
  update(dtMs = 0) {
    // expire paddle sticky powerup if present
    if (this.paddle && this.paddle.stickyExpires) {
      if (performance.now() >= this.paddle.stickyExpires) {
        this.paddle.setSticky(false);
        this.paddle.stickyExpires = null;
      }
    }

    if (this.timeStarted) this.elapsedMs = performance.now() - this.timeStarted;
  }

  // Populate the singleton state from the currently-loaded level entities
  resetForLevel(levelNumber = 1, DOM = null) {
    this.level = levelNumber;
    this.score = 0;
    this.timeStarted = performance.now();

    const bricks = getCurrentBricks() || [];
    const paddle = getCurrentPaddle() || null;
    const rawBall = getCurrentBall();
    const balls = Array.isArray(rawBall) ? rawBall : rawBall ? [rawBall] : [];

    this.setEntities(balls, paddle, bricks);

    if (DOM && DOM.container) {
      this.setContainerSize(
        DOM.container.clientWidth,
        DOM.container.clientHeight,
      );
    } else {
      const c =
        typeof document !== "undefined" &&
        document.getElementById("gameContainer");
      if (c) this.setContainerSize(c.clientWidth, c.clientHeight);
    }

    this.mode = "READY";
  }
}

export const gameState = new GameState();

export function createGameState(DOM = null) {
  // convenience wrapper to initialize the singleton from the active level
  const level = getCurrentLevel();
  gameState.resetForLevel(level || 1, DOM);
  return gameState;
}
