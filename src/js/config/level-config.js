/**
 * Levels Configuration — "The Digital Prison Break"
 * Each level is defined as a 2D array where:
 * 0 = Empty space
 * 1 = Normal brick (1 hit)  — corrupted data blocks
 * 2 = Hard brick (2 hits)   — encrypted sectors
 * 3 = Unbreakable brick     — hardened firewall nodes
 */

export const LEVELS = {
  /* -------------------------------------------------------
   * Level 1 — Graphics Engine
   * Intro layer: scanlines of pixel data to shatter.
   * Alternating normal/hard rows, easy to read.
   * ------------------------------------------------------- */
  1: {
    name: "Graphics Engine",
    layout: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
  },

  /* -------------------------------------------------------
   * Level 2 — Sound Engine
   * Sound-wave pattern: a central waveform flanked by
   * hard-brick amplifiers. Break the wave to silence it.
   * ------------------------------------------------------- */
  2: {
    name: "Sound Engine",
    layout: [
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 2, 1, 1, 2, 1, 0, 0],
      [0, 1, 2, 1, 0, 0, 1, 2, 1, 0],
      [1, 2, 1, 0, 0, 0, 0, 1, 2, 1],
      [0, 1, 2, 1, 0, 0, 1, 2, 1, 0],
      [0, 0, 1, 2, 1, 1, 2, 1, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
    ],
  },

  /* -------------------------------------------------------
   * Level 3 — Memory Bank
   * Grid of memory cells: dense block with encrypted
   * sectors scattered throughout. No safe gaps.
   * ------------------------------------------------------- */
  3: {
    name: "Memory Bank",
    layout: [
      [2, 1, 1, 2, 1, 1, 2, 1, 1, 2],
      [1, 1, 2, 1, 1, 1, 1, 2, 1, 1],
      [1, 2, 1, 1, 2, 2, 1, 1, 2, 1],
      [2, 1, 1, 2, 1, 1, 2, 1, 1, 2],
      [1, 1, 2, 1, 2, 2, 1, 2, 1, 1],
      [1, 2, 1, 1, 1, 1, 1, 1, 2, 1],
      [2, 1, 1, 2, 1, 1, 2, 1, 1, 2],
    ],
  },

  /* -------------------------------------------------------
   * Level 4 — Firewall
   * Three unbreakable barriers segment the field.
   * You must route the ball through the gaps.
   * ------------------------------------------------------- */
  4: {
    name: "Firewall",
    layout: [
      [1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
      [2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
      [3, 3, 3, 0, 3, 3, 0, 3, 3, 3],
      [1, 1, 2, 1, 1, 1, 1, 2, 1, 1],
      [2, 2, 1, 2, 2, 2, 2, 1, 2, 2],
      [3, 0, 3, 3, 0, 0, 3, 3, 0, 3],
      [1, 1, 1, 2, 1, 1, 2, 1, 1, 1],
      [2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
    ],
  },

  /* -------------------------------------------------------
   * Level 5 — Antivirus Core
   * A fortified diamond of encrypted bricks protected
   * by unbreakable sentinels. The system fights back.
   * ------------------------------------------------------- */
  5: {
    name: "Antivirus Core",
    layout: [
      [0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
      [0, 0, 0, 3, 2, 2, 3, 0, 0, 0],
      [0, 0, 3, 2, 1, 1, 2, 3, 0, 0],
      [0, 3, 2, 1, 2, 2, 1, 2, 3, 0],
      [3, 2, 1, 2, 1, 1, 2, 1, 2, 3],
      [0, 3, 2, 1, 2, 2, 1, 2, 3, 0],
      [0, 0, 3, 2, 1, 1, 2, 3, 0, 0],
      [0, 0, 0, 3, 2, 2, 3, 0, 0, 0],
      [0, 0, 0, 0, 3, 3, 0, 0, 0, 0],
    ],
  },

  /* -------------------------------------------------------
   * Level 6 — The Exit Port
   * Final escape hatch. Sparse but heavily encrypted
   * blocks guard the last gateway. One wrong bounce and
   * freedom slips away.
   * ------------------------------------------------------- */
  6: {
    name: "The Exit Port",
    layout: [
      [3, 3, 2, 2, 0, 0, 2, 2, 3, 3],
      [3, 2, 1, 2, 0, 0, 2, 1, 2, 3],
      [2, 1, 2, 2, 3, 3, 2, 2, 1, 2],
      [2, 2, 3, 1, 2, 2, 1, 3, 2, 2],
      [0, 0, 2, 2, 1, 1, 2, 2, 0, 0],
      [2, 2, 3, 1, 2, 2, 1, 3, 2, 2],
      [2, 1, 2, 2, 3, 3, 2, 2, 1, 2],
      [3, 2, 1, 2, 0, 0, 2, 1, 2, 3],
      [3, 3, 2, 2, 0, 0, 2, 2, 3, 3],
    ],
  },
};
