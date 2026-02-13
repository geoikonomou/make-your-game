import { audioManager } from "./audio/audio-manager.js";
import { BrickLayoutSystem } from "./systems/brick-layout-system.js";
import { LevelSystem } from "./systems/level-system.js";

document.addEventListener("DOMContentLoaded", function () {
  // --- Audio & music setup ---
  let musicStarted = false;

  function startMusic() {
    if (!musicStarted) {
      audioManager.init();
      audioManager.playMusic("background");
      musicStarted = true;
    }
  }

  // --- DOM references ---
  const container = document.getElementById("gameContainer");
  const bricksContainer = document.getElementById("bricksContainer");
  const levelDisplay = document.getElementById("levelDisplay");

  // --- Game state ---
  let currentBricks = [];
  let currentLevel = 1;

  // --- Utility: Start a level ---
  function startLevel(levelNumber) {
    currentLevel = levelNumber;

    // Clear existing bricks
    bricksContainer.innerHTML = "";
    currentBricks = [];

    // Get max columns from this level
    const cols = LevelSystem.getMaxColumns(levelNumber);

    // Calculate layout based on container width
    const layout = BrickLayoutSystem.calculate(container.clientWidth, cols);

    // Create bricks
    const bricks = LevelSystem.createBricks(levelNumber, layout);
    currentBricks = bricks;

    // Append to DOM using DocumentFragment for performance
    const fragment = document.createDocumentFragment();
    bricks.forEach((brick) => {
      fragment.appendChild(brick.element);
    });
    bricksContainer.appendChild(fragment);

    // Update level display
    levelDisplay.textContent = levelNumber;

    console.log(`Level ${levelNumber} loaded: ${bricks.length} bricks`);
  }

  // --- Handle window resize ---
  let resizeTimeout;
  function handleResize() {
    if (currentBricks.length === 0) return;

    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Recalculate cols from current level
      const cols = LevelSystem.getMaxColumns(currentLevel);

      // Recalculate layout
      const layout = BrickLayoutSystem.calculate(container.clientWidth, cols);

      // Update all bricks with new layout
      currentBricks.forEach((brick) => {
        brick.layout = layout;
        brick.element.style.width = layout.width + "px";
        brick.element.style.height = layout.height + "px";
        brick.updatePosition();
      });

      console.log(
        `Resized: Container ${container.offsetWidth}px, Brick ${layout.width}x${layout.height}px`,
      );
    }, 150);
  }

  window.addEventListener("resize", handleResize);

  // --- Show / Hide screens ---
  function showScreen(screenName) {
    // Hide all
    document.getElementById("mainMenu").classList.add("hidden");
    document.getElementById("levelScreen").classList.add("hidden");
    document.getElementById("optionsScreen").classList.add("hidden");
    document.getElementById("gameScreen").classList.add("hidden");

    // Show requested
    if (screenName === "menu") {
      document.getElementById("mainMenu").classList.remove("hidden");
    } else if (screenName === "levels") {
      document.getElementById("levelScreen").classList.remove("hidden");
    } else if (screenName === "options") {
      document.getElementById("optionsScreen").classList.remove("hidden");
    } else if (screenName === "game") {
      document.getElementById("gameScreen").classList.remove("hidden");

      // Start the selected level
      const level = audioManager.settings.selectedLevel || 1;
      startLevel(level);
    }
  }

  window.showScreen = showScreen;

  // --- Main Menu Buttons ---
  document.getElementById("playBtn").addEventListener("click", function () {
    startMusic();
    audioManager.playSfx("gameStart");
    audioManager.settings.selectedLevel = 1; // Start from level 1
    showScreen("game");
  });

  document
    .getElementById("selectLevelBtn")
    .addEventListener("click", function () {
      startMusic();
      audioManager.playSfx("click");
      showScreen("levels");
    });

  document.getElementById("optionsBtn").addEventListener("click", function () {
    startMusic();
    audioManager.playSfx("click");
    showScreen("options");
  });

  // --- Level Selection ---
  const levelButtons = document.querySelectorAll(".level-btn");
  levelButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      audioManager.settings.selectedLevel = parseInt(
        this.getAttribute("data-level"),
      );
      audioManager.playSfx("gameStart");
      showScreen("game");
    });
  });

  // --- Mute Button ---
  const muteButton = document.getElementById("muteButton");
  muteButton.addEventListener("click", function () {
    const isMuted = audioManager.toggleMute();
    this.textContent = isMuted ? "🔇 Muted" : "🔊 Unmuted";
  });

  // --- Volume Controls ---
  document
    .getElementById("masterVolume")
    .addEventListener("input", function () {
      audioManager.setMasterVolume(this.value);
      document.getElementById("masterValue").textContent = this.value + "%";
    });

  document.getElementById("musicVolume").addEventListener("input", function () {
    audioManager.setMusicVolume(this.value);
    document.getElementById("musicValue").textContent = this.value + "%";
  });

  document.getElementById("sfxVolume").addEventListener("input", function () {
    audioManager.setSfxVolume(this.value);
    document.getElementById("sfxValue").textContent = this.value + "%";
    audioManager.playSfx("click");
  });

  // --- Keyboard Controls ---
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      showScreen("menu");
    }

    // R to restart current level
    if (e.key === "r" || e.key === "R") {
      if (currentBricks.length > 0) {
        startLevel(currentLevel);
        console.log("Level restarted");
      }
    }
  });

  // --- Test function for development ---
  window.testBrickHit = function () {
    const activeBricks = currentBricks.filter((b) => b.isActive());
    if (activeBricks.length > 0) {
      const randomBrick =
        activeBricks[Math.floor(Math.random() * activeBricks.length)];
      const destroyed = randomBrick.hit();
      console.log(
        `Brick hit! Destroyed: ${destroyed}, Active remaining: ${activeBricks.length - (destroyed ? 1 : 0)}`,
      );
    }
  };

  // --- Log initial state ---
  console.log("Arkanoid initialized!");
  console.log("Controls:");
  console.log("- ESC: Return to menu");
  console.log("- R: Restart level");
  console.log("- Test: testBrickHit()");
});
