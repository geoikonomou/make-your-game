/**
 * Story Mode Configuration
 *
 * Each entry maps a level number to its cutscene content.
 * - title:     Level title displayed prominently
 * - narrative:  Story blurb shown below the title
 * - image:     Path to the cutscene background image (relative to project root)
 *
 * The "complete" key is shown after beating the final level.
 */
export const STORY = {
  1: {
    title: "The Beginning",
    narrative:
      "The bricks have taken over the grid. Only your paddle stands between order and chaos. Break through — this is just the start.",
    image: "assets/story/level1.png",
  },
  2: {
    title: "The Wall",
    narrative:
      "Unbreakable walls line the edges. The bricks have learned to defend themselves. Find a way through the cracks.",
    image: "assets/story/level2.png",
  },
  3: {
    title: "The Pyramid",
    narrative:
      "An ancient formation rises before you. Layers of brick stacked in defiance. Chip away from the base or strike the peak — the choice is yours.",
    image: "assets/story/level3.png",
  },
  4: {
    title: "Checkered Chaos",
    narrative:
      "The grid has fractured into a chaotic pattern. A steel barrier cuts through the middle. Precision over power will win this battle.",
    image: "assets/story/level4.png",
  },
  5: {
    title: "The Gauntlet",
    narrative:
      "Almost there. The bricks grow scarce but the pressure mounts. One wrong move and it's over. Stay focused.",
    image: "assets/story/level5.png",
  },
  6: {
    title: "Final Stand",
    narrative:
      "One block remains — the last bastion of the brick uprising. End this. Once and for all.",
    image: "assets/story/level6.png",
  },
  complete: {
    title: "Victory!",
    narrative:
      "The grid is clear. Every brick shattered, every wall broken. You've restored order to the Arkanoid. Until next time, champion.",
    image: "assets/story/complete.png",
  },
};
