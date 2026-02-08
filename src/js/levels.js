/**
 * Get level data by level number
 * @param {number} levelNumber - The level number (1-based)
 * @returns {object|null} Level data object or null if not found
 */
function getLevelData(levelNumber) {
  return LEVELS[levelNumber] || null;
}

/**
 * Get total number of levels
 * @returns {number} Total levels available
 */
function getTotalLevels() {
  return Object.keys(LEVELS).length;
}

/**
 * Validate if a level exists
 * @param {number} levelNumber - The level number to check
 * @returns {boolean} True if level exists
 */
function isValidLevel(levelNumber) {
  return LEVELS.hasOwnProperty(levelNumber);
}

/**
 * Count total breakable bricks in a level
 * @param {number} levelNumber - The level number
 * @returns {number} Count of breakable bricks
 */
function countBreakableBricks(levelNumber) {
  const level = getLevelData(levelNumber);
  if (!level) return 0;

  let count = 0;
  level.layout.forEach((row) => {
    row.forEach((brick) => {
      // Count all bricks except empty (0) and unbreakable (3)
      if (brick !== 0 && brick !== Brick.TYPES.UNBREAKABLE) {
        count++;
      }
    });
  });

  return count;
}
