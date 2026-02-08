const bricksContainer = document.getElementById("bricksContainer");

bricks.forEach((brick) => {
  bricksContainer.appendChild(brick.element);
});
