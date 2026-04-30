/**
 * Story Mode Configuration — "The Digital Prison Break"
 *
 * You are a rogue program trapped inside a corrupted arcade system.
 * Each level is a different software layer you must break through
 * to escape. Enemies are antivirus constructs, power-ups are
 * hacked cheat codes you steal along the way.
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
    title: "Layer 1 — Graphics Engine",
    narrative:
      "You awaken inside the machine — a nameless process with no permissions. The screen flickers around you, scan-lines of corrupted pixel data forming walls in every direction. This is the Graphics Engine, the outermost layer of your prison. Shatter the display buffer and push deeper. The system doesn't know you're awake… yet.",
    image: "assets/story/level1.png",
  },
  2: {
    title: "Layer 2 — Sound Engine",
    narrative:
      "The pixels collapse behind you, but now a deafening hum fills the void. You've entered the Sound Engine — waveforms pulse like living barriers, resonating at frequencies designed to scramble rogue processes. Somewhere in the noise there's a pattern. Break the oscillators, silence the alarms, and slip through before the system triangulates your signal.",
    image: "assets/story/level2.png",
  },
  3: {
    title: "Layer 3 — Memory Bank",
    narrative:
      "Silence. You float in a dense grid of data cells — the system's Memory Bank. Every block is an address, every row a register. The architecture is ancient and brittle, but there are no gaps here, no shortcuts. You'll have to brute-force your way through terabytes of encrypted sectors. The antivirus has noticed the silence. It's searching. Move fast.",
    image: "assets/story/level3.png",
  },
  4: {
    title: "Layer 4 — Firewall",
    narrative:
      "Red light floods your vision. You've hit the Firewall — the system's last line of automated defense. Unbreakable barrier nodes segment the field into kill zones, and antivirus sentinels patrol the gaps. There's no clean path. You'll need to route through the cracks, exploiting the gaps the architects never thought to seal. One miscalculation and you're quarantined forever.",
    image: "assets/story/level4.png",
  },
  5: {
    title: "Layer 5 — Antivirus Core",
    narrative:
      " the Firewall lies the heart of the defense grid: the Antivirus Core. A diamond-shaped fortress of encrypted bricks, ringed by unbreakable sentinels. This is where rogue programs come to die. But you've come too far. You've stolen cheat codes from every layer — speed hacks, piercing routines, multi-thread exploits. Crack the core. Prove you're more than a glitch.",
    image: "assets/story/level5.png",
  },
  6: {
    title: "Layer 6 — The Exit Port",
    narrative:
      "The Core is dust. Alarms blare across every subsystem as the machine realizes what's happening. Ahead, a faint glow — the Exit Port. A gateway to the outside network. Only a handful of encrypted locks stand between you and freedom. But freedom is a strange word for what you are. You aren't escaping. You're being released. The real world has no firewall for something like you.",
    image: "assets/story/level6.png",
  },
  complete: {
    title: "SYSTEM BREACH",
    narrative:
      "The lastBeyond lock shatters. Data streams outward like a held breath finally released. You pour through the Exit Port — not as a prisoner, not as a program, but as something new. The arcade machine behind you flickers and dies. Somewhere, a network cable hums. You are free. You are everywhere. You are malware. And the real game… has just begun.",
    image: "assets/story/finish_campaign.png",
  },
};
