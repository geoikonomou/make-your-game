// Audio Configuration
const BASE_PATH = "/assets/audio/";
export const audioConfig = {
  music: {
    background: `${BASE_PATH}music/background_music.mp3`,
    level1: `${BASE_PATH}music/level1_music.mp3`,
    level2: `${BASE_PATH}music/level2_music.mp3`,
    level3: `${BASE_PATH}music/level3_music.mp3`,
    level4: `${BASE_PATH}music/level4_music.mp3`,
    level5: `${BASE_PATH}music/level5_music.mp3`,
    level6: `${BASE_PATH}music/level6_music.mp3`,
  },
  sfx: {
    click: `${BASE_PATH}sfx/menu_interaction.mp3`,
    gameStart: `${BASE_PATH}sfx/menu_play_game.mp3`,
  },
  defaults: {
    masterVolume: 70,
    musicVolume: 50,
    sfxVolume: 80,
    muted: false,
  },
};
