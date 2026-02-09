src/
├── css/                  # Styling for UI and game board
│   ├── game-board.css
│   └── menu.css
├── js/
│   ├── audio/             # Audio layer: handles music/SFX, volume, mute
│   │   └── audio-manager.js
│   ├── config/            # Config layer: constants and data
│   │   ├── audio-config.js
│   │   ├── brick-config.js
│   │   └── level-config.js
│   ├── controllers/       # Controller layer: coordinates behavior & DOM
│   │   ├── ui-controller.js
│   │   ├── level-controller.js
│   │   └── screen-controller.js
│   ├── core/              # Core layer: optional game engine / main loop
│   │   └── game-engine.js
│   ├── entities/          # Entities layer: game objects like bricks, paddle
│   │   └── brick.js
│   ├── systems/           # Systems layer: pure game logic
│   │   ├── brick-layout-system.js
│   │   └── level-system.js
│   └── main.js            # Entry point: wires everything together
