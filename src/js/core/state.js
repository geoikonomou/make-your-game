export class GameState {
  constructor() {
    this.mode = "INIT";
    //INIT || READY || RUNNING || PAUSED || GAME_OVER
    this.container = {
      width: 0,
      height: 0,
    };
    this.ball = null;
    this.paddle = null;
    this.bricks = [];
    //or better we can have the lives in the levels in the config, pass the levelNumber as a parameter and the have this
    //this.level=LEVELS[levelNumber].lives
    //again just ideas
    this.level = 1;
    this.score = 0;
    this.lives = 3;
  }
  setEntities(ball, paddle, bricks) {
    this.ball = ball;
    this.paddle = paddle;
    this.bricks = bricks;
  }
  loselife() {
    this.lives--;
    if (this.lives <= 0) {
      this.mode = "GAME OVER";
    }
  }
  addScore(points) {
    this.score += points;
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
}

// export function createGameState() {
//   const container = document.getElementById("gameContainer");
//   const containerRect = container.getBoundingClientRect();
//
//   const paddle = document.getElementById("paddle");
//   const paddleRect = paddle.getBoundingClientRect();
//
//   const ball = document.getElementById("ball");
//   const ballRect = ball.getBoundingClientRect();
//
//   gameState.ball.radius = ballRect.width / 2;
//   gameState.ball.x =
//     parseFloat(getComputedStyle(ball).left) - ballRect.width / 2;
//   gameState.ball.y = parseFloat(getComputedStyle(ball).top);
//
//   gameState.paddle.x =
//     parseFloat(getComputedStyle(paddle).left) - paddleRect.width / 2;
//   gameState.paddle.y = parseFloat(getComputedStyle(paddle).top);
//   gameState.paddle.width = paddleRect.width;
//   gameState.paddle.height = paddleRect.height;
//
//   gameState.container.width = containerRect.width - 6; //the magic number 6 is a small adjustment to the width of the container due to the css border being included in the .getBoundinfClientRect().width and is caused an overflow
//   gameState.container.height = containerRect.height;
//
//   ball.style.left = "0px";
//   ball.style.top = "0px";
//   paddle.style.left = "0px";
//   paddle.style.top = "0px";
// }
