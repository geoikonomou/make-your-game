export const gameState = {
  mode: "PAUSED",//can be also "running","game-over","victory" we'll see about that
  running: false,
  ball: {
    x: 0,
    y: 0,
    speedX: 1,
    speedY: 1,
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

  gameState.ball.x = ballRect.left - containerRect.left,
    gameState.ball.y = ballRect.top - containerRect.top,
    gameState.ball.radius = ballRect.width / 2

  gameState.paddle.x = paddleRect.left - containerRect.left,
    gameState.paddle.y = paddleRect.top - containerRect.top,
    gameState.paddle.width = paddleRect.width
  gameState.paddle.height = paddleRect.height

  gameState.container.width = containerRect.width
  gameState.container.height = containerRect.height
};
