import { audioConfig } from '../config/audio-config.js';

class AudioManager {
    constructor(config) {
        this.config = config;
        this.music = {};
        this.sfx = {};
        this.currentMusic = null;
        this.initialized = false;
        
        // Default Settings
        this.settings = { ...config.defaults}
        
        // Preload audio
        this.preloadAudio();
    }
    
    preloadAudio() {
        // Load all music tracks
        for (const [key, path] of Object.entries(this.config.music)) {
            this.music[key] = new Audio(path);
            this.music[key].loop = true; // Music loops by default
        }
        
        // Load all sound effects
        for (const [key, path] of Object.entries(this.config.sfx)) {
            this.sfx[key] = new Audio(path);
        }
        
        // Apply initial volumes
        this.updateAllVolumes();
    }
    
    // Initialize on first user interaction
    init() {
        if (!this.initialized) {
            this.initialized = true;
            return true;
        }
        return false;
    }
    
    // Calculate actual volume based on master and specific volume
    getActualVolume(volumeType) {
        if (this.settings.muted) return 0;
        const master = this.settings.masterVolume / 100;
        const specific = this.settings[volumeType] / 100;
        return master * specific;
    }
    
    // Update all audio volumes
    updateAllVolumes() {
        // Update music volumes
        for (const track of Object.values(this.music)) {
            track.volume = this.getActualVolume('musicVolume');
        }
        
        // Update SFX volumes
        for (const sound of Object.values(this.sfx)) {
            sound.volume = this.getActualVolume('sfxVolume');
        }
    }
    
    // Play music by name
    playMusic(trackName) {
        if (!this.music[trackName]) {
            console.warn(`Music track "${trackName}" not found`);
            return;
        }
        
        // Stop current music if playing
        if (this.currentMusic && this.currentMusic !== this.music[trackName]) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
        }
        
        this.currentMusic = this.music[trackName];
        this.currentMusic.play().catch(e => console.log('Autoplay blocked:', e));
    }
    
    // Stop current music
    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
            this.currentMusic = null;
        }
    }
    
    // Pause current music
    pauseMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
        }
    }
    
    // Resume paused music
    resumeMusic() {
        if (this.currentMusic) {
            this.currentMusic.play().catch(e => console.log('Play blocked:', e));
        }
    }
    
    // Play sound effect by name
    playSfx(soundName) {
        if (!this.sfx[soundName]) {
            console.warn(`Sound effect "${soundName}" not found`);
            return;
        }
        
        // Reset sound to beginning and play
        this.sfx[soundName].currentTime = 0;
        this.sfx[soundName].play().catch(e => console.log('SFX play blocked:', e));
    }
    
    // Stop specific sound effect
    stopSfx(soundName) {
        if (this.sfx[soundName]) {
            this.sfx[soundName].pause();
            this.sfx[soundName].currentTime = 0;
        }
    }
    
    // Stop all sound effects
    stopAllSfx() {
        for (const sound of Object.values(this.sfx)) {
            sound.pause();
            sound.currentTime = 0;
        }
    }
    
    // Volume controls
    setMasterVolume(level) {
        this.settings.masterVolume = Math.max(0, Math.min(100, level));
        this.updateAllVolumes();
    }
    
    setMusicVolume(level) {
        this.settings.musicVolume = Math.max(0, Math.min(100, level));
        this.updateAllVolumes();
    }
    
    setSfxVolume(level) {
        this.settings.sfxVolume = Math.max(0, Math.min(100, level));
        this.updateAllVolumes();
    }
    
    // Mute/unmute
    toggleMute() {
        this.settings.muted = !this.settings.muted;
        this.updateAllVolumes();
        return this.settings.muted;
    }
    
    mute() {
        this.settings.muted = true;
        this.updateAllVolumes();
    }
    
    unmute() {
        this.settings.muted = false;
        this.updateAllVolumes();
    }
    
    // Getters
    isMuted() {
        return this.settings.muted;
    }
    
    isPlaying() {
        return this.currentMusic && !this.currentMusic.paused;
    }
    
    getCurrentTrack() {
        return this.currentMusic;
    }
}

// Create and export singleton instance
export const audioManager = new AudioManager(audioConfig);
