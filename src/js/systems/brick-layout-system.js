import { BRICK_LAYOUT } from "../config/brick-config.js";

/**
 * BrickLayoutSystem
 * Calculates brick dimensions and positioning
 * based on container size.
 *
 * This system produces layout data
 * that is injected into Brick entities.
 */
export class BrickLayoutSystem {
  /**
   * Calculate layout data for bricks
   * @param {number} containerWidth - Width of the game container
   * @param {number} cols - Number of brick columns (from level)
   * @returns {Object} Layout object for bricks
   */
  static calculate(containerWidth, cols) {
    if (!cols || cols <= 0) {
      console.warn("Invalid cols provided, defaulting to 10");
      cols = 10;
    }

    const scaleFactor = Math.min(containerWidth / BRICK_LAYOUT.BASE_WIDTH, 1);

    const padding = Math.max(
      Math.floor(BRICK_LAYOUT.BASE_PADDING * scaleFactor),
      Math.min(2, Math.floor(containerWidth * 0.005)),
    );

    const height = Math.max(
      Math.floor(BRICK_LAYOUT.BASE_HEIGHT * scaleFactor),
      15,
    );

    const horizontalMargin = Math.max(Math.floor(20 * scaleFactor), 10);

    const totalPadding = (cols - 1) * padding;
    const availableWidth = containerWidth - horizontalMargin * 2;

    const width = Math.floor((availableWidth - totalPadding) / cols);

    const actualGridWidth = cols * width + (cols - 1) * padding;

    const totalMargin = containerWidth - actualGridWidth;
    const offsetLeft = Math.floor(totalMargin / 2);

    const offsetTop = Math.floor(BRICK_LAYOUT.OFFSET_TOP * scaleFactor);

    return {
      width,
      height,
      padding,
      offsetLeft,
      offsetTop,
      cols,
    };
  }
}
