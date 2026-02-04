/**
 * Levels Configuration
 * Each level is defined as a 2D array where:
 * 0 = Empty space
 * 1 = Normal brick (1 hit)
 * 2 = Hard brick (2 hits)
 * 3 = Unbreakable brick
 */

const LEVELS = {
  1: {
    name: "Getting Started",
    layout: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
  },

  2: {
    name: "The Wall",
    layout: [
      [3, 0, 0, 0, 0, 0, 0, 0, 0, 3],
      [3, 1, 1, 1, 1, 1, 1, 1, 1, 3],
      [3, 1, 2, 2, 2, 2, 2, 2, 1, 3],
      [3, 1, 2, 1, 1, 1, 1, 2, 1, 3],
      [3, 1, 2, 1, 0, 0, 1, 2, 1, 3],
      [3, 1, 2, 1, 1, 1, 1, 2, 1, 3],
      [3, 1, 2, 2, 2, 2, 2, 2, 1, 3],
      [3, 1, 1, 1, 1, 1, 1, 1, 1, 3],
      [3, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    ],
  },

  3: {
    name: "Pyramid",
    layout: [
      [0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
      [0, 0, 0, 2, 1, 1, 2, 0, 0, 0],
      [0, 0, 2, 1, 1, 1, 1, 2, 0, 0],
      [0, 2, 1, 1, 1, 1, 1, 1, 2, 0],
      [2, 1, 1, 1, 1, 1, 1, 1, 1, 2],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
    ],
  },

  4: {
    name: "Checkered Chaos",
    layout: [
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      [0, 2, 0, 2, 0, 2, 0, 2, 0, 2],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      [0, 2, 0, 2, 0, 2, 0, 2, 0, 2],
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [0, 2, 0, 2, 0, 2, 0, 2, 0, 2],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      [0, 2, 0, 2, 0, 2, 0, 2, 0, 2],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    ],
  },
};

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
