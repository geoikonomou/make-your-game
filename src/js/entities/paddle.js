import {
  PADDLE_CONFIG,
  DEFAULT_PADDLE_TYPE,
  PADDLE_LIMITS,
} from "../config/paddle-config.js";

export class Paddle {
  constructor({
    x = 0,
    y = 0,
    width = 100,
    height = 15,
    speed = 600,
    type = DEFAULT_PADDLE_TYPE,
    sticky = false,
  } = {}) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.vx = 0;
    this.type = type;
    this.config =
      PADDLE_CONFIG[this.type] || PADDLE_CONFIG[DEFAULT_PADDLE_TYPE];
    this.sticky = Boolean(sticky || this.config.sticky);
    this.attachedBall = null;
    this.stickyExpires = null;

    this.element = this.createElement();
    this.updatePosition();
  }

  createElement() {
    const el = document.createElement("div");
    el.className = "paddle";
    el.style.width = `${this.width}px`;
    el.style.height = `${this.height}px`;
    el.style.willChange = "transform";
    return el;
  }

  updatePosition() {
    this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    if (this.sticky) this.element.classList.add("paddle--sticky");
    else this.element.classList.remove("paddle--sticky");
  }

  updateElement() {
    this.element.className = "paddle";
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
    if (this.sticky) this.element.classList.add("paddle--sticky");
  }

  getBounds() {
    return {
      left: this.x,
      top: this.y,
      right: this.x + this.width,
      bottom: this.y + this.height,
      width: this.width,
      height: this.height,
      centerX: this.x + this.width / 2,
    };
  }

  moveLeft(dt) {
    this.x -= this.speed * dt;
  }

  moveRight(dt) {
    this.x += this.speed * dt;
  }

  setX(x) {
    this.x = x;
  }

  setSpeed(s) {
    this.speed = s;
  }

  hitBorders(containerWidth) {
    this.x = Math.max(0, Math.min(containerWidth - this.width, this.x));
    if (this.attachedBall) {
      const b = this.attachedBall;
      b.x = this.x + (this.width - b.radius * 2) / 2;
      b.y = this.y - b.radius * 2 - 2;
    }
  }

  attachBall(ball, { force = false } = {}) {
    if (!force && !this.sticky) return false;
    if (this.attachedBall) return false;
    this.attachedBall = ball;
    ball.attachedTo = this;
    ball.offsetX = ball.x - this.x;
    ball.speedX = 0;
    ball.speedY = 0;
    return true;
  }

  releaseBall({ baseSpeed = 360, maxXRatio = 0.8 } = {}) {
    if (!this.attachedBall) return null;
    const ball = this.attachedBall;
    this.attachedBall = null;
    ball.attachedTo = null;

    const hitPos =
      (ball.x + ball.radius - (this.x + this.width / 2)) / (this.width / 2);
    ball.speedX = hitPos * baseSpeed * maxXRatio;
    ball.speedY = -Math.sqrt(
      Math.max(1, baseSpeed * baseSpeed - ball.speedX * ball.speedX),
    );
    return ball;
  }

  setSticky(enabled, durationMs = null) {
    this.sticky = Boolean(enabled);
    if (this.sticky && typeof durationMs === "number" && durationMs > 0) {
      this.stickyExpires = performance.now() + durationMs;
      // i think that is redundant we'll have to check later
      // } else if (this.sticky) {
      //   this.stickyExpires = null;
    } else {
      this.stickyExpires = null;
    }
  }

  setWidth(widthPx) {
    this.width = widthPx;
    this.element.style.width = `${widthPx}px`;
  }

  setHeight(heightPx) {
    this.height = heightPx;
    this.element.style.height = `${heightPx}px`;
  }

  setType(type, { containerWidth = null, preserveSpeed = true } = {}) {
    const prev = { type: this.type, speed: this.speed, width: this.width };
    const cfg = PADDLE_CONFIG[type] || PADDLE_CONFIG[DEFAULT_PADDLE_TYPE];
    this.type = type;
    this.config = cfg;

    if (containerWidth && cfg.widthFraction) {
      const newWidth = Math.max(
        PADDLE_LIMITS.minWidthPx,
        Math.round(cfg.widthFraction * containerWidth),
      );
      this.setWidth(newWidth);
    }

    this.setHeight(cfg.height || this.height);

    const oldSpeed = this.speed || 0;
    this.setSpeed(cfg.speed || this.speed);
    if (preserveSpeed && oldSpeed > 0) {
      const ratio = (cfg.speed || this.speed) / oldSpeed;
      this.vx = this.vx * ratio;
    }

    this.sticky = Boolean(cfg.sticky);

    if (this.attachedBall) {
      const b = this.attachedBall;
      b.x = this.x + (this.width - b.radius * 2) / 2;
      b.y = this.y - b.radius * 2 - 2;
    }

    this.updateElement();
    this.updatePosition();
    return { prevType: prev.type };
  }
}
