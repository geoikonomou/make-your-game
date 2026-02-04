document.addEventListener('DOMContentLoaded', function() {
    // Game Settings
    const settings= {
        selectedLevel: 1,
        masterVolume: 70,
        musicVolume: 50,
        sfxVolume: 80
    };

    // Show/Hide Screens
    function showScreen(screenName) {
        // Hide all
        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('levelScreen').classList.add('hidden');
        document.getElementById('optionsScreen').classList.add('hidden');
        document.getElementById('gameScreen').classList.add('hidden');

        // Show selected
        if (screenName === 'menu') {
            document.getElementById('mainMenu').classList.remove('hidden');
        } else if (screenName === 'levels') {
            document.getElementById('levelScreen').classList.remove('hidden');
        } else if (screenName === 'options') {
            document.getElementById('optionsScreen').classList.remove('hidden');
        } else if (screenName === 'game') {
            document.getElementById('gameScreen').classList.remove('hidden');
            document.getElementById('currentLevel').textContent = settings.selectedLevel;
        }
    }

    window.showScreen = showScreen;

    // Main Menu Buttons
    document.getElementById('playBtn').addEventListener('click', function() {
        showScreen('game');
    });

    document.getElementById('selectLevelBtn').addEventListener('click', function() {
        showScreen('levels');
    });

    document.getElementById('optionsBtn').addEventListener('click', function() {
        showScreen('options');
    });

    // Level Selection
    const levelButtons = document.querySelectorAll('.level-btn');
    levelButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            settings.selectedLevel = parseInt(this.getAttribute('data-level'));
            showScreen('game');
        });
    });

    // Volume Controls
    document.getElementById('masterVolume').addEventListener('input', function() {
        settings.masterVolume = this.value;
        document.getElementById('masterValue').textContent = this.value + '%';
    });
    document.getElementById('musicVolume').addEventListener('input', function() {
        settings.musicVolume = this.value;
        document.getElementById('musicValue').textContent = this.value + '%';
    });
    document.getElementById('sfxVolume').addEventListener('input', function() {
        settings.sfxVolume =  this.value;
        document.getElementById('sfxValue').textContent = this.value + '%';
    });

    // ESC key to return to menu
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            showScreen('menu');
        }
    });
    });