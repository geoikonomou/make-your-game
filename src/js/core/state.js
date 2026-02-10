export const gameState = {
  mode: "PAUSED",//can be also "running","game-over","victory" we'll see about that
  running: false,
  ball: {
    x: 0,
    y: 0,
    speedX: 0,
    speedY: 0.3,
    radius: 0,
  },
  paddle: {
    x: 0,
    y: 0,
    speed: 1,
    width: 0,
    height: 0,
  },
  container: {
    width: 0,
    height: 0,
  },
  score: 0,
  lives: 3,

}
export function createGameState() {
  const container = document.getElementById('gameContainer');
  const containerRect = container.getBoundingClientRect();

  const paddle = document.getElementById('paddle');
  const paddleRect = paddle.getBoundingClientRect();

  const ball = document.getElementById('ball');
  const ballRect = ball.getBoundingClientRect();

  gameState.ball.radius = ballRect.width / 2

  gameState.paddle.width = paddleRect.width
  gameState.paddle.height = paddleRect.height

  gameState.container.width = containerRect.width
  gameState.container.height = containerRect.height

  gameState.ball.x = parseFloat(getComputedStyle(ball).left) - (ballRect.width / 2);
  gameState.ball.y = parseFloat(getComputedStyle(ball).top);
  gameState.paddle.x = parseFloat(getComputedStyle(paddle).left) - (paddleRect.width / 2);
  gameState.paddle.y = parseFloat(getComputedStyle(paddle).top);

  ball.style.left = "0px";
  ball.style.top = "0px";
  paddle.style.left = "0px";
  paddle.style.top = "0px";

  // gameState.paddle.x = paddleRect.left - containerRect.left;
  // gameState.paddle.y = paddleRect.top - containerRect.top;
  //   console.log("this is the container ", containerRect);
  // console.log("this is the ball ", ballRect);
  // console.log("this is the paddle ", paddleRect);
  // console.log("this is the ball x ", gameState.ball.x);
  // console.log("this is the ball y ", gameState.ball.y);
};
