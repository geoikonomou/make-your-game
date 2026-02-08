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

  // --- Utility: Start a level ---
  function startLevel(levelNumber) {
    // Clear existing bricks
    bricksContainer.innerHTML = "";

    // Calculate layout
    const layout = BrickLayoutSystem.calculate(container.offsetWidth);

    // Create bricks
    const bricks = LevelSystem.createBricks(levelNumber, layout);

    // Append to DOM
    bricks.forEach((brick) => {
      bricksContainer.appendChild(brick.element);
    });

    // Update level display
    levelDisplay.textContent = levelNumber;
  }

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

  // --- ESC key to return to menu ---
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      showScreen("menu");
    }
  });
});
