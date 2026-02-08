import { audioManager } from "./audio/audio-manager.js";

document.addEventListener("DOMContentLoaded", function () {
  // Play background music on first interaction
  let musicStarted = false;
  function startMusic() {
    if (!musicStarted) {
      audioManager.init();
      audioManager.playMusic("background");
      musicStarted = true;
    }
  }

  // Show/Hide Screens
  function showScreen(screenName) {
    // Hide all
    document.getElementById("mainMenu").classList.add("hidden");
    document.getElementById("levelScreen").classList.add("hidden");
    document.getElementById("optionsScreen").classList.add("hidden");
    document.getElementById("gameScreen").classList.add("hidden");

    // Show selected
    if (screenName === "menu") {
      document.getElementById("mainMenu").classList.remove("hidden");
    } else if (screenName === "levels") {
      document.getElementById("levelScreen").classList.remove("hidden");
    } else if (screenName === "options") {
      document.getElementById("optionsScreen").classList.remove("hidden");
    } else if (screenName === "game") {
      document.getElementById("gameScreen").classList.remove("hidden");
      document.getElementById("currentLevel").textContent =
        audioManager.settings.selectedLevel;
    }
  }

  window.showScreen = showScreen;

  // Main Menu Buttons
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

  // Level Selection
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

  // Mute Button
  const muteButton = document.getElementById("muteButton");
  muteButton.addEventListener("click", function () {
    const isMuted = audioManager.toggleMute();
    this.textContent = isMuted ? "🔇 Muted" : "🔊 Unmuted";
  });

  // Volume Controls
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
    // Play a test sound when adjusting SFX volume
    audioManager.playSfx("click");
  });

  // ESC key to return to menu
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      showScreen("menu");
    }
  });
});
