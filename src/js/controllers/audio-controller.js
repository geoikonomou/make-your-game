import { audioManager } from "../audio/audio-manager.js";

let musicStarted = false;

export function startMusic() {
  if (!musicStarted) {
    audioManager.init();
    audioManager.playMusic("background");
    musicStarted = true;
  }
}

export function toggleMute(button) {
  const isMuted = audioManager.toggleMute();
  if (button) button.textContent = isMuted ? "🔇 Muted" : "🔊 Unmuted";
  return isMuted;
}

export const volumeControls = {
  master: (value) => audioManager.setMasterVolume(value),
  music: (value) => audioManager.setMusicVolume(value),
  sfx: (value) => audioManager.setSfxVolume(value),
};
