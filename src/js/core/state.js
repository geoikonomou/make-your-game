export const gameState = {
  mode: "PAUSED", //can be also "running","game-over","victory" we'll see about that
  running: false,
  ball: {
    x: 0,
    y: 0,
    speedX: 0,
    speedY: -0.5,
    radius: 0,
  },
  paddle: {
    x: 0,
    y: 0,
    speed: 0.5,
    width: 0,
    height: 0,
  },
  container: {
    width: 0,
    height: 0,
  },
  score: 0,
  lives: 3,
};
export function createGameState() {
  const container = document.getElementById("gameContainer");
  const containerRect = container.getBoundingClientRect();

  const paddle = document.getElementById("paddle");
  const paddleRect = paddle.getBoundingClientRect();

  const ball = document.getElementById("ball");
  const ballRect = ball.getBoundingClientRect();

  gameState.ball.radius = ballRect.width / 2;
  gameState.ball.x =
    parseFloat(getComputedStyle(ball).left) - ballRect.width / 2;
  gameState.ball.y = parseFloat(getComputedStyle(ball).top);

  gameState.paddle.x =
    parseFloat(getComputedStyle(paddle).left) - paddleRect.width / 2;
  gameState.paddle.y = parseFloat(getComputedStyle(paddle).top);
  gameState.paddle.width = paddleRect.width;
  gameState.paddle.height = paddleRect.height;

  gameState.container.width = containerRect.width - 6; //the magic number 6 is a small adjustment to the width of the container due to the css border being included in the .getBoundinfClientRect().width and is caused an overflow
  gameState.container.height = containerRect.height;

  ball.style.left = "0px";
  ball.style.top = "0px";
  paddle.style.left = "0px";
  paddle.style.top = "0px";
}
