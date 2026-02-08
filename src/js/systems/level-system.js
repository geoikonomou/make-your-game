import { LEVELS } from "../config/level-config.js";
import { BRICK_TYPES } from "../config/brick-config.js";
import { Brick } from "../entities/brick.js";

/**
 * LevelSystem
 * Responsible for:
 * - Loading level data
 * - Creating brick entities
 * - Level validation
 * - Win condition support
 */
export class LevelSystem {
  static getLevel(levelNumber) {
    return LEVELS[levelNumber] ?? null;
  }

  static getTotalLevels() {
    return Object.keys(LEVELS).length;
  }

  static isValidLevel(levelNumber) {
    return levelNumber in LEVELS;
  }

  static createBricks(levelNumber, layout) {
    const level = this.getLevel(levelNumber);
    if (!level) return [];

    const bricks = [];

    level.layout.forEach((row, r) => {
      row.forEach((type, c) => {
        if (type === 0) return;

        bricks.push(
          new Brick({
            row: r,
            col: c,
            type,
            layout,
          }),
        );
      });
    });

    return bricks;
  }

  static countBreakableBricks(levelNumber) {
    const level = this.getLevel(levelNumber);
    if (!level) return 0;

    let count = 0;

    level.layout.forEach((row) => {
      row.forEach((type) => {
        if (type !== 0 && type !== BRICK_TYPES.UNBREAKABLE) {
          count++;
        }
      });
    });

    return count;
  }
}
