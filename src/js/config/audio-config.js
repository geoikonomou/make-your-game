// Audio Configuration
const BASE_PATH = '/assets/audio/';
export const audioConfig = {
    music: {
        background: `${BASE_PATH}music/background_music.mp3`
    },
    sfx: {
        click: `${BASE_PATH}sfx/menu_interaction.mp3`,
        gameStart: `${BASE_PATH}sfx/menu_play_game.mp3`
    },
    defaults: {
        masterVolume: 70,
        musicVolume: 50,
        sfxVolume: 80,
        muted: false
    }
};