import { BALL_CONFIG, DEFAULT_BALL_TYPE } from "../config/ball-config.js";

export class Ball {
  constructor({
    x = 0,
    y = 0,
    type = DEFAULT_BALL_TYPE,
    radius = null,
    speedX = 0,
    speedY = 0,
  } = {}) {
    this.type = type;
    this.config = BALL_CONFIG[this.type] || BALL_CONFIG[DEFAULT_BALL_TYPE];
    this.radius = radius ?? this.config.radius;
    this.x = x;
    this.y = y;
    this.speedX = speedX;
    this.speedY = speedY;

    this.pierceRemaining = this.config.pierce || 0;
    this.attachedTo = null;

    this.element = this.createElement();
    this.updatePosition();
  }

  createElement() {
    const el = document.createElement("div");
    el.className = `ball ball-type-${this.type}`;
    const size = this.radius * 2;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.willChange = "transform";
    return el;
  }

  updatePosition() {
    this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
  }

  getBounds() {
    return {
      left: this.x,
      top: this.y,
      right: this.x + this.radius * 2,
      bottom: this.y + this.radius * 2,
      width: this.radius * 2,
      height: this.radius * 2,
      centerX: this.x + this.radius,
      centerY: this.y + this.radius,
    };
  }

  move(dt) {
    if (this.attachedTo) {
      const paddle = this.attachedTo;
      this.x = paddle.x + (paddle.width - this.radius * 2) / 2;
      this.y = paddle.y - this.radius * 2 - 2;
      return;
    }

    this.x += this.speedX * dt;
    this.y += this.speedY * dt;
  }

  bounceY() {
    this.speedY = -this.speedY;
  }

  bounceX() {
    this.speedX = -this.speedX;
  }

  attachToPaddle(paddle) {
    this.attachedTo = paddle;
    return true;
  }

  releaseFromPaddle(launchSpeedY = -300) {
    if (!this.attachedTo) return;
    this.attachedTo = null;
    this.speedY = launchSpeedY;
  }

  onBrickHit(brick) {
    if (this.pierceRemaining > 0) {
      this.pierceRemaining--;
      return { pierced: true };
    }
    return { pierced: false };
  }

  checkWallCollision(gameContainerWidth, gameContainerHeight) {
    if (this.y <= 0) {
      this.y = 0;
      this.bounceY();
      return "TOP";
    }

    if (this.y >= gameContainerHeight - this.radius * 2) {
      this.y = gameContainerHeight - this.radius * 2;
      //uncomment this later
      this.bounceY();
      return "BOTTOM";
    }

    if (this.x <= 0) {
      this.x = 0;
      this.bounceX();
      return "LEFT";
    }

    if (this.x >= gameContainerWidth - this.radius * 2) {
      this.x = gameContainerWidth - this.radius * 2;
      this.bounceX();
      return "RIGHT";
    }

    return null;
  }

  setType(type) {
    this.type = type;
    this.config = BALL_CONFIG[this.type] || BALL_CONFIG[DEFAULT_BALL_TYPE];
    this.radius = this.config.radius;
    this.pierceRemaining = this.config.pierce || 0;
    this.updateElement();
  }

  updateElement() {
    this.element.className = `ball ball-type-${this.type}`;
    const size = this.radius * 2;
    this.element.style.width = `${size}px`;
    this.element.style.height = `${size}px`;
    this.updatePosition();
  }

  getSpeed() {
    return Math.hypot(this.speedX, this.speedY);
  }
}
