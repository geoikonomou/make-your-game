# Recent Changes

## Pause Menu (Esc Key)
- Pressing **Esc** during gameplay opens a pause overlay with three buttons: **Continue**, **Restart**, and **Back to Menu**.
- Pressing **Esc** again (or clicking **Continue**) resumes the game.
- Esc only activates when the game is in `RUNNING` or `PAUSED` state — it does nothing before the ball is launched.
- All pause logic lives in `src/js/controllers/ui-controller.js` with dedicated functions (`showPauseOverlay`, `hidePauseOverlay`, `handlePauseKeydown`, etc.).
- The overlay is re-created on each level load via `createPauseOverlay()` since `startLevel` clears the game container.

## Spacebar — Ball Launch Only
- Spacebar **only** launches the ball (transitions from `READY` → `RUNNING`).
- It no longer toggles pause/resume — that is handled exclusively by Esc.
- On first launch, `startGame()` performs full initialization (state, input, game loop).
- On respawn (after losing a life), Space simply resumes without resetting score, lives, or timer.

## Timer Accuracy
- The timer only advances while the game mode is `RUNNING`.
- When **pausing** (Esc), the pause timestamp is recorded. On resume, `timeStarted` is shifted forward so paused time is excluded.
- When **respawning** (ball lost), the same approach is used — `_readyAt` records when the wait began, and `timeStarted` is adjusted on relaunch.

## Respawn Flow
- When the ball hits the bottom and no balls remain, a life is lost and `respawnBall()` places a new ball on the paddle.
- The mode is set to `READY` (not `PAUSED`), so the player presses **Space** to relaunch.

## Duplicate Listener Guard
- `enterGameMode()` removes any previously attached Space handler before adding a new one, preventing stacked listeners on restart.
