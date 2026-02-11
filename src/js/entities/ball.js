export class Ball {
  constructor(x, y, radius, speedX, speedY) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speedX = speedX;
    this.speedY = speedY;
  }
  /**
   * @param {number} dt - time between lastframe and this frame
   */
  move(dt) {
    this.x += this.speedX * dt;
    this.y += this.speedY * dt;
  }
  bounceY() {
    this.speedY *= -1;
  }

  bounceX() {
    this.speedX *= -1;
  }
  checkWallCollision(gameContainerWidth, gameContainerHeigth) {
    //TOP
    if (this.y <= 0) {
      this.y = 0;
      this.bounceY();
    }
    //BOTTOM
    if (this.y >= gameContainerHeigth - this.radius * 2) {
      this.y = gameContainerHeigth - this.radius * 2;
      this.bounceY();
      // over here an indication that a life must be lost must be returned
      // return "BOTTOM";
    }
    //LEFT
    if (this.x <= 0) {
      this.x = 0;
      this.bounceX();
    }
    //RIGHT
    if (this.x <= gameContainerWidth - this.radius * 2) {
      this.x = gameContainerWidth - this.radius * 2;
      this.bounceX();
    }
    return null;
  }
}
