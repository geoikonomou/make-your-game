export class Paddle {
  constructor(x, y, width, height, speed) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
  }

  moveLeft(dt) {
    this.x -= this.speed * dt;
  }

  moveRight(dt) {
    this.x += this.speed * dt;
  }
  hitBorders(gameContainerWidth) {
    this.x = Math.max(
      0,
      Math.min(gameContainerWidth - gameContainerWidth, this.x),
    );
  }
}
