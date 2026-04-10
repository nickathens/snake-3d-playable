import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════════
// YOUTUBE PLAYABLES SDK WRAPPER
// ═══════════════════════════════════════════════════════════════════════

const YT = {
  ready: false,
  audioEnabled: true,
  init() {
    if (typeof window !== 'undefined' && window.ytgame) {
      this.ready = true;
      window.ytgame.system.onPause(() => pauseGame());
      window.ytgame.system.onResume(() => resumeGame());
      window.ytgame.system.onAudioEnabledChange((enabled) => {
        this.audioEnabled = enabled;
        if (masterGain) masterGain.gain.value = enabled ? 1 : 0;
      });
    }
  },
  firstFrame() { if (this.ready) window.ytgame.game.firstFrameReady(); },
  gameReady() { if (this.ready) window.ytgame.game.gameReady(); },
  sendScore(s) { if (this.ready) window.ytgame.engagement.sendScore(s); },
  async loadData() {
    if (!this.ready) return null;
    try { return JSON.parse(await window.ytgame.game.loadData()); } catch { return null; }
  },
  saveData(data) { if (this.ready) window.ytgame.game.saveData(JSON.stringify(data)); },
};

// ═══════════════════════════════════════════════════════════════════════
// LEVEL CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════

const LD = {
  hasBoost: false, obstacles: false, isMaze: false, isLightsOut: false,
  hasPortals: false, isTron: false, isIce: false, isShrinking: false,
  isTimeAttack: false, hasMinefield: false, hasAISnake: false, isInfinity: false,
  goldenGuarantee: 0, chaseMines: false,
  isGravity: false, isWrap: false, isMirror: false, isReverse: false,
};
const L = (o) => ({ ...LD, ...o });

const PHASES = [
  { name: 'LEARN', start: 0, end: 4 },
  { name: 'MASTER', start: 4, end: 10 },
  { name: 'CHALLENGE', start: 10, end: 17 },
  { name: 'ENDGAME', start: 17, end: 24 },
  { name: 'EXTREME', start: 24, end: 29 },
  { name: 'NIGHTMARE', start: 29, end: 35 },
];

const LEVELS = [
  // Phase 1: LEARN (0-3)
  L({ name: 'MEADOW', description: 'LEARN THE ROPES',
    arenaSize: 16, moveSpeed: 6.5, maxFood: 4, foodSpawnInterval: 3.0,
    unlockScore: 0, unlockLevel: -1,
    skyColor: 0x87CEEB, groundColor: 0x5CAD4A, wallColor: 0x8B7355, accentColor: 0x6BBF59,
    camDist: 12, camHeight: 6, musicRoot: 130.8,
    star1: 50, star2: 120, star3: 250 }),
  L({ name: 'GARDEN', description: 'GOLDEN HARVEST',
    arenaSize: 22, moveSpeed: 7.5, maxFood: 8, foodSpawnInterval: 2.0,
    unlockScore: 50, unlockLevel: 0, goldenGuarantee: 2,
    skyColor: 0xA8D8EA, groundColor: 0x6BBF59, wallColor: 0x9B8B6D, accentColor: 0x7ACC6A,
    camDist: 13, camHeight: 7, musicRoot: 146.8,
    star1: 80, star2: 180, star3: 350 }),
  L({ name: 'FOREST', description: 'WATCH FOR TREES',
    arenaSize: 24, moveSpeed: 8, maxFood: 8, foodSpawnInterval: 2.0,
    unlockScore: 80, unlockLevel: 1, obstacles: true,
    skyColor: 0x7ABAA7, groundColor: 0x4A7A4A, wallColor: 0x6B5B4A, accentColor: 0x7A5A3A,
    camDist: 14, camHeight: 8, musicRoot: 110,
    star1: 60, star2: 140, star3: 280 }),
  L({ name: 'ORCHARD', description: 'GOLDEN OBSTACLES',
    arenaSize: 26, moveSpeed: 8, maxFood: 10, foodSpawnInterval: 1.8,
    unlockScore: 60, unlockLevel: 2, obstacles: true, goldenGuarantee: 3,
    skyColor: 0xBBDDCC, groundColor: 0x5AAA55, wallColor: 0x7A6A4A, accentColor: 0x8AAA55,
    camDist: 14, camHeight: 8, musicRoot: 138.6,
    star1: 80, star2: 180, star3: 380 }),
  // Phase 2: MASTER (4-9)
  L({ name: 'LABYRINTH', description: 'TIGHT CORRIDORS',
    arenaSize: 22, moveSpeed: 7, maxFood: 6, foodSpawnInterval: 2.5,
    unlockScore: 80, unlockLevel: 3, isMaze: true,
    skyColor: 0x8EC8D8, groundColor: 0x5A8A7A, wallColor: 0x7A6A5A, accentColor: 0x6A8A7A,
    camDist: 18, camHeight: 16, musicRoot: 116.5,
    star1: 50, star2: 120, star3: 240 }),
  L({ name: 'CANYON', description: 'BOOST THROUGH',
    arenaSize: 26, moveSpeed: 9, maxFood: 10, foodSpawnInterval: 1.5,
    unlockScore: 80, unlockLevel: 4, hasBoost: true, obstacles: true,
    skyColor: 0xE8C88A, groundColor: 0xC4956A, wallColor: 0x8A6A4A, accentColor: 0xBB8855,
    camDist: 14, camHeight: 8, musicRoot: 164.8,
    star1: 70, star2: 160, star3: 320 }),
  L({ name: 'CAVERN', description: 'DARKNESS AHEAD',
    arenaSize: 22, moveSpeed: 8, maxFood: 8, foodSpawnInterval: 2.0,
    unlockScore: 100, unlockLevel: 5, hasBoost: true, obstacles: true, isLightsOut: true,
    skyColor: 0x111111, groundColor: 0x2A2A3A, wallColor: 0x4A4A5A, accentColor: 0xCC8844,
    camDist: 8, camHeight: 5, musicRoot: 92.5,
    star1: 50, star2: 120, star3: 240 }),
  L({ name: 'WARP ZONE', description: 'PORTAL SHORTCUTS',
    arenaSize: 25, moveSpeed: 9, maxFood: 8, foodSpawnInterval: 1.8,
    unlockScore: 80, unlockLevel: 6, hasBoost: true, hasPortals: true,
    skyColor: 0x2A1A3E, groundColor: 0x3A2A4A, wallColor: 0x6A4A8A, accentColor: 0x9966BB,
    camDist: 14, camHeight: 8, musicRoot: 103.8,
    star1: 60, star2: 140, star3: 280 }),
  L({ name: 'FROZEN LAKE', description: 'SLIPPERY CONTROLS',
    arenaSize: 24, moveSpeed: 10, maxFood: 6, foodSpawnInterval: 2.0,
    unlockScore: 80, unlockLevel: 7, isIce: true,
    skyColor: 0xD0E8F8, groundColor: 0xC8E0F0, wallColor: 0x8899AA, accentColor: 0x6688BB,
    camDist: 14, camHeight: 8, musicRoot: 123.5,
    star1: 50, star2: 110, star3: 220 }),
  L({ name: 'CLOCKWORK', description: 'EAT OR DIE',
    arenaSize: 22, moveSpeed: 10, maxFood: 10, foodSpawnInterval: 1.0,
    unlockScore: 80, unlockLevel: 8, isTimeAttack: true,
    skyColor: 0x2A1A1A, groundColor: 0x5A2A2A, wallColor: 0x8A3A3A, accentColor: 0xCC3333,
    camDist: 12, camHeight: 6, musicRoot: 196,
    star1: 60, star2: 140, star3: 280 }),
  // Phase 3: CHALLENGE (10-16)
  L({ name: 'NEON GRID', description: 'TRAIL OF LIGHT',
    arenaSize: 20, moveSpeed: 9, maxFood: 5, foodSpawnInterval: 2.5,
    unlockScore: 100, unlockLevel: 9, isTron: true,
    skyColor: 0x0A0A2A, groundColor: 0x1A1A3A, wallColor: 0x3A3A6A, accentColor: 0x4488CC,
    camDist: 16, camHeight: 14, musicRoot: 130.8,
    star1: 50, star2: 110, star3: 220 }),
  L({ name: 'ARENA', description: 'OUTSMART THE RIVAL',
    arenaSize: 24, moveSpeed: 9, maxFood: 10, foodSpawnInterval: 1.5,
    unlockScore: 80, unlockLevel: 10, hasBoost: true, hasAISnake: true,
    skyColor: 0xD4A87A, groundColor: 0x8A7A5A, wallColor: 0x6A5A4A, accentColor: 0xCC6633,
    camDist: 14, camHeight: 8, musicRoot: 146.8,
    star1: 60, star2: 140, star3: 280 }),
  L({ name: 'DARK MAZE', description: 'NAVIGATE BLIND',
    arenaSize: 22, moveSpeed: 7, maxFood: 6, foodSpawnInterval: 2.5,
    unlockScore: 80, unlockLevel: 11, isMaze: true, isLightsOut: true,
    skyColor: 0x0A0A0A, groundColor: 0x1A2A2A, wallColor: 0x4A5A5A, accentColor: 0x55AAAA,
    camDist: 10, camHeight: 8, musicRoot: 87.3,
    star1: 40, star2: 100, star3: 200 }),
  L({ name: 'ICE RINK', description: 'SLIPPERY OBSTACLES',
    arenaSize: 24, moveSpeed: 9, maxFood: 8, foodSpawnInterval: 2.0,
    unlockScore: 80, unlockLevel: 12, isIce: true, obstacles: true, hasBoost: true,
    skyColor: 0xC8DDF0, groundColor: 0xBBCCDD, wallColor: 0x7788AA, accentColor: 0x5577AA,
    camDist: 14, camHeight: 8, musicRoot: 116.5,
    star1: 50, star2: 120, star3: 240 }),
  L({ name: 'WARP SPRINT', description: 'TIMED PORTALS',
    arenaSize: 25, moveSpeed: 10, maxFood: 10, foodSpawnInterval: 1.0,
    unlockScore: 80, unlockLevel: 13, isTimeAttack: true, hasPortals: true, hasBoost: true,
    skyColor: 0x2A1A3E, groundColor: 0x4A2A5A, wallColor: 0x6A4A8A, accentColor: 0xBB66DD,
    camDist: 14, camHeight: 8, musicRoot: 196,
    star1: 60, star2: 140, star3: 280 }),
  L({ name: 'LIGHT TRAIL', description: 'TRON + BOOST',
    arenaSize: 22, moveSpeed: 10, maxFood: 6, foodSpawnInterval: 2.0,
    unlockScore: 80, unlockLevel: 14, isTron: true, hasBoost: true,
    skyColor: 0x0A0A2A, groundColor: 0x1A1A3A, wallColor: 0x3A3A6A, accentColor: 0x55AAFF,
    camDist: 16, camHeight: 14, musicRoot: 138.6,
    star1: 50, star2: 110, star3: 220 }),
  L({ name: 'VORTEX', description: 'GRAVITATIONAL PULL',
    arenaSize: 24, moveSpeed: 8, maxFood: 8, foodSpawnInterval: 2.0,
    unlockScore: 80, unlockLevel: 15, isGravity: true, hasBoost: true,
    skyColor: 0x1A1A2A, groundColor: 0x2A2A4A, wallColor: 0x5A4A7A, accentColor: 0xAA77FF,
    camDist: 14, camHeight: 8, musicRoot: 103.8,
    star1: 50, star2: 120, star3: 240 }),
  // Phase 4: ENDGAME (17-23)
  L({ name: 'SIEGE', description: 'WALLS CLOSING IN',
    arenaSize: 28, moveSpeed: 8, maxFood: 8, foodSpawnInterval: 1.5,
    unlockScore: 80, unlockLevel: 16, hasBoost: true, isShrinking: true,
    skyColor: 0xBB7744, groundColor: 0x7A5A3A, wallColor: 0xAA5533, accentColor: 0xCC4422,
    camDist: 16, camHeight: 10, musicRoot: 87.3,
    star1: 50, star2: 120, star3: 240 }),
  L({ name: 'WASTELAND', description: 'DODGE THE MINES',
    arenaSize: 25, moveSpeed: 8, maxFood: 8, foodSpawnInterval: 1.8,
    unlockScore: 80, unlockLevel: 17, hasBoost: true, hasMinefield: true, chaseMines: true,
    skyColor: 0x5A6A4A, groundColor: 0x3A4A2A, wallColor: 0x5A5A3A, accentColor: 0x884422,
    camDist: 14, camHeight: 8, musicRoot: 138.6,
    star1: 50, star2: 110, star3: 220 }),
  L({ name: 'BLITZ', description: 'PURE REFLEX',
    arenaSize: 14, moveSpeed: 13, maxFood: 4, foodSpawnInterval: 2.0,
    unlockScore: 80, unlockLevel: 18,
    skyColor: 0x8A2A2A, groundColor: 0x5A1A1A, wallColor: 0xAA3333, accentColor: 0xEE2222,
    camDist: 10, camHeight: 5, musicRoot: 164.8,
    star1: 40, star2: 90, star3: 180 }),
  L({ name: 'COLOSSEUM', description: 'RIVAL + SHRINKING',
    arenaSize: 26, moveSpeed: 9, maxFood: 10, foodSpawnInterval: 1.5,
    unlockScore: 80, unlockLevel: 19, hasBoost: true, hasAISnake: true, isShrinking: true,
    skyColor: 0xCC9966, groundColor: 0x8A6A4A, wallColor: 0x7A5A3A, accentColor: 0xDD7733,
    camDist: 14, camHeight: 8, musicRoot: 146.8,
    star1: 50, star2: 120, star3: 240 }),
  L({ name: 'DARK MINES', description: 'BLIND MINEFIELD',
    arenaSize: 22, moveSpeed: 8, maxFood: 8, foodSpawnInterval: 2.0,
    unlockScore: 80, unlockLevel: 20, isLightsOut: true, hasBoost: true, hasMinefield: true,
    skyColor: 0x0A0A0A, groundColor: 0x2A1A1A, wallColor: 0x5A3A3A, accentColor: 0xCC5522,
    camDist: 8, camHeight: 5, musicRoot: 92.5,
    star1: 40, star2: 100, star3: 200 }),
  L({ name: 'GAUNTLET', description: 'TIMED OBSTACLE RUSH',
    arenaSize: 24, moveSpeed: 11, maxFood: 10, foodSpawnInterval: 1.0,
    unlockScore: 80, unlockLevel: 21, obstacles: true, isTimeAttack: true, hasBoost: true,
    skyColor: 0x4A2A2A, groundColor: 0x6A3A3A, wallColor: 0x8A4A4A, accentColor: 0xCC5533,
    camDist: 14, camHeight: 8, musicRoot: 196,
    star1: 60, star2: 140, star3: 280 }),
  L({ name: 'ZEN GARDEN', description: 'INFINITE SPACE',
    arenaSize: 35, moveSpeed: 6, maxFood: 12, foodSpawnInterval: 1.0,
    unlockScore: 80, unlockLevel: 22, isWrap: true,
    skyColor: 0xE8E0D8, groundColor: 0xD4CCBB, wallColor: 0xBBAAAA, accentColor: 0x99AA88,
    camDist: 12, camHeight: 6, musicRoot: 82.4,
    star1: 80, star2: 180, star3: 400 }),
  // Phase 5: EXTREME (24-28)
  L({ name: 'MIRROR', description: 'EVERYTHING REVERSED',
    arenaSize: 22, moveSpeed: 9, maxFood: 8, foodSpawnInterval: 2.0,
    unlockScore: 100, unlockLevel: 23, isMirror: true, obstacles: true, hasBoost: true,
    skyColor: 0xCCBBDD, groundColor: 0x9988AA, wallColor: 0x776688, accentColor: 0xAA88CC,
    camDist: 14, camHeight: 8, musicRoot: 123.5,
    star1: 50, star2: 110, star3: 220 }),
  L({ name: 'SWITCH', description: 'CONTROLS FLIP',
    arenaSize: 24, moveSpeed: 9, maxFood: 8, foodSpawnInterval: 1.8,
    unlockScore: 80, unlockLevel: 24, isReverse: true, obstacles: true, hasBoost: true,
    skyColor: 0xDDCCAA, groundColor: 0xAA9977, wallColor: 0x887766, accentColor: 0xCC9944,
    camDist: 14, camHeight: 8, musicRoot: 164.8,
    star1: 50, star2: 120, star3: 240 }),
  L({ name: 'WORMHOLE', description: 'ICE + PORTALS',
    arenaSize: 26, moveSpeed: 10, maxFood: 8, foodSpawnInterval: 1.8,
    unlockScore: 80, unlockLevel: 25, isIce: true, hasPortals: true, hasBoost: true,
    skyColor: 0x1A2A4A, groundColor: 0x2A3A5A, wallColor: 0x5A6A8A, accentColor: 0x7799DD,
    camDist: 14, camHeight: 8, musicRoot: 103.8,
    star1: 50, star2: 120, star3: 240 }),
  L({ name: 'TEMPEST', description: 'ICE + SHRINKING',
    arenaSize: 26, moveSpeed: 10, maxFood: 8, foodSpawnInterval: 1.5,
    unlockScore: 80, unlockLevel: 26, isIce: true, isShrinking: true, hasBoost: true,
    skyColor: 0x8899BB, groundColor: 0x7788AA, wallColor: 0x667799, accentColor: 0x5566AA,
    camDist: 14, camHeight: 8, musicRoot: 116.5,
    star1: 50, star2: 110, star3: 220 }),
  L({ name: 'VOID', description: 'DARK LIGHT TRAIL',
    arenaSize: 20, moveSpeed: 9, maxFood: 5, foodSpawnInterval: 2.5,
    unlockScore: 80, unlockLevel: 27, isTron: true, isLightsOut: true,
    skyColor: 0x050510, groundColor: 0x0A0A1A, wallColor: 0x2A2A4A, accentColor: 0x3366BB,
    camDist: 12, camHeight: 10, musicRoot: 87.3,
    star1: 40, star2: 100, star3: 200 }),
  // Phase 6: NIGHTMARE (29-34)
  L({ name: 'DEATH SPIRAL', description: 'GRAVITY + MINES',
    arenaSize: 24, moveSpeed: 9, maxFood: 8, foodSpawnInterval: 1.8,
    unlockScore: 80, unlockLevel: 28, isGravity: true, hasMinefield: true, hasBoost: true,
    skyColor: 0x2A1A2A, groundColor: 0x3A2A3A, wallColor: 0x5A3A5A, accentColor: 0x9944AA,
    camDist: 14, camHeight: 8, musicRoot: 98,
    star1: 50, star2: 110, star3: 220 }),
  L({ name: 'ZERO HOUR', description: 'TIMED + SHRINKING + MINES',
    arenaSize: 26, moveSpeed: 10, maxFood: 10, foodSpawnInterval: 1.0,
    unlockScore: 80, unlockLevel: 29, isTimeAttack: true, isShrinking: true, hasMinefield: true, hasBoost: true,
    skyColor: 0x3A1A1A, groundColor: 0x5A2A2A, wallColor: 0x8A3A3A, accentColor: 0xDD3322,
    camDist: 16, camHeight: 10, musicRoot: 196,
    star1: 50, star2: 120, star3: 240 }),
  L({ name: 'PANDEMONIUM', description: 'PURE CHAOS',
    arenaSize: 26, moveSpeed: 10, maxFood: 10, foodSpawnInterval: 1.5,
    unlockScore: 80, unlockLevel: 30, obstacles: true, hasPortals: true, hasMinefield: true, hasBoost: true, chaseMines: true,
    skyColor: 0x3A2A1A, groundColor: 0x5A3A2A, wallColor: 0x8A5A3A, accentColor: 0xDD7733,
    camDist: 14, camHeight: 8, musicRoot: 164.8,
    star1: 50, star2: 120, star3: 240 }),
  L({ name: 'THE DEEP', description: 'DARK GRAVITY ICE',
    arenaSize: 22, moveSpeed: 9, maxFood: 6, foodSpawnInterval: 2.0,
    unlockScore: 80, unlockLevel: 31, isLightsOut: true, isGravity: true, isIce: true, hasBoost: true,
    skyColor: 0x050510, groundColor: 0x1A1A2A, wallColor: 0x3A3A5A, accentColor: 0x4466BB,
    camDist: 8, camHeight: 5, musicRoot: 82.4,
    star1: 40, star2: 100, star3: 200 }),
  L({ name: 'OMEGA', description: 'MAXIMUM OVERLOAD',
    arenaSize: 24, moveSpeed: 10, maxFood: 6, foodSpawnInterval: 1.5,
    unlockScore: 80, unlockLevel: 32, hasBoost: true, isInfinity: true,
    skyColor: 0x1A0A2A, groundColor: 0x2A1A3A, wallColor: 0x5A3A6A, accentColor: 0xAA44DD,
    camDist: 14, camHeight: 8, musicRoot: 103.8,
    star1: 80, star2: 180, star3: 360 }),
  L({ name: 'ABYSS', description: 'ENDLESS ESCALATION',
    arenaSize: 28, moveSpeed: 8, maxFood: 8, foodSpawnInterval: 1.5,
    unlockScore: 100, unlockLevel: 33, hasBoost: true, isInfinity: true,
    skyColor: 0x1A1A3A, groundColor: 0x2A2A4A, wallColor: 0x5A4A7A, accentColor: 0x8866CC,
    camDist: 14, camHeight: 8, musicRoot: 98,
    star1: 80, star2: 180, star3: 360 }),
];

const NUM_LEVELS = LEVELS.length;

// ═══════════════════════════════════════════════════════════════════════
// SKINS (unlocked by total star count)
// ═══════════════════════════════════════════════════════════════════════

const SKINS = [
  { id: 'default', name: 'CLASSIC', head: 0x33CC55, body: 0x2BAF4A, unlock: 0 },
  { id: 'golden', name: 'GOLDEN', head: 0xFFD700, body: 0xDAA520, unlock: 5 },
  { id: 'crimson', name: 'CRIMSON', head: 0xEE3333, body: 0xCC1111, unlock: 10 },
  { id: 'ocean', name: 'OCEAN', head: 0x33AAEE, body: 0x1188CC, unlock: 18 },
  { id: 'tiger', name: 'TIGER', head: 0xFF9922, body: 0xDD7711, unlock: 26 },
  { id: 'frost', name: 'FROST', head: 0xBBDDFF, body: 0x88BBEE, unlock: 35 },
  { id: 'lava', name: 'LAVA', head: 0xFF5500, body: 0xCC3300, unlock: 44 },
  { id: 'galaxy', name: 'GALAXY', head: 0xAA55FF, body: 0x7733DD, unlock: 55 },
  { id: 'ghost', name: 'GHOST', head: 0xEEEEEE, body: 0xCCCCCC, unlock: 65 },
  { id: 'prism', name: 'PRISM', head: 0xFF3366, body: 0x33FF66, unlock: 75, isRainbow: true },
  { id: 'obsidian', name: 'OBSIDIAN', head: 0x333333, body: 0x1A1A1A, unlock: 85 },
  { id: 'diamond', name: 'DIAMOND', head: 0xDDEEFF, body: 0xBBCCEE, unlock: 95 },
  { id: 'phoenix', name: 'PHOENIX', head: 0xFF4400, body: 0xFFAA00, unlock: 105, isRainbow: true },
];

// ═══════════════════════════════════════════════════════════════════════
// POWER-UP DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════

const POWERUP_TYPES = [
  { id: 'magnet', name: 'MAGNET', duration: 5, color: 0x3399FF },
  { id: 'shield', name: 'SHIELD', duration: 999, color: 0x44FF44 },
  { id: 'slowmo', name: 'SLOW MO', duration: 8, color: 0x9944FF },
  { id: 'x2', name: 'x2 SCORE', duration: 10, color: 0xFFAA00 },
];
const POWERUP_SPAWN_CHANCE = 0.12;
const POWERUP_DESPAWN_TIME = 10;
const POWERUP_ATTRACT_RADIUS = 8;
const POWERUP_ATTRACT_SPEED = 5;

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════

const TURN_SPEED = 3.2;
const SEGMENT_SPACING = 0.8;
const INITIAL_SEGMENTS = 3;
const FOOD_COLORS = [0xE63946, 0xFF6B35, 0xF7C948, 0xE84393, 0x4ECDC4];
const GOLDEN_COLOR = 0xFFD700;
const GOLDEN_CHANCE = 0.12;

const BOOST_DURATION = 1.2;
const BOOST_SPEED_MULT = 2.0;
const BOOST_RECHARGE = 3.5;
const BOOST_ACCEL = 8;
const BOOST_DECEL = 2;

const BULGE_SPEED = 8;
const BULGE_SCALE = 1.5;
const SPEED_RAMP_PER_FOOD = 0.02;
const SPEED_RAMP_MAX = 1.6;
const COMBO_WINDOW = 3.0;

const TRON_TRAIL_INTERVAL = 0.4;
const TRON_TRAIL_MAX = 5000;
const TRON_GRACE_COUNT = 20;
const TRON_CELL_SIZE = 1.0;

const ICE_TURN_FRICTION = 1.8;
const ICE_TURN_ACCEL = 4.0;

const SHRINK_RATE = 0.4;
const SHRINK_MIN = 8;

const TIME_ATTACK_START = 30;
const TIME_ATTACK_PER_FOOD = 4;

const MINE_INITIAL = 15;
const MINE_SPAWN_INTERVAL = 8;
const MINE_MAX = 40;
const MINE_RADIUS = 0.8;
const MINE_CHASE_SPEED = 0.3;

const AI_SPEED_MULT = 0.85;
const AI_TURN_SPEED = 3.0;
const AI_SEGMENTS = 5;
const AI_CUTOFF_CHANCE = 0.3;

const INFINITY_PHASE_DURATION = 30;

const GRAVITY_PULL = 2.5;
const REVERSE_NORMAL = 12;
const REVERSE_FLIPPED = 5;

const MAZE_LAYOUT = [
  [-8,-8,-2,-8],[2,-8,8,-8],[-8,8,-2,8],[2,8,8,8],
  [-8,-8,-8,-2],[-8,2,-8,8],[8,-8,8,-2],[8,2,8,8],
  [-18,-14,-4,-14],[4,-14,18,-14],[-18,14,-4,14],[4,14,18,14],
  [-14,-18,-14,-8],[-14,8,-14,18],[14,-18,14,-8],[14,8,14,18],
  [0,-18,0,-10],[0,10,0,18],[-18,0,-10,0],[10,0,18,0],
];

const PORTAL_PAIRS_DEF = [
  { a: { x: -16, z: -16 }, b: { x: 16, z: 16 }, color: 0x3399CC },
  { a: { x: -16, z: 16 }, b: { x: 16, z: -16 }, color: 0xCC6699 },
];

const BASE_FOV = 65;
const BOOST_FOV = 78;

// ═══════════════════════════════════════════════════════════════════════
// AUDIO
// ═══════════════════════════════════════════════════════════════════════

let audioCtx = null;
let masterGain = null;
const audioBuffers = { eat: [] };
let lastEatIndex = -1;
let audioLoaded = false;

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = YT.audioEnabled ? 1 : 0;
  masterGain.connect(audioCtx.destination);
  loadSounds();
}

async function loadSounds() {
  if (audioLoaded) return;
  const load = async (path) => {
    try {
      const resp = await fetch(path);
      const buf = await resp.arrayBuffer();
      return await audioCtx.decodeAudioData(buf);
    } catch { return null; }
  };
  const eatBufs = await Promise.all(
    ['eat_1','eat_2','eat_3','eat_4','eat_5','eat_6'].map(f => load(`sounds/eat/${f}.mp3`))
  );
  audioBuffers.eat = eatBufs.filter(Boolean);
  audioLoaded = true;
}

function playBuffer(buf, vol = 0.35) {
  if (!audioCtx || !buf) return;
  const source = audioCtx.createBufferSource();
  const gain = audioCtx.createGain();
  source.buffer = buf;
  gain.gain.value = vol;
  source.connect(gain);
  gain.connect(masterGain);
  source.start();
}

function playEatSound() {
  if (!audioCtx || !audioBuffers.eat.length) return;
  const bufs = audioBuffers.eat;
  let idx = Math.floor(Math.random() * bufs.length);
  if (bufs.length > 1) while (idx === lastEatIndex) idx = Math.floor(Math.random() * bufs.length);
  lastEatIndex = idx;
  playBuffer(bufs[idx], 0.35);
}

function playDeathSound() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain); gain.connect(masterGain);
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(300, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.5);
  gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
  osc.start(); osc.stop(audioCtx.currentTime + 0.5);
}

function playPortalSound() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain); gain.connect(masterGain);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1600, audioCtx.currentTime + 0.15);
  osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
  osc.start(); osc.stop(audioCtx.currentTime + 0.3);
}

function playMineSound() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain); gain.connect(masterGain);
  osc.type = 'square';
  osc.frequency.setValueAtTime(150, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.4);
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
  osc.start(); osc.stop(audioCtx.currentTime + 0.4);
}

function playGoldenSound() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const notes = [523, 659, 784];
  for (let i = 0; i < 3; i++) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(masterGain);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(notes[i], now + i * 0.07);
    gain.gain.setValueAtTime(0.1, now + i * 0.07);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.25);
    osc.start(now + i * 0.07); osc.stop(now + i * 0.07 + 0.25);
  }
}

function playComboSound(tier) {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const baseNote = 440 + tier * 110;
  for (let i = 0; i < tier; i++) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(masterGain);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseNote + i * 55, now + i * 0.05);
    gain.gain.setValueAtTime(0.06, now + i * 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.2);
    osc.start(now + i * 0.05); osc.stop(now + i * 0.05 + 0.2);
  }
}

function playBoostSound() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const noise = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  noise.connect(gain); gain.connect(masterGain);
  noise.type = 'sawtooth';
  noise.frequency.setValueAtTime(100, now);
  noise.frequency.exponentialRampToValueAtTime(400, now + 0.15);
  noise.frequency.exponentialRampToValueAtTime(200, now + 0.3);
  gain.gain.setValueAtTime(0.06, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  noise.start(now); noise.stop(now + 0.3);
}

function playShieldBreakSound() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  for (let i = 0; i < 3; i++) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(masterGain);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800 - i * 200, now + i * 0.04);
    osc.frequency.exponentialRampToValueAtTime(200, now + i * 0.04 + 0.2);
    gain.gain.setValueAtTime(0.1, now + i * 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.2);
    osc.start(now + i * 0.04); osc.stop(now + i * 0.04 + 0.2);
  }
}

function playPowerUpSound() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const notes = [392, 523, 659, 784];
  for (let i = 0; i < 4; i++) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(masterGain);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(notes[i], now + i * 0.06);
    gain.gain.setValueAtTime(0.08, now + i * 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.2);
    osc.start(now + i * 0.06); osc.stop(now + i * 0.06 + 0.2);
  }
}

function playUIClick() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain); gain.connect(masterGain);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);
  osc.start(); osc.stop(audioCtx.currentTime + 0.06);
}

// ═══════════════════════════════════════════════════════════════════════
// PROCEDURAL MUSIC ENGINE
// ═══════════════════════════════════════════════════════════════════════

class MusicEngine {
  constructor() {
    this.playing = false;
    this.nodes = [];
    this.bpm = 100;
    this.rootFreq = 130.8;
    this.beatTimer = 0;
    this.beatInterval = 0.6;
    this.intensityTarget = 0.3;
    this.intensity = 0;
  }

  start(rootFreq, bpm) {
    if (!audioCtx) return;
    this.stop();
    this.playing = true;
    this.rootFreq = rootFreq;
    this.bpm = bpm;
    this.beatInterval = 60 / bpm;
    this.beatTimer = 0;
    this.intensity = 0;
    this.intensityTarget = 0.3;

    const now = audioCtx.currentTime;

    // Sub bass drone
    const sub = audioCtx.createOscillator();
    sub.type = 'sine';
    sub.frequency.value = rootFreq / 2;
    const subGain = audioCtx.createGain();
    subGain.gain.setValueAtTime(0, now);
    subGain.gain.linearRampToValueAtTime(0.05, now + 3);
    sub.connect(subGain);
    subGain.connect(masterGain);
    sub.start(now);
    this.nodes.push({ osc: sub, gain: subGain });

    // Pad (two detuned saws through low-pass)
    const pad1 = audioCtx.createOscillator();
    pad1.type = 'sawtooth';
    pad1.frequency.value = rootFreq;
    const pad2 = audioCtx.createOscillator();
    pad2.type = 'sawtooth';
    pad2.frequency.value = rootFreq * 1.003;
    const padFilter = audioCtx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.value = 250;
    padFilter.Q.value = 0.7;
    const padGain = audioCtx.createGain();
    padGain.gain.setValueAtTime(0, now);
    padGain.gain.linearRampToValueAtTime(0.018, now + 4);
    pad1.connect(padFilter);
    pad2.connect(padFilter);
    padFilter.connect(padGain);
    padGain.connect(masterGain);
    pad1.start(now);
    pad2.start(now);
    this.nodes.push({ osc: pad1, gain: padGain, extra: [pad2, padFilter] });

    // LFO on pad filter for movement
    const lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15;
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 80;
    lfo.connect(lfoGain);
    lfoGain.connect(padFilter.frequency);
    lfo.start(now);
    this.nodes.push({ osc: lfo, gain: lfoGain });

    this._padFilter = padFilter;
    this._padGain = padGain;
    this._subGain = subGain;
  }

  beat() {
    if (!audioCtx || !this.playing) return;
    const now = audioCtx.currentTime;
    // Rhythmic kick-like pulse
    const osc = audioCtx.createOscillator();
    osc.frequency.setValueAtTime(70, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);
    const gain = audioCtx.createGain();
    const vol = 0.02 + this.intensity * 0.03;
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  update(dt, speedMult) {
    if (!this.playing) return;
    // Adjust intensity based on speed
    this.intensityTarget = Math.min(1, (speedMult - 1) / 0.6 * 0.5 + 0.3);
    this.intensity += (this.intensityTarget - this.intensity) * 0.5 * dt;

    // Update pad filter based on intensity
    if (this._padFilter) {
      this._padFilter.frequency.value = 200 + this.intensity * 400;
    }
    if (this._subGain) {
      this._subGain.gain.value = 0.04 + this.intensity * 0.03;
    }

    // Beat scheduling
    const interval = 60 / (this.bpm * Math.max(0.8, speedMult));
    this.beatTimer += dt;
    if (this.beatTimer >= interval) {
      this.beatTimer -= interval;
      this.beat();
    }
  }

  stop() {
    if (!this.playing) return;
    this.playing = false;
    const now = audioCtx ? audioCtx.currentTime : 0;
    for (const n of this.nodes) {
      try {
        if (n.gain && n.gain.gain) n.gain.gain.linearRampToValueAtTime(0, now + 0.5);
        if (n.osc) setTimeout(() => { try { n.osc.stop(); n.osc.disconnect(); } catch {} }, 600);
        if (n.extra) for (const e of n.extra) setTimeout(() => { try { e.stop ? e.stop() : e.disconnect(); } catch {} }, 600);
      } catch {}
    }
    this.nodes = [];
    this._padFilter = null;
    this._padGain = null;
    this._subGain = null;
  }
}

const music = new MusicEngine();

// ═══════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════

function disposeObject(obj) {
  obj.traverse(ch => {
    if (ch.geometry) ch.geometry.dispose();
    if (ch.material) {
      if (Array.isArray(ch.material)) ch.material.forEach(m => m.dispose());
      else ch.material.dispose();
    }
  });
}

function haptic(ms) {
  if (navigator.vibrate) try { navigator.vibrate(ms); } catch {}
}

function storageGet(key) { try { return localStorage.getItem(key); } catch { return null; } }
function storageSet(key, val) { try { localStorage.setItem(key, val); } catch {} }

// ═══════════════════════════════════════════════════════════════════════
// PARTICLE SYSTEM
// ═══════════════════════════════════════════════════════════════════════

class Particles {
  constructor(scene, max = 400) {
    this.max = max;
    this.pool = [];
    for (let i = 0; i < max; i++) {
      this.pool.push({ alive: false, x:0, y:0, z:0, vx:0, vy:0, vz:0, life:0, maxLife:1, scale:1, r:1, g:1, b:1 });
    }
    const geo = isMobile ? new THREE.PlaneGeometry(0.15, 0.15) : new THREE.IcosahedronGeometry(0.1, 0);
    const mat = new THREE.MeshBasicMaterial();
    this.mesh = new THREE.InstancedMesh(geo, mat, max);
    this.mesh.count = 0;
    this.mesh.frustumCulled = false;
    this.dummy = new THREE.Object3D();
    this.colorArr = new Float32Array(max * 3).fill(1);
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(this.colorArr, 3);
    scene.add(this.mesh);
  }

  emit(pos, count, color, opts = {}) {
    const speed = opts.speed || 5;
    const life = opts.life || 0.6;
    const baseScale = opts.scale || 1;
    const c = new THREE.Color(color);
    let emitted = 0;
    for (let i = 0; i < this.max && emitted < count; i++) {
      if (this.pool[i].alive) continue;
      const p = this.pool[i];
      p.alive = true;
      p.x = pos.x + (Math.random() - 0.5) * 0.3;
      p.y = pos.y + (Math.random() - 0.5) * 0.3;
      p.z = pos.z + (Math.random() - 0.5) * 0.3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const s = speed * (0.3 + Math.random() * 0.7);
      p.vx = Math.sin(phi) * Math.cos(theta) * s;
      p.vy = Math.abs(Math.cos(phi)) * s * 0.7 + 2.5;
      p.vz = Math.sin(phi) * Math.sin(theta) * s;
      p.life = life * (0.6 + Math.random() * 0.4);
      p.maxLife = p.life;
      p.scale = baseScale * (0.6 + Math.random() * 0.4);
      p.r = c.r * (0.8 + Math.random() * 0.2);
      p.g = c.g * (0.8 + Math.random() * 0.2);
      p.b = c.b * (0.8 + Math.random() * 0.2);
      emitted++;
    }
  }

  update(dt) {
    let visible = 0;
    for (let i = 0; i < this.max; i++) {
      const p = this.pool[i];
      if (!p.alive) continue;
      p.life -= dt;
      if (p.life <= 0) { p.alive = false; continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      p.vy -= 10 * dt;
      const t = p.life / p.maxLife;
      this.dummy.position.set(p.x, Math.max(0.05, p.y), p.z);
      this.dummy.scale.setScalar(p.scale * t);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(visible, this.dummy.matrix);
      this.colorArr[visible * 3] = p.r;
      this.colorArr[visible * 3 + 1] = p.g;
      this.colorArr[visible * 3 + 2] = p.b;
      visible++;
    }
    this.mesh.count = visible;
    if (visible > 0) {
      this.mesh.instanceMatrix.needsUpdate = true;
      this.mesh.instanceColor.needsUpdate = true;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════

let scene, camera, renderer;
let ambientLight, dirLight, hemiLight;
let particles;
let snake = {
  segments: [], positions: [], rotations: [],
  direction: new THREE.Vector3(0, 0, 1),
  targetRotation: Math.PI, alive: false, tail: null,
};
let foods = [];
let foodGroup, snakeGroup, arenaGroup, obstacleGroup;
let score = 0, isPlaying = false, isPaused = false, foodSpawnTimer = 0, clock;
let currentLevel = 0;
let highScores = [];
let unlockedLevels = [];
let levelStars = [];
let totalStars = 0;
let selectedSkin = 0;

let foodBulges = [], pendingSegments = 0;
let boostGauge = 1, isBoosting = false, boostTimer = 0, currentSpeedMult = 1;
let speedRampMult = 1, foodEaten = 0;
let comboCount = 0, comboTimer = 0, comboDisplayTimer = 0;
let mazeColliders = [];
let headLight = null;
let portalPairs = [], portalMeshGroups = [], portalCooldowns = [0, 0];
let tronTrailPoints = [], tronTrailMesh = null, tronTrailCount = 0;
const tronDummy = new THREE.Object3D();
let tronGrid = {};
let shakeIntensity = 0;
let iceAngularVel = 0;
let currentArenaSize = 0, shrinkWalls = [];
let timeAttackTimer = 0;
let mines = [], mineGroup = null, mineSpawnTimer = 0;
let aiSnake = { segments: [], positions: [], direction: new THREE.Vector3(0,0,1), targetRotation: Math.PI, alive: true };
let aiSnakeGroup = null;
let infinityPhase = 0, infinityPhaseTimer = 0, infinityMines = [], infinityShrinkSize = 0;
let obstacles = [];
let cameraAngle = Math.PI;
let goldenSpawned = 0;

// Power-ups
let activePowerUp = null;
let powerUpTimer = 0;
let powerUpItems = [];
let shieldMesh = null;

// Death animation
let deathSegments = [];
let deathAnimActive = false;
let deathAnimTimer = 0;
let gameOverTimeoutId = null;

// Food eat effects
let foodEatEffects = [];

// Chomp animation
let chompTimer = 0;
const CHOMP_DURATION = 0.3;

// Infinity speed bonus (separate from food ramp)
let infinitySpeedBonus = 0;

// Reverse controls
let reverseActive = false;
let reverseTimer = 0;

// Score rolling
let displayScore = 0;
let targetScore = 0;

// Preallocated vectors
const _moveDir = new THREE.Vector3();
const _tailDir = new THREE.Vector3();
const _tailPos = new THREE.Vector3();
const _aiDir = new THREE.Vector3();
const _aiTd = new THREE.Vector3();
const _camForward = new THREE.Vector3();
const _camPos = new THREE.Vector3();
const _camLook = new THREE.Vector3();

// Input
let turnLeft = false, turnRight = false, shiftHeld = false;
let isMobile = false;
let mobileHintTimer = 0;

// UI Elements
const scoreEl = document.getElementById('score');
const highscoreEl = document.getElementById('highscore-display');
const startScreen = document.getElementById('start-screen');
const gameoverScreen = document.getElementById('gameover-screen');
const levelSelectScreen = document.getElementById('level-select-screen');
const finalScoreEl = document.getElementById('final-score');
const finalHighscoreEl = document.getElementById('final-highscore');
const finalStarsEl = document.getElementById('final-stars');
const levelUnlockMsg = document.getElementById('level-unlock-msg');
const skinUnlockMsg = document.getElementById('skin-unlock-msg');
const playBtn = document.getElementById('play-btn');
const restartBtn = document.getElementById('restart-btn');
const levelsBtn = document.getElementById('levels-btn');
const backBtn = document.getElementById('back-btn');
const levelIndicator = document.getElementById('level-indicator');
const boostBar = document.getElementById('boost-bar');
const boostFill = document.getElementById('boost-fill');
const boostLabel = document.getElementById('boost-label');
const controlsHint = document.getElementById('controls-hint');
const comboEl = document.getElementById('combo');
const levelListEl = document.getElementById('level-list');
const timerEl = document.getElementById('timer');
const warningEl = document.getElementById('warning');
const mobileHintEl = document.getElementById('mobile-hint');
const pauseOverlay = document.getElementById('pause-overlay');
const totalStarsDisplay = document.getElementById('total-stars-display');
const skinNameText = document.getElementById('skin-name-text');
const skinPreview = document.getElementById('skin-preview');
const skinLockInfo = document.getElementById('skin-lock-info');
const skinPrevBtn = document.getElementById('skin-prev-btn');
const skinNextBtn = document.getElementById('skin-next-btn');
const powerUpIndicator = document.getElementById('powerup-indicator');
const powerUpNameEl = document.getElementById('powerup-name');
const powerUpFillEl = document.getElementById('powerup-fill');
const slowmoOverlay = document.getElementById('slowmo-overlay');
const starsHud = document.getElementById('stars-hud');

// ═══════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════

function init() {
  clock = new THREE.Clock();
  highScores = new Array(NUM_LEVELS).fill(0);
  levelStars = new Array(NUM_LEVELS).fill(0);
  unlockedLevels = new Array(NUM_LEVELS).fill(false);
  loadProgress();

  isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB);

  camera = new THREE.PerspectiveCamera(BASE_FOV, window.innerWidth / window.innerHeight, 0.1, 500);

  const canvas = document.getElementById('game');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = isMobile ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;

  hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x556633, 0.6);
  scene.add(hemiLight);
  ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);
  dirLight = new THREE.DirectionalLight(0xfff5e0, 1.0);
  dirLight.position.set(15, 25, 10);
  dirLight.castShadow = true;
  const shadowRes = isMobile ? 512 : 1024;
  dirLight.shadow.mapSize.width = shadowRes;
  dirLight.shadow.mapSize.height = shadowRes;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 80;
  dirLight.shadow.camera.left = -40;
  dirLight.shadow.camera.right = 40;
  dirLight.shadow.camera.top = 40;
  dirLight.shadow.camera.bottom = -40;
  scene.add(dirLight);

  arenaGroup = new THREE.Group();
  snakeGroup = new THREE.Group();
  foodGroup = new THREE.Group();
  obstacleGroup = new THREE.Group();
  scene.add(arenaGroup);
  scene.add(snakeGroup);
  scene.add(foodGroup);
  scene.add(obstacleGroup);

  particles = new Particles(scene, 400);

  createLevelButtons();

  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  document.addEventListener('visibilitychange', onVisibilityChange);
  canvas.addEventListener('touchstart', onTouchStart, { passive: false });
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  canvas.addEventListener('touchend', onTouchEnd, { passive: false });
  playBtn.addEventListener('click', () => { initAudio(); playUIClick(); showLevelSelect(); });
  restartBtn.addEventListener('click', () => { playUIClick(); startGame(currentLevel); });
  levelsBtn.addEventListener('click', () => { playUIClick(); showLevelSelect(); });
  backBtn.addEventListener('click', () => { playUIClick(); levelSelectScreen.style.display = 'none'; startScreen.style.display = 'flex'; });
  skinPrevBtn.addEventListener('click', () => { playUIClick(); cycleSkin(-1); });
  skinNextBtn.addEventListener('click', () => { playUIClick(); cycleSkin(1); });
  pauseOverlay.addEventListener('click', resumeGame);

  buildArena(0);
  for (let i = 0; i < 5; i++) spawnFood();

  camera.position.set(0, 25, 25);
  camera.lookAt(0, 0, 0);

  YT.init();
  YT.firstFrame();
  loadCloudProgress();

  animate();

  YT.gameReady();
}

// ═══════════════════════════════════════════════════════════════════════
// LEVEL SELECT, STARS & PROGRESS
// ═══════════════════════════════════════════════════════════════════════

function createLevelButtons() {
  let currentPhase = -1;
  for (let i = 0; i < NUM_LEVELS; i++) {
    for (const phase of PHASES) {
      if (i === phase.start && currentPhase !== PHASES.indexOf(phase)) {
        currentPhase = PHASES.indexOf(phase);
        const header = document.createElement('div');
        header.className = 'phase-header';
        header.textContent = phase.name;
        levelListEl.appendChild(header);
      }
    }
    const btn = document.createElement('button');
    btn.className = 'btn level-btn';
    btn.id = `level-${i}-btn`;
    btn.innerHTML = `<span class="level-num">${i + 1}</span><span class="level-name">${LEVELS[i].name}</span><span class="level-info">${LEVELS[i].description}</span><span class="level-score" id="level-${i}-score"></span>`;
    const idx = i;
    btn.addEventListener('click', () => { if (unlockedLevels[idx]) { playUIClick(); startGame(idx); } });
    levelListEl.appendChild(btn);
  }
}

function loadProgress() {
  for (let i = 0; i < NUM_LEVELS; i++) {
    highScores[i] = parseInt(storageGet(`snake3d_hs_${i}`) || '0', 10);
    levelStars[i] = parseInt(storageGet(`snake3d_stars_${i}`) || '0', 10);
  }
  selectedSkin = parseInt(storageGet('snake3d_skin') || '0', 10);
  unlockedLevels[0] = true;
  for (let i = 1; i < NUM_LEVELS; i++) {
    const req = LEVELS[i];
    unlockedLevels[i] = highScores[req.unlockLevel] >= req.unlockScore;
  }
  // TODO: revert before shipping
  for (let i = 0; i < NUM_LEVELS; i++) unlockedLevels[i] = true;
  calculateTotalStars();
}

async function loadCloudProgress() {
  const data = await YT.loadData();
  if (!data) return;
  let changed = false;
  if (data.highScores) {
    for (let i = 0; i < NUM_LEVELS; i++) {
      const cloud = data.highScores[i] || 0;
      if (cloud > highScores[i]) { highScores[i] = cloud; changed = true; }
    }
  }
  if (data.levelStars) {
    for (let i = 0; i < NUM_LEVELS; i++) {
      const cloud = data.levelStars[i] || 0;
      if (cloud > levelStars[i]) { levelStars[i] = cloud; changed = true; }
    }
  }
  if (data.selectedSkin != null) selectedSkin = data.selectedSkin;
  if (changed) {
    saveProgress();
    loadProgress();
  }
}

function saveProgress() {
  for (let i = 0; i < NUM_LEVELS; i++) {
    storageSet(`snake3d_hs_${i}`, String(highScores[i]));
    storageSet(`snake3d_stars_${i}`, String(levelStars[i]));
  }
  storageSet('snake3d_skin', String(selectedSkin));
  // YouTube cloud save
  YT.saveData({ highScores, levelStars, selectedSkin });
}

function calculateTotalStars() {
  totalStars = 0;
  for (let i = 0; i < NUM_LEVELS; i++) totalStars += levelStars[i];
}

function getStarsForScore(levelIdx, sc) {
  const lvl = LEVELS[levelIdx];
  if (sc >= lvl.star3) return 3;
  if (sc >= lvl.star2) return 2;
  if (sc >= lvl.star1) return 1;
  return 0;
}

function starString(count) {
  return '\u2605'.repeat(count) + '\u2606'.repeat(3 - count);
}

function showLevelSelect() {
  startScreen.style.display = 'none';
  gameoverScreen.style.display = 'none';
  levelSelectScreen.style.display = 'flex';
  loadProgress();
  updateLevelButtons();
  updateSkinDisplay();
}

function updateLevelButtons() {
  calculateTotalStars();
  totalStarsDisplay.textContent = `\u2605 ${totalStars} / ${NUM_LEVELS * 3}`;

  for (let i = 0; i < NUM_LEVELS; i++) {
    const btn = document.getElementById(`level-${i}-btn`);
    const scoreSpan = document.getElementById(`level-${i}-score`);
    if (unlockedLevels[i]) {
      btn.disabled = false;
      btn.querySelector('.level-name').innerHTML = LEVELS[i].name;
      const stars = levelStars[i];
      let info = `<span class="level-stars-display">${starString(stars)}</span>`;
      if (highScores[i] > 0) info += ` BEST: ${highScores[i]}`;
      scoreSpan.innerHTML = info;
    } else {
      btn.disabled = true;
      btn.querySelector('.level-name').innerHTML = `<span class="lock-icon">\u25A0</span>${LEVELS[i].name}`;
      scoreSpan.textContent = `${LEVELS[i].unlockScore} PTS ON ${LEVELS[LEVELS[i].unlockLevel].name}`;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════
// SKIN SYSTEM
// ═══════════════════════════════════════════════════════════════════════

function cycleSkin(dir) {
  selectedSkin = (selectedSkin + dir + SKINS.length) % SKINS.length;
  updateSkinDisplay();
  storageSet('snake3d_skin', String(selectedSkin));
}

function updateSkinDisplay() {
  const skin = SKINS[selectedSkin];
  skinNameText.textContent = skin.name;
  skinPreview.style.backgroundColor = '#' + skin.head.toString(16).padStart(6, '0');
  if (totalStars >= skin.unlock) {
    skinLockInfo.textContent = '';
  } else {
    skinLockInfo.textContent = `UNLOCK AT ${skin.unlock} \u2605`;
  }
}

function getActiveSkin() {
  const skin = SKINS[selectedSkin];
  if (totalStars >= skin.unlock) return skin;
  return SKINS[0]; // fallback to default
}

// ═══════════════════════════════════════════════════════════════════════
// ARENA BUILDING
// ═══════════════════════════════════════════════════════════════════════

function clearArena() {
  const clearGroup = (g) => {
    while (g.children.length) {
      const c = g.children[0]; g.remove(c); disposeObject(c);
    }
  };
  clearGroup(arenaGroup); clearGroup(obstacleGroup);
  obstacles = []; mazeColliders = [];
  portalPairs = []; portalMeshGroups = []; portalCooldowns = [0, 0];
  shrinkWalls = [];
  if (headLight) { scene.remove(headLight); headLight = null; }
  if (tronTrailMesh) { scene.remove(tronTrailMesh); tronTrailMesh.geometry.dispose(); tronTrailMesh.material.dispose(); tronTrailMesh = null; }
  tronTrailPoints = []; tronTrailCount = 0; tronGrid = {};
  if (mineGroup) { scene.remove(mineGroup); disposeObject(mineGroup); mineGroup = null; }
  mines = [];
  if (aiSnakeGroup) { scene.remove(aiSnakeGroup); disposeObject(aiSnakeGroup); aiSnakeGroup = null; }
  aiSnake.segments = []; aiSnake.positions = [];
  // Clear power-up items
  for (const p of powerUpItems) { scene.remove(p.mesh); disposeObject(p.mesh); }
  powerUpItems = [];
  if (shieldMesh) { scene.remove(shieldMesh); disposeObject(shieldMesh); shieldMesh = null; }
  // Clear food eat effects
  for (const e of foodEatEffects) { scene.remove(e.mesh); e.mesh.geometry.dispose(); e.mesh.material.dispose(); }
  foodEatEffects = [];
}

function buildArena(levelIdx) {
  clearArena();
  const lvl = LEVELS[levelIdx];

  scene.background = new THREE.Color(lvl.skyColor);
  const fogDensity = lvl.isLightsOut ? 0.12 : lvl.isTron ? 0.003 : 0.004;
  scene.fog = new THREE.FogExp2(lvl.skyColor, fogDensity);

  ambientLight.intensity = lvl.isLightsOut ? 0.05 : 0.4;
  dirLight.intensity = lvl.isLightsOut ? 0.08 : 1.0;
  dirLight.color.setHex(0xfff5e0);
  hemiLight.intensity = lvl.isLightsOut ? 0.05 : 0.6;
  hemiLight.color.setHex(lvl.skyColor);
  hemiLight.groundColor.setHex(lvl.groundColor);

  if (lvl.isLightsOut) {
    headLight = new THREE.PointLight(0xffaa66, 2.5, 14);
    headLight.position.set(0, 2, 0);
    scene.add(headLight);
  }

  buildGroundArena(lvl);
  if (lvl.obstacles) buildObstacles(lvl);
  if (lvl.isMaze) buildMaze(lvl, MAZE_LAYOUT);
  if (lvl.hasPortals) buildPortals(lvl);
  if (lvl.isTron) buildTronTrail(lvl);
  if (lvl.hasMinefield) buildMinefield(lvl);
  if (lvl.hasAISnake) buildAISnake(lvl);
  if (lvl.isInfinity) { mineGroup = new THREE.Group(); scene.add(mineGroup); infinityMines = []; }
  if (lvl.isGravity) buildGravityRings(lvl);
}

function buildGravityRings(lvl) {
  const ringMat = new THREE.MeshBasicMaterial({ color: lvl.accentColor, transparent: true, opacity: 0.12, side: THREE.DoubleSide });
  for (let r = 4; r <= lvl.arenaSize - 2; r += 4) {
    const geo = new THREE.RingGeometry(r - 0.08, r + 0.08, 32);
    const mesh = new THREE.Mesh(geo, ringMat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.02;
    arenaGroup.add(mesh);
  }
}

function buildGroundArena(lvl) {
  const gridSize = lvl.arenaSize * 2;
  const floorGeo = new THREE.PlaneGeometry(gridSize, gridSize);
  const floorMat = new THREE.MeshStandardMaterial({ color: lvl.groundColor, roughness: 0.85, metalness: 0.05 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.01;
  floor.receiveShadow = true;
  arenaGroup.add(floor);

  const gridHelper = new THREE.GridHelper(gridSize, Math.min(40, gridSize), 0x000000, 0x000000);
  gridHelper.material.opacity = 0.06;
  gridHelper.material.transparent = true;
  arenaGroup.add(gridHelper);

  if (!lvl.isWrap) {
    const wallMat = new THREE.MeshStandardMaterial({ color: lvl.wallColor, roughness: 0.65, metalness: 0.1 });
    const wallHeight = 1.8;
    const wt = 0.25;
    const wallDefs = [
      { s: [wt, wallHeight, gridSize + wt], p: [lvl.arenaSize, wallHeight / 2, 0] },
      { s: [wt, wallHeight, gridSize + wt], p: [-lvl.arenaSize, wallHeight / 2, 0] },
      { s: [gridSize + wt, wallHeight, wt], p: [0, wallHeight / 2, lvl.arenaSize] },
      { s: [gridSize + wt, wallHeight, wt], p: [0, wallHeight / 2, -lvl.arenaSize] },
    ];
    for (const w of wallDefs) {
      const geo = new THREE.BoxGeometry(...w.s);
      const mesh = new THREE.Mesh(geo, wallMat);
      mesh.position.set(...w.p);
      mesh.castShadow = true; mesh.receiveShadow = true;
      arenaGroup.add(mesh);
      if (lvl.isShrinking || lvl.isInfinity) shrinkWalls.push(mesh);
    }

    const postMat = new THREE.MeshStandardMaterial({ color: 0x665544, roughness: 0.5 });
    const postGeo = new THREE.CylinderGeometry(0.15, 0.18, wallHeight + 0.5, 6);
    for (const cx of [-1, 1]) for (const cz of [-1, 1]) {
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(cx * lvl.arenaSize, (wallHeight + 0.5) / 2, cz * lvl.arenaSize);
      post.castShadow = true;
      arenaGroup.add(post);
    }
  }
}

function buildObstacles(lvl) {
  const obsMat = new THREE.MeshStandardMaterial({ color: lvl.accentColor, roughness: 0.5, metalness: 0.2 });
  const pillarCount = lvl.isLightsOut ? 8 : 12;
  const margin = 5;

  for (let i = 0; i < pillarCount; i++) {
    const height = 1.2 + Math.random() * 1.8;
    const radius = 0.35 + Math.random() * 0.35;
    const geo = new THREE.CylinderGeometry(radius, radius * 1.1, height, 8);
    const mesh = new THREE.Mesh(geo, obsMat);
    let x, z, tooClose, attempts = 0;
    do {
      x = (Math.random() * 2 - 1) * (lvl.arenaSize - margin);
      z = (Math.random() * 2 - 1) * (lvl.arenaSize - margin);
      tooClose = Math.abs(x) < 6 && Math.abs(z) < 6;
      for (const ob of obstacles) if (new THREE.Vector2(x - ob.x, z - ob.z).length() < 4) tooClose = true;
      attempts++;
    } while (tooClose && attempts < 50);
    mesh.position.set(x, height / 2, z);
    mesh.castShadow = true; mesh.receiveShadow = true;
    obstacleGroup.add(mesh);
    obstacles.push({ x, z, radius: radius + 0.5, height, mesh });
  }

  if (!lvl.isLightsOut) {
    const barCount = 6;
    for (let i = 0; i < barCount; i++) {
      const width = 2.5 + Math.random() * 4;
      const geo = new THREE.BoxGeometry(width, 0.6, 0.35);
      const mesh = new THREE.Mesh(geo, obsMat);
      let x, z, tooClose, attempts = 0;
      do {
        x = (Math.random() * 2 - 1) * (lvl.arenaSize - 5);
        z = (Math.random() * 2 - 1) * (lvl.arenaSize - 5);
        tooClose = Math.abs(x) < 6 && Math.abs(z) < 6;
        attempts++;
      } while (tooClose && attempts < 30);
      const angle = Math.random() * Math.PI;
      mesh.position.set(x, 0.3, z);
      mesh.rotation.y = angle;
      mesh.castShadow = true;
      obstacleGroup.add(mesh);
      obstacles.push({ x, z, radius: width / 2, height: 0.6, mesh, isBar: true, angle, width });
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════
// MAZE
// ═══════════════════════════════════════════════════════════════════════

function buildMaze(lvl, layout) {
  const wallMat = new THREE.MeshStandardMaterial({ color: lvl.wallColor, roughness: 0.6, metalness: 0.1 });
  const wallHeight = 2, wallThick = 0.4;
  for (const seg of layout) {
    const [x1, z1, x2, z2] = seg;
    const dx = x2 - x1, dz = z2 - z1;
    const len = Math.sqrt(dx * dx + dz * dz);
    const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2;
    const angle = Math.atan2(dx, dz);
    const geo = new THREE.BoxGeometry(wallThick, wallHeight, len);
    const mesh = new THREE.Mesh(geo, wallMat);
    mesh.position.set(cx, wallHeight / 2, cz);
    mesh.rotation.y = angle;
    mesh.castShadow = true; mesh.receiveShadow = true;
    obstacleGroup.add(mesh);
    const isH = Math.abs(dz) < Math.abs(dx);
    if (isH) {
      mazeColliders.push({ minX: Math.min(x1,x2) - wallThick/2, maxX: Math.max(x1,x2) + wallThick/2, minZ: (z1+z2)/2 - wallThick/2, maxZ: (z1+z2)/2 + wallThick/2 });
    } else {
      mazeColliders.push({ minX: (x1+x2)/2 - wallThick/2, maxX: (x1+x2)/2 + wallThick/2, minZ: Math.min(z1,z2) - wallThick/2, maxZ: Math.max(z1,z2) + wallThick/2 });
    }
  }
}

function isInMazeWall(pos) {
  const r = 0.6;
  for (const w of mazeColliders) {
    if (pos.x + r > w.minX && pos.x - r < w.maxX && pos.z + r > w.minZ && pos.z - r < w.maxZ) return true;
  }
  return false;
}

// ═══════════════════════════════════════════════════════════════════════
// PORTALS
// ═══════════════════════════════════════════════════════════════════════

function buildPortals(lvl) {
  portalPairs = PORTAL_PAIRS_DEF.map(p => ({ ...p }));
  portalCooldowns = [0, 0];
  portalMeshGroups = [];
  for (let i = 0; i < portalPairs.length; i++) {
    const pair = portalPairs[i];
    for (const pos of [pair.a, pair.b]) {
      const group = new THREE.Group();
      const torusGeo = new THREE.TorusGeometry(1.2, 0.12, 10, 20);
      const torusMat = new THREE.MeshStandardMaterial({ color: pair.color, roughness: 0.3, metalness: 0.5 });
      const torus = new THREE.Mesh(torusGeo, torusMat);
      torus.rotation.x = Math.PI / 2; torus.castShadow = true;
      group.add(torus);
      const discGeo = new THREE.CircleGeometry(0.9, 20);
      const discMat = new THREE.MeshBasicMaterial({ color: pair.color, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.rotation.x = Math.PI / 2; disc.position.y = 0.01;
      group.add(disc);
      group.position.set(pos.x, 0.5, pos.z);
      arenaGroup.add(group);
      portalMeshGroups.push(group);
    }
  }
}

function isOnPortal(pos) {
  for (const pair of portalPairs) {
    if (Math.sqrt((pos.x-pair.a.x)**2 + (pos.z-pair.a.z)**2) < 3) return true;
    if (Math.sqrt((pos.x-pair.b.x)**2 + (pos.z-pair.b.z)**2) < 3) return true;
  }
  return false;
}

function updatePortals(dt) {
  for (const g of portalMeshGroups) g.children[0].rotation.z += dt * 2;
  for (let i = 0; i < portalCooldowns.length; i++) if (portalCooldowns[i] > 0) portalCooldowns[i] -= dt;
  if (snake.positions.length === 0) return;
  const hp = snake.positions[0];
  for (let i = 0; i < portalPairs.length; i++) {
    if (portalCooldowns[i] > 0) continue;
    const pair = portalPairs[i];
    const dA = Math.sqrt((hp.x-pair.a.x)**2 + (hp.z-pair.a.z)**2);
    const dB = Math.sqrt((hp.x-pair.b.x)**2 + (hp.z-pair.b.z)**2);
    const margin = LEVELS[currentLevel].arenaSize - 1;
    if (dA < 1.5) { hp.x = Math.max(-margin, Math.min(margin, pair.b.x + snake.direction.x*2.5)); hp.z = Math.max(-margin, Math.min(margin, pair.b.z + snake.direction.z*2.5)); portalCooldowns[i] = 1.5; playPortalSound(); return; }
    if (dB < 1.5) { hp.x = Math.max(-margin, Math.min(margin, pair.a.x + snake.direction.x*2.5)); hp.z = Math.max(-margin, Math.min(margin, pair.a.z + snake.direction.z*2.5)); portalCooldowns[i] = 1.5; playPortalSound(); return; }
  }
}

// ═══════════════════════════════════════════════════════════════════════
// TRON TRAIL
// ═══════════════════════════════════════════════════════════════════════

function buildTronTrail(lvl) {
  const geo = new THREE.BoxGeometry(0.3, 0.12, 0.3);
  const mat = new THREE.MeshStandardMaterial({ color: lvl.accentColor, roughness: 0.4, metalness: 0.3 });
  tronTrailMesh = new THREE.InstancedMesh(geo, mat, TRON_TRAIL_MAX);
  tronTrailMesh.count = 0;
  scene.add(tronTrailMesh);
  tronTrailPoints = []; tronTrailCount = 0; tronGrid = {};
}

function tronGridKey(x, z) { return `${Math.floor(x / TRON_CELL_SIZE)},${Math.floor(z / TRON_CELL_SIZE)}`; }

function updateTronTrail(dt) {
  if (!tronTrailMesh || snake.positions.length === 0) return;
  const hp = snake.positions[0];
  const last = tronTrailPoints.length > 0 ? tronTrailPoints[tronTrailPoints.length - 1] : null;
  const dist = last ? Math.sqrt((hp.x-last.x)**2 + (hp.z-last.z)**2) : TRON_TRAIL_INTERVAL + 1;
  if (dist >= TRON_TRAIL_INTERVAL && tronTrailCount < TRON_TRAIL_MAX) {
    const pt = { x: hp.x, z: hp.z, idx: tronTrailPoints.length };
    tronTrailPoints.push(pt);
    const key = tronGridKey(pt.x, pt.z);
    if (!tronGrid[key]) tronGrid[key] = [];
    tronGrid[key].push(pt);
    tronDummy.position.set(pt.x, 0.06, pt.z);
    tronDummy.updateMatrix();
    tronTrailMesh.setMatrixAt(tronTrailCount, tronDummy.matrix);
    tronTrailCount++;
    tronTrailMesh.count = tronTrailCount;
    tronTrailMesh.instanceMatrix.needsUpdate = true;
  }
}

function checkTronCollision(hp) {
  if (tronTrailPoints.length <= TRON_GRACE_COUNT) return false;
  const graceStart = tronTrailPoints.length - TRON_GRACE_COUNT;
  const cx = Math.floor(hp.x / TRON_CELL_SIZE), cz = Math.floor(hp.z / TRON_CELL_SIZE);
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      const cell = tronGrid[`${cx+dx},${cz+dz}`];
      if (!cell) continue;
      for (const p of cell) {
        if (p.idx >= graceStart) continue;
        const ddx = hp.x - p.x, ddz = hp.z - p.z;
        if (ddx*ddx + ddz*ddz < 0.36) return true;
      }
    }
  }
  return false;
}

// ═══════════════════════════════════════════════════════════════════════
// MINEFIELD
// ═══════════════════════════════════════════════════════════════════════

function buildMinefield(lvl) {
  mineGroup = new THREE.Group(); scene.add(mineGroup);
  mines = [];
  for (let i = 0; i < MINE_INITIAL; i++) spawnMine(lvl);
  mineSpawnTimer = 0;
}

function spawnMine(lvl, group, arr) {
  const mg = group || mineGroup;
  const ma = arr || mines;
  if (ma.length >= MINE_MAX) return;
  const geo = new THREE.SphereGeometry(0.35, 8, 6);
  const mat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.3, metalness: 0.7 });
  const mesh = new THREE.Mesh(geo, mat);
  const spikeGeo = new THREE.ConeGeometry(0.08, 0.25, 4);
  const spikeMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.4, metalness: 0.5 });
  for (let j = 0; j < 6; j++) {
    const spike = new THREE.Mesh(spikeGeo, spikeMat);
    const theta = (j / 6) * Math.PI * 2;
    spike.position.set(Math.cos(theta) * 0.35, 0, Math.sin(theta) * 0.35);
    spike.lookAt(spike.position.clone().multiplyScalar(2));
    mesh.add(spike);
  }
  const size = lvl.isInfinity ? infinityShrinkSize - 2 : lvl.arenaSize;
  let x, z, tooClose, attempts = 0;
  do {
    x = (Math.random()*2-1)*(size-2); z = (Math.random()*2-1)*(size-2); attempts++;
    tooClose = Math.abs(x)<4 && Math.abs(z)<4;
    if (!tooClose && snake.positions.length > 0) {
      const hp = snake.positions[0];
      if (Math.abs(x-hp.x)<3 && Math.abs(z-hp.z)<3) tooClose = true;
    }
  } while (tooClose && attempts < 50);
  mesh.position.set(x, 0.35, z); mesh.castShadow = true;
  mg.add(mesh);
  ma.push({ x, z, mesh });
}

function updateMinefield(dt) {
  const lvl = LEVELS[currentLevel];
  mineSpawnTimer += dt;
  if (mineSpawnTimer >= MINE_SPAWN_INTERVAL) { mineSpawnTimer = 0; spawnMine(lvl); }
  for (const m of mines) {
    m.mesh.rotation.y += dt * 0.5;
    // Chase mines: slowly drift toward player
    if (lvl.chaseMines && snake.positions.length > 0) {
      const hp = snake.positions[0];
      const dx = hp.x - m.x, dz = hp.z - m.z;
      const dist = Math.sqrt(dx*dx + dz*dz);
      if (dist > 1) {
        m.x += (dx / dist) * MINE_CHASE_SPEED * dt;
        m.z += (dz / dist) * MINE_CHASE_SPEED * dt;
        m.mesh.position.x = m.x;
        m.mesh.position.z = m.z;
      }
    }
  }
}

function checkMineCollision(hp, arr) {
  const ma = arr || mines;
  for (const m of ma) { const dx = hp.x-m.x, dz = hp.z-m.z; if (dx*dx+dz*dz < MINE_RADIUS*MINE_RADIUS) return true; }
  return false;
}

// ═══════════════════════════════════════════════════════════════════════
// AI SNAKE (smarter: cuts off player, circles food)
// ═══════════════════════════════════════════════════════════════════════

function buildAISnake(lvl) {
  aiSnakeGroup = new THREE.Group(); scene.add(aiSnakeGroup);
  aiSnake.segments = []; aiSnake.positions = [];
  aiSnake.direction = new THREE.Vector3(0, 0, -1);
  aiSnake.targetRotation = 0; aiSnake.alive = true;
  const aiColor = 0xCC4422, aiHead = 0xEE5533;
  for (let i = 0; i < AI_SEGMENTS; i++) {
    const size = i === 0 ? 0.55 : 0.4;
    const geo = new THREE.SphereGeometry(size, i === 0 ? 10 : 8, i === 0 ? 8 : 6);
    const mat = new THREE.MeshStandardMaterial({ color: i === 0 ? aiHead : aiColor, roughness: 0.4, metalness: 0.2 });
    const mesh = new THREE.Mesh(geo, mat); mesh.castShadow = true;
    const pos = new THREE.Vector3(10, 0.5, 10 + i * SEGMENT_SPACING);
    mesh.position.copy(pos);
    aiSnakeGroup.add(mesh);
    aiSnake.segments.push(mesh);
    aiSnake.positions.push(pos.clone());
  }
}

function updateAISnake(dt) {
  if (!aiSnake.alive || aiSnake.positions.length === 0) return;
  const lvl = LEVELS[currentLevel];
  const hp = aiSnake.positions[0];

  // Smarter AI: sometimes target player's predicted position to cut them off
  let target = null;
  if (snake.positions.length > 0 && Math.random() < AI_CUTOFF_CHANCE * dt) {
    // Predict where player will be
    const playerHead = snake.positions[0];
    target = playerHead.clone().addScaledVector(snake.direction, 4);
  }

  if (!target) {
    // Default: go for nearest food
    let nearestDist = Infinity;
    for (const f of foods) {
      const d = hp.distanceTo(f.position);
      if (d < nearestDist) { nearestDist = d; target = f.position; }
    }
  }

  if (target) {
    _aiTd.subVectors(target, hp); _aiTd.y = 0;
    if (_aiTd.length() > 0.1) {
      const ta = Math.atan2(_aiTd.x, _aiTd.z);
      let diff = ta - aiSnake.targetRotation;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      aiSnake.targetRotation += Math.sign(diff) * Math.min(Math.abs(diff), AI_TURN_SPEED * dt);
    }
  }
  aiSnake.direction.set(Math.sin(aiSnake.targetRotation), 0, Math.cos(aiSnake.targetRotation)).normalize();
  hp.addScaledVector(aiSnake.direction, lvl.moveSpeed * AI_SPEED_MULT * dt);
  hp.y = 0.5;
  const margin = lvl.arenaSize - 1;
  if (hp.x > margin) { hp.x = margin; aiSnake.targetRotation = Math.PI - aiSnake.targetRotation; }
  if (hp.x < -margin) { hp.x = -margin; aiSnake.targetRotation = Math.PI - aiSnake.targetRotation; }
  if (hp.z > margin) { hp.z = margin; aiSnake.targetRotation = -aiSnake.targetRotation; }
  if (hp.z < -margin) { hp.z = -margin; aiSnake.targetRotation = -aiSnake.targetRotation; }
  aiSnake.segments[0].position.copy(hp);
  aiSnake.segments[0].rotation.y = aiSnake.targetRotation;
  for (let i = 1; i < aiSnake.segments.length; i++) {
    const lp = aiSnake.positions[i-1], cp = aiSnake.positions[i];
    _aiDir.subVectors(lp, cp); _aiDir.y = 0;
    const d = _aiDir.length();
    if (d > SEGMENT_SPACING) { _aiDir.normalize().multiplyScalar(d - SEGMENT_SPACING); cp.add(_aiDir); }
    cp.y = 0.5;
    aiSnake.segments[i].position.copy(cp);
    if (d > 0.01) aiSnake.segments[i].rotation.y = Math.atan2(_aiDir.x, _aiDir.z);
  }
  // AI eats food
  for (let i = foods.length - 1; i >= 0; i--) {
    if (hp.distanceTo(foods[i].position) < 1.3) {
      const f = foods[i]; foodGroup.remove(f); disposeObject(f); foods.splice(i, 1); break;
    }
  }
}

function checkAISnakeCollision(hp) {
  for (const p of aiSnake.positions) if (hp.distanceTo(p) < 0.7) return true;
  return false;
}

// ═══════════════════════════════════════════════════════════════════════
// SNAKE (with skin support)
// ═══════════════════════════════════════════════════════════════════════

function createSnakeSegment(isHead) {
  const skin = getActiveSkin();
  const size = isHead ? 0.55 : 0.4;
  const geo = new THREE.SphereGeometry(size, isHead ? 12 : 8, isHead ? 8 : 6);
  const color = isHead ? skin.head : skin.body;
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.15 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  if (isHead) {
    const eyeGeo = new THREE.SphereGeometry(0.1, 6, 4);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilGeo = new THREE.SphereGeometry(0.06, 6, 4);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    for (const side of [-1, 1]) {
      const eye = new THREE.Mesh(eyeGeo, eyeMat); eye.position.set(side * 0.25, 0.2, 0.35); mesh.add(eye);
      const pupil = new THREE.Mesh(pupilGeo, pupilMat); pupil.position.set(side * 0.27, 0.22, 0.42); mesh.add(pupil);
    }
    // Mouth: upper jaw (pivot at back, rotates up on chomp)
    const jawGeo = new THREE.SphereGeometry(0.22, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const jawMat = new THREE.MeshStandardMaterial({ color: 0x882222, roughness: 0.6 });
    const upperJaw = new THREE.Group();
    upperJaw.position.set(0, 0.05, 0.25);
    const upperMesh = new THREE.Mesh(jawGeo, jawMat);
    upperMesh.rotation.x = -Math.PI * 0.5;
    upperJaw.add(upperMesh);
    mesh.add(upperJaw);
    // Lower jaw (pivot at back, rotates down on chomp)
    const lowerJaw = new THREE.Group();
    lowerJaw.position.set(0, -0.05, 0.25);
    const lowerMesh = new THREE.Mesh(jawGeo, jawMat.clone());
    lowerMesh.rotation.x = Math.PI * 0.5;
    lowerMesh.scale.y = -1;
    lowerJaw.add(lowerMesh);
    mesh.add(lowerJaw);
    // Mouth interior (dark inside visible when jaws open)
    const insideGeo = new THREE.CircleGeometry(0.15, 8);
    const insideMat = new THREE.MeshBasicMaterial({ color: 0x220000 });
    const insideMesh = new THREE.Mesh(insideGeo, insideMat);
    insideMesh.position.set(0, 0, 0.45);
    mesh.add(insideMesh);
    // Tag jaw groups for animation
    upperJaw.name = 'upperJaw';
    lowerJaw.name = 'lowerJaw';
    insideMesh.name = 'mouthInside';
  }
  return mesh;
}

function createTail() {
  const skin = getActiveSkin();
  const geo = new THREE.ConeGeometry(0.28, 0.9, 6);
  const mat = new THREE.MeshStandardMaterial({ color: skin.body, roughness: 0.35, metalness: 0.15 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = Math.PI / 2; mesh.castShadow = true;
  const wrapper = new THREE.Group(); wrapper.add(mesh);
  return wrapper;
}

function resetSnake() {
  while (snakeGroup.children.length) {
    const c = snakeGroup.children[0]; snakeGroup.remove(c); disposeObject(c);
  }
  snake.segments = []; snake.positions = []; snake.rotations = [];
  snake.direction.set(0, 0, 1); snake.targetRotation = Math.PI; snake.alive = true;
  foodBulges = []; pendingSegments = 0;
  boostGauge = 1; isBoosting = false; boostTimer = 0; currentSpeedMult = 1;
  speedRampMult = 1; foodEaten = 0;
  comboCount = 0; comboTimer = 0;
  iceAngularVel = 0;
  currentArenaSize = LEVELS[currentLevel].arenaSize;
  timeAttackTimer = TIME_ATTACK_START;
  mineSpawnTimer = 0;
  infinityPhase = 0; infinityPhaseTimer = 0;
  infinityShrinkSize = LEVELS[currentLevel].arenaSize;
  infinitySpeedBonus = 0;
  goldenSpawned = 0;
  reverseActive = false; reverseTimer = 0;
  deathSegments = [];
  deathAnimActive = false;
  deathAnimTimer = 0;
  chompTimer = 0;

  for (let i = 0; i < INITIAL_SEGMENTS; i++) {
    const mesh = createSnakeSegment(i === 0);
    const pos = new THREE.Vector3(0, 0.5, -i * SEGMENT_SPACING);
    mesh.position.copy(pos); mesh.rotation.y = Math.PI;
    snakeGroup.add(mesh);
    snake.segments.push(mesh); snake.positions.push(pos.clone()); snake.rotations.push(Math.PI);
  }
  snake.tail = createTail(); snakeGroup.add(snake.tail); updateTail();
}

// ═══════════════════════════════════════════════════════════════════════
// FOOD
// ═══════════════════════════════════════════════════════════════════════

function spawnFood() {
  const lvl = LEVELS[currentLevel];
  // Garden level: first N food items are guaranteed golden
  let isGolden;
  if (lvl.goldenGuarantee > 0 && goldenSpawned < lvl.goldenGuarantee) {
    isGolden = true;
    goldenSpawned++;
  } else {
    isGolden = Math.random() < GOLDEN_CHANCE;
  }
  const group = new THREE.Group();

  if (isGolden) {
    const geo = new THREE.OctahedronGeometry(0.35);
    const mat = new THREE.MeshStandardMaterial({ color: GOLDEN_COLOR, roughness: 0.2, metalness: 0.55 });
    const mesh = new THREE.Mesh(geo, mat); mesh.castShadow = true;
    group.add(mesh);
  } else {
    const color = FOOD_COLORS[Math.floor(Math.random() * FOOD_COLORS.length)];
    const bodyGeo = new THREE.SphereGeometry(0.3, 10, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.08 });
    const body = new THREE.Mesh(bodyGeo, bodyMat); body.castShadow = true;
    group.add(body);
    const stemGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.12, 4);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x4A7A2A, roughness: 0.6 });
    const stem = new THREE.Mesh(stemGeo, stemMat); stem.position.y = 0.33; group.add(stem);
    const leafGeo = new THREE.SphereGeometry(0.06, 4, 3);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x55AA33, roughness: 0.5 });
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set(0.05, 0.36, 0); leaf.scale.set(1.4, 0.4, 1);
    group.add(leaf);
  }

  const effectiveSize = lvl.isShrinking ? currentArenaSize : (lvl.isInfinity ? infinityShrinkSize : lvl.arenaSize);
  const sz = effectiveSize - 1.5;
  let pos, attempts = 0;
  do {
    const x = (Math.random() * 2 - 1) * sz;
    const z = (Math.random() * 2 - 1) * sz;
    pos = new THREE.Vector3(x, 0.5, z);
    attempts++;
  } while ((isOnSnake(pos, 2) || isInObstacle(pos) ||
    (lvl.isMaze && isInMazeWall(pos)) ||
    (lvl.hasPortals && isOnPortal(pos)) ||
    (lvl.hasMinefield && checkMineCollision(pos)) ||
    (lvl.isInfinity && checkMineCollision(pos, infinityMines))) && attempts < 50);

  group.position.copy(pos);
  group.userData = { time: Math.random() * Math.PI * 2, baseY: pos.y, isGolden, color: isGolden ? GOLDEN_COLOR : FOOD_COLORS[0] };
  if (!isGolden) group.userData.color = group.children[0].material.color.getHex();
  foodGroup.add(group);
  foods.push(group);
}

function isOnSnake(pos, t) { for (const sp of snake.positions) if (pos.distanceTo(sp) < t) return true; return false; }

function isInObstacle(pos) {
  for (const ob of obstacles) {
    const dx = pos.x - ob.x, dz = pos.z - ob.z;
    if (Math.sqrt(dx * dx + dz * dz) < ob.radius + 1) return true;
  }
  return false;
}

function updateFoods(dt) {
  for (const f of foods) {
    f.userData.time += dt;
    f.position.y = f.userData.baseY + Math.sin(f.userData.time * 3) * 0.12;
    const rotSpeed = f.userData.isGolden ? 3.0 : 1.5;
    f.children[0].rotation.y += dt * rotSpeed;
    if (f.userData.isGolden) f.children[0].rotation.x += dt * 1.5;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// POWER-UP ITEMS
// ═══════════════════════════════════════════════════════════════════════

function spawnPowerUpItem() {
  const lvl = LEVELS[currentLevel];
  const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];

  let geo;
  if (type.id === 'magnet') geo = new THREE.TorusGeometry(0.3, 0.1, 8, 12);
  else if (type.id === 'shield') geo = new THREE.OctahedronGeometry(0.3);
  else if (type.id === 'slowmo') geo = new THREE.TetrahedronGeometry(0.35);
  else geo = new THREE.BoxGeometry(0.4, 0.4, 0.4);

  const mat = new THREE.MeshStandardMaterial({ color: type.color, roughness: 0.2, metalness: 0.5 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;

  const effectiveSize = lvl.isShrinking ? currentArenaSize : (lvl.isInfinity ? infinityShrinkSize : lvl.arenaSize);
  const sz = effectiveSize - 2;
  let x, z, attempts = 0;
  do {
    x = (Math.random() * 2 - 1) * sz;
    z = (Math.random() * 2 - 1) * sz;
    attempts++;
  } while ((Math.abs(x) < 3 && Math.abs(z) < 3) && attempts < 30);

  mesh.position.set(x, 1.0, z);
  scene.add(mesh);
  powerUpItems.push({ mesh, type, timer: 0, baseY: 1.0 });
}

function updatePowerUpItems(dt) {
  for (let i = powerUpItems.length - 1; i >= 0; i--) {
    const p = powerUpItems[i];
    p.timer += dt;
    p.mesh.rotation.y += dt * 3;
    p.mesh.rotation.x += dt * 1.5;
    p.mesh.position.y = p.baseY + Math.sin(p.timer * 4) * 0.2;
    // Despawn after time
    if (p.timer >= POWERUP_DESPAWN_TIME) {
      scene.remove(p.mesh); disposeObject(p.mesh);
      powerUpItems.splice(i, 1);
    }
  }
}

function collectPowerUp(index) {
  const item = powerUpItems[index];
  const type = item.type;
  scene.remove(item.mesh); disposeObject(item.mesh);
  powerUpItems.splice(index, 1);

  // Clear previous power-up
  clearActivePowerUp();

  activePowerUp = type.id;
  powerUpTimer = type.duration;
  playPowerUpSound();
  haptic(80);

  // Visual feedback
  particles.emit(item.mesh.position, 15, type.color, { speed: 6, life: 0.6, scale: 1.2 });

  // Shield visual
  if (type.id === 'shield') {
    const shieldGeo = new THREE.SphereGeometry(0.9, 16, 12);
    const shieldMat = new THREE.MeshBasicMaterial({ color: 0x44FF44, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
    shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    scene.add(shieldMesh);
  }

  // Slow-mo overlay
  if (type.id === 'slowmo') slowmoOverlay.style.display = 'block';

  updatePowerUpUI();
}

function clearActivePowerUp() {
  if (shieldMesh) { scene.remove(shieldMesh); shieldMesh.geometry.dispose(); shieldMesh.material.dispose(); shieldMesh = null; }
  slowmoOverlay.style.display = 'none';
  scoreEl.classList.remove('x2');
  activePowerUp = null;
  powerUpTimer = 0;
  powerUpIndicator.style.display = 'none';
}

function updateActivePowerUp(dt) {
  if (!activePowerUp) return;

  if (activePowerUp !== 'shield') {
    powerUpTimer -= dt;
    if (powerUpTimer <= 0) {
      clearActivePowerUp();
      return;
    }
  }

  // Shield follows head
  if (activePowerUp === 'shield' && shieldMesh && snake.positions.length > 0) {
    shieldMesh.position.copy(snake.positions[0]);
    shieldMesh.rotation.y += dt * 2;
  }

  // Magnet: attract food
  if (activePowerUp === 'magnet' && snake.positions.length > 0) {
    const hp = snake.positions[0];
    for (const f of foods) {
      const dx = hp.x - f.position.x;
      const dz = hp.z - f.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < POWERUP_ATTRACT_RADIUS && dist > 0.5) {
        const factor = POWERUP_ATTRACT_SPEED * dt * (1 - dist / POWERUP_ATTRACT_RADIUS);
        f.position.x += (dx / dist) * factor;
        f.position.z += (dz / dist) * factor;
      }
    }
  }

  // x2 score visual
  if (activePowerUp === 'x2') scoreEl.classList.add('x2');

  updatePowerUpUI();
}

function updatePowerUpUI() {
  if (!activePowerUp) {
    powerUpIndicator.style.display = 'none';
    return;
  }
  powerUpIndicator.style.display = 'block';
  const type = POWERUP_TYPES.find(t => t.id === activePowerUp);
  powerUpNameEl.textContent = type.name;
  powerUpNameEl.style.color = '#' + type.color.toString(16).padStart(6, '0');

  if (activePowerUp === 'shield') {
    powerUpFillEl.style.width = '100%';
  } else {
    const pct = Math.max(0, powerUpTimer / type.duration * 100);
    powerUpFillEl.style.width = pct + '%';
  }
  powerUpFillEl.style.background = '#' + type.color.toString(16).padStart(6, '0');
}

// ═══════════════════════════════════════════════════════════════════════
// GAME LOGIC
// ═══════════════════════════════════════════════════════════════════════

function startGame(levelIdx) {
  currentLevel = levelIdx;
  const lvl = LEVELS[levelIdx];
  isPaused = false;
  if (gameOverTimeoutId) { clearTimeout(gameOverTimeoutId); gameOverTimeoutId = null; }

  startScreen.style.display = 'none';
  gameoverScreen.style.display = 'none';
  levelSelectScreen.style.display = 'none';
  pauseOverlay.style.display = 'none';

  score = 0; displayScore = 0; targetScore = 0;
  updateScoreDisplay();
  levelIndicator.textContent = `${levelIdx + 1}. ${lvl.name}`;
  levelIndicator.style.display = 'block';
  highscoreEl.textContent = highScores[levelIdx] > 0 ? `BEST: ${highScores[levelIdx]}` : '';

  boostBar.style.display = lvl.hasBoost ? 'block' : 'none';
  boostLabel.style.display = lvl.hasBoost ? 'block' : 'none';
  timerEl.style.display = lvl.isTimeAttack ? 'block' : 'none';
  warningEl.style.display = 'none';
  slowmoOverlay.style.display = 'none';
  powerUpIndicator.style.display = 'none';

  // Star thresholds HUD
  starsHud.style.display = 'block';
  starsHud.textContent = `\u2606 ${lvl.star1} / ${lvl.star2} / ${lvl.star3}`;

  if (lvl.isMirror) controlsHint.textContent = isMobile ? 'LEFT / RIGHT (MIRRORED!)' : 'ARROWS (MIRRORED!)';
  else if (lvl.isReverse) controlsHint.textContent = isMobile ? 'LEFT / RIGHT (CONTROLS FLIP!)' : 'ARROWS (CONTROLS FLIP!)';
  else if (lvl.hasBoost) controlsHint.textContent = isMobile ? 'LEFT / RIGHT / CENTER=BOOST' : 'ARROWS + SHIFT=BOOST';
  else if (lvl.isIce) controlsHint.textContent = isMobile ? 'LEFT / RIGHT (SLIPPERY!)' : 'ARROWS (SLIPPERY!)';
  else controlsHint.textContent = isMobile ? 'TAP LEFT / RIGHT' : 'ARROW KEYS';

  // Clear power-ups
  clearActivePowerUp();
  for (const p of powerUpItems) { scene.remove(p.mesh); disposeObject(p.mesh); }
  powerUpItems = [];

  buildArena(levelIdx);
  resetSnake();

  while (foodGroup.children.length) {
    const c = foodGroup.children[0]; foodGroup.remove(c); disposeObject(c);
  }
  foods = [];
  const initCount = lvl.obstacles ? 6 : lvl.isMaze ? 4 : 3;
  for (let i = 0; i < initCount; i++) spawnFood();

  isPlaying = true;
  foodSpawnTimer = 0;
  cameraAngle = Math.PI;
  shakeIntensity = 0;
  comboDisplayTimer = 0;
  comboEl.style.display = 'none';

  camera.fov = BASE_FOV;
  camera.updateProjectionMatrix();

  if (isMobile) {
    mobileHintTimer = 3;
    mobileHintEl.style.display = 'block';
    mobileHintEl.style.opacity = '1';
    mobileHintEl.textContent = lvl.hasBoost ? 'LEFT / RIGHT / CENTER=BOOST' : 'TAP LEFT / RIGHT';
  }

  initAudio();
  music.start(lvl.musicRoot, 100);
}

function gameOver() {
  snake.alive = false;
  isPlaying = false;
  playDeathSound();
  haptic(200);
  shakeIntensity = 0.8;
  music.stop();

  // Start death animation
  startDeathAnimation();

  timerEl.style.display = 'none';
  warningEl.style.display = 'none';
  mobileHintEl.style.display = 'none';
  starsHud.style.display = 'none';
  clearActivePowerUp();

  // Calculate stars
  const starsEarned = getStarsForScore(currentLevel, score);
  const prevStars = levelStars[currentLevel];
  if (starsEarned > prevStars) levelStars[currentLevel] = starsEarned;

  let newUnlock = false, unlockMsg = '';
  const prevBest = highScores[currentLevel];
  if (score > prevBest) highScores[currentLevel] = score;
  saveProgress();
  calculateTotalStars();

  for (let i = 1; i < NUM_LEVELS; i++) {
    if (!unlockedLevels[i]) {
      const req = LEVELS[i];
      if (req.unlockLevel === currentLevel && score >= req.unlockScore) {
        unlockedLevels[i] = true; newUnlock = true;
        unlockMsg = `${LEVELS[i].name} UNLOCKED!`; break;
      }
    }
  }
  loadProgress();

  // Check for new skin unlocks
  let skinUnlocked = '';
  for (const skin of SKINS) {
    if (totalStars >= skin.unlock && totalStars - (starsEarned > prevStars ? starsEarned - prevStars : 0) < skin.unlock) {
      skinUnlocked = `${skin.name} SKIN UNLOCKED!`;
    }
  }

  // YouTube Playables score
  YT.sendScore(score);

  finalScoreEl.textContent = score;
  finalHighscoreEl.textContent = (score > 0 && score > prevBest) ? 'NEW BEST!' : `BEST: ${highScores[currentLevel]}`;
  finalStarsEl.textContent = starString(starsEarned);
  if (newUnlock) { levelUnlockMsg.textContent = unlockMsg; levelUnlockMsg.style.display = 'block'; }
  else { levelUnlockMsg.style.display = 'none'; }
  if (skinUnlocked) { skinUnlockMsg.textContent = skinUnlocked; skinUnlockMsg.style.display = 'block'; }
  else { skinUnlockMsg.style.display = 'none'; }

  // Show game over after death animation
  gameOverTimeoutId = setTimeout(() => { gameoverScreen.style.display = 'flex'; gameOverTimeoutId = null; }, 1500);
}

// ═══════════════════════════════════════════════════════════════════════
// DEATH ANIMATION
// ═══════════════════════════════════════════════════════════════════════

function startDeathAnimation() {
  deathSegments = [];
  deathAnimActive = true;
  deathAnimTimer = 0;

  for (let i = 0; i < snake.segments.length; i++) {
    const seg = snake.segments[i];
    seg.material.color.setHex(0xCC2222);
    seg.material.transparent = true;
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
    deathSegments.push({
      mesh: seg,
      vx: Math.cos(angle) * speed,
      vy: 3 + Math.random() * 5,
      vz: Math.sin(angle) * speed,
      spinX: (Math.random() - 0.5) * 8,
      spinZ: (Math.random() - 0.5) * 6,
    });
  }
  // Also scatter the tail
  if (snake.tail) {
    const tailMesh = snake.tail.children[0];
    if (tailMesh && tailMesh.material) {
      tailMesh.material.color.setHex(0xCC2222);
      tailMesh.material.transparent = true;
    }
    const angle = Math.random() * Math.PI * 2;
    deathSegments.push({
      mesh: snake.tail,
      vx: Math.cos(angle) * 3,
      vy: 4 + Math.random() * 3,
      vz: Math.sin(angle) * 3,
      spinX: (Math.random() - 0.5) * 6,
      spinZ: (Math.random() - 0.5) * 4,
    });
  }

  // Burst particles
  for (const pos of snake.positions) {
    particles.emit(pos, 5, 0xCC2222, { speed: 5, life: 0.6, scale: 1.0 });
  }
}

function updateDeathAnimation(dt) {
  if (!deathAnimActive) return;
  deathAnimTimer += dt;
  const fadeStart = 0.6;

  for (const d of deathSegments) {
    d.mesh.position.x += d.vx * dt;
    d.mesh.position.y += d.vy * dt;
    d.mesh.position.z += d.vz * dt;
    d.vy -= 12 * dt;
    d.mesh.rotation.x += d.spinX * dt;
    d.mesh.rotation.z += d.spinZ * dt;

    if (deathAnimTimer > fadeStart) {
      const fadeT = Math.max(0, 1 - (deathAnimTimer - fadeStart) / 0.9);
      if (d.mesh.material) {
        d.mesh.material.opacity = fadeT;
      } else if (d.mesh.children && d.mesh.children[0] && d.mesh.children[0].material) {
        d.mesh.children[0].material.opacity = fadeT;
        d.mesh.children[0].material.transparent = true;
      }
      d.mesh.scale.setScalar(fadeT);
    }
  }

  if (deathAnimTimer > 1.5) deathAnimActive = false;
}

// ═══════════════════════════════════════════════════════════════════════
// FOOD EAT EFFECTS
// ═══════════════════════════════════════════════════════════════════════

function createFoodEatEffect(pos, color) {
  const geo = new THREE.SphereGeometry(0.3, 8, 6);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(pos);
  scene.add(mesh);
  foodEatEffects.push({ mesh, timer: 0, maxTime: 0.25 });
}

function updateFoodEatEffects(dt) {
  for (let i = foodEatEffects.length - 1; i >= 0; i--) {
    const e = foodEatEffects[i];
    e.timer += dt;
    const t = e.timer / e.maxTime;
    e.mesh.scale.setScalar(1 + t * 0.6);
    e.mesh.material.opacity = 0.6 * (1 - t);
    if (t >= 1) {
      scene.remove(e.mesh);
      e.mesh.geometry.dispose();
      e.mesh.material.dispose();
      foodEatEffects.splice(i, 1);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════
// GAME UPDATE
// ═══════════════════════════════════════════════════════════════════════

function updateGame(dt) {
  if (!isPlaying || !snake.alive || isPaused) return;
  const lvl = LEVELS[currentLevel];

  handleInput(dt);
  updateBoost(dt);
  moveSnake(dt);
  updateFoodBulges(dt);
  updateTail();

  if (lvl.hasPortals) updatePortals(dt);
  if (lvl.isTron) updateTronTrail(dt);
  if (lvl.isLightsOut && headLight) { headLight.position.copy(snake.positions[0]); headLight.position.y = 2; }
  if (lvl.hasMinefield) updateMinefield(dt);
  if (lvl.hasAISnake) updateAISnake(dt);
  if (lvl.isShrinking) updateShrinking(dt);
  if (lvl.isTimeAttack) updateTimeAttack(dt);
  if (lvl.isInfinity) updateInfinity(dt);
  if (lvl.isReverse) updateReverse(dt);

  updateActivePowerUp(dt);
  updatePowerUpItems(dt);

  checkCollisions();

  if (comboTimer > 0) { comboTimer -= dt; if (comboTimer <= 0) { comboCount = 0; comboTimer = 0; } }

  foodSpawnTimer += dt;
  if (foodSpawnTimer >= lvl.foodSpawnInterval && foods.length < lvl.maxFood) { foodSpawnTimer = 0; spawnFood(); }

  updateFoods(dt);
  updateCamera(dt);
  updateBoostUI();

  // Music tempo from speed
  music.update(dt, speedRampMult * currentSpeedMult);

  // Rainbow skin animation
  const skin = getActiveSkin();
  if (skin.isRainbow && snake.segments.length > 0) {
    const time = clock.elapsedTime;
    for (let i = 0; i < snake.segments.length; i++) {
      const hue = (time * 0.3 + i * 0.08) % 1;
      snake.segments[i].material.color.setHSL(hue, 0.8, 0.5);
    }
  }

  // Mobile hint fade
  if (mobileHintTimer > 0) {
    mobileHintTimer -= dt;
    if (mobileHintTimer < 1) mobileHintEl.style.opacity = String(Math.max(0, mobileHintTimer));
    if (mobileHintTimer <= 0) mobileHintEl.style.display = 'none';
  }
}

// ═══════════════════════════════════════════════════════════════════════
// SHRINKING / TIME ATTACK / INFINITY
// ═══════════════════════════════════════════════════════════════════════

function updateShrinking(dt) {
  if (currentArenaSize <= SHRINK_MIN) return;
  currentArenaSize -= SHRINK_RATE * dt;
  if (currentArenaSize < SHRINK_MIN) currentArenaSize = SHRINK_MIN;
  if (shrinkWalls.length === 4) {
    const s = currentArenaSize, gs = s * 2, orig = LEVELS[currentLevel].arenaSize * 2;
    shrinkWalls[0].position.x = s; shrinkWalls[1].position.x = -s;
    shrinkWalls[2].position.z = s; shrinkWalls[3].position.z = -s;
    shrinkWalls[0].scale.z = gs / orig; shrinkWalls[1].scale.z = gs / orig;
    shrinkWalls[2].scale.x = gs / orig; shrinkWalls[3].scale.x = gs / orig;
  }
}

function updateTimeAttack(dt) {
  const slowMoFactor = activePowerUp === 'slowmo' ? 0.5 : 1;
  timeAttackTimer -= dt * slowMoFactor;
  const secs = Math.max(0, Math.ceil(timeAttackTimer));
  timerEl.textContent = secs;
  timerEl.style.color = secs <= 5 ? '#ff2222' : secs <= 10 ? '#ff6622' : '#E63946';
  timerEl.style.fontSize = secs <= 5 ? '36px' : '32px';
  if (timeAttackTimer <= 0) gameOver();
}

function updateInfinity(dt) {
  infinityPhaseTimer += dt;
  const newPhase = Math.floor(infinityPhaseTimer / INFINITY_PHASE_DURATION);
  if (newPhase > infinityPhase) {
    infinityPhase = newPhase;
    if (infinityPhase >= 1) spawnMine(LEVELS[currentLevel], mineGroup, infinityMines);
    if (infinityPhase >= 2 && infinityShrinkSize > SHRINK_MIN + 4) {
      infinityShrinkSize -= 2;
      if (shrinkWalls.length === 4) {
        const s = infinityShrinkSize, gs = s * 2, orig = LEVELS[currentLevel].arenaSize * 2;
        shrinkWalls[0].position.x = s; shrinkWalls[1].position.x = -s;
        shrinkWalls[2].position.z = s; shrinkWalls[3].position.z = -s;
        shrinkWalls[0].scale.z = gs / orig; shrinkWalls[1].scale.z = gs / orig;
        shrinkWalls[2].scale.x = gs / orig; shrinkWalls[3].scale.x = gs / orig;
      }
    }
    if (infinityPhase >= 3) infinitySpeedBonus = Math.min(1.4, infinitySpeedBonus + 0.15);
    if (infinityPhase >= 4) {
      const fogAmt = Math.min(0.015, 0.004 + infinityPhase * 0.001);
      scene.fog = new THREE.FogExp2(scene.background.getHex(), fogAmt);
    }
  }
  if (infinityPhase >= 1) {
    mineSpawnTimer += dt;
    const interval = Math.max(3, MINE_SPAWN_INTERVAL - infinityPhase);
    if (mineSpawnTimer >= interval && infinityMines.length < 60) { mineSpawnTimer = 0; spawnMine(LEVELS[currentLevel], mineGroup, infinityMines); }
  }
  if (mineGroup) for (const c of mineGroup.children) c.rotation.y += dt * 0.5;
}

function updateReverse(dt) {
  reverseTimer += dt;
  const cycle = REVERSE_NORMAL + REVERSE_FLIPPED;
  const phase = reverseTimer % cycle;
  const wasReversed = reverseActive;
  reverseActive = phase >= REVERSE_NORMAL;
  if (reverseActive !== wasReversed) {
    if (reverseActive) { warningEl.textContent = 'REVERSED!'; warningEl.style.display = 'block'; }
    else warningEl.style.display = 'none';
  }
}

// ═══════════════════════════════════════════════════════════════════════
// INPUT
// ═══════════════════════════════════════════════════════════════════════

function handleInput(dt) {
  const lvl = LEVELS[currentLevel];
  let left = turnLeft, right = turnRight;
  if (lvl.isMirror || (lvl.isReverse && reverseActive)) {
    const tmp = left; left = right; right = tmp;
  }
  if (lvl.isIce) {
    if (left) iceAngularVel += ICE_TURN_ACCEL * dt;
    if (right) iceAngularVel -= ICE_TURN_ACCEL * dt;
    iceAngularVel *= Math.max(0, 1 - ICE_TURN_FRICTION * dt);
    iceAngularVel = Math.max(-4, Math.min(4, iceAngularVel));
    snake.targetRotation += iceAngularVel * dt;
  } else {
    if (left) snake.targetRotation += TURN_SPEED * dt;
    if (right) snake.targetRotation -= TURN_SPEED * dt;
  }
  snake.direction.set(Math.sin(snake.targetRotation), 0, Math.cos(snake.targetRotation)).normalize();
  if (lvl.hasBoost && shiftHeld && boostGauge >= 1 && !isBoosting) {
    isBoosting = true; boostTimer = BOOST_DURATION; boostGauge = 0;
    playBoostSound();
    haptic(50);
  }
}

function updateBoost(dt) {
  if (isBoosting) { boostTimer -= dt; if (boostTimer <= 0) { isBoosting = false; boostTimer = 0; } }
  if (isBoosting) currentSpeedMult += (BOOST_SPEED_MULT - currentSpeedMult) * BOOST_ACCEL * dt;
  else { currentSpeedMult += (1 - currentSpeedMult) * BOOST_DECEL * dt; if (Math.abs(currentSpeedMult - 1) < 0.01) currentSpeedMult = 1; }
  if (boostGauge < 1) { boostGauge += dt / BOOST_RECHARGE; if (boostGauge > 1) boostGauge = 1; }
}

function updateBoostUI() {
  if (!LEVELS[currentLevel].hasBoost) return;
  boostFill.style.width = `${boostGauge * 100}%`;
  boostFill.style.background = boostGauge >= 1 ? 'linear-gradient(90deg, #4CAF50, #8BC34A)' : '#555';
}

// ═══════════════════════════════════════════════════════════════════════
// MOVEMENT
// ═══════════════════════════════════════════════════════════════════════

function moveSnake(dt) {
  if (snake.positions.length === 0) return;
  const lvl = LEVELS[currentLevel];
  const slowMoFactor = activePowerUp === 'slowmo' ? 0.5 : 1;
  const speed = lvl.moveSpeed * currentSpeedMult * (speedRampMult + infinitySpeedBonus) * slowMoFactor;
  const hp = snake.positions[0];
  hp.addScaledVector(snake.direction, speed * dt);
  // Gravity pull toward center
  if (lvl.isGravity) {
    const gx = -hp.x, gz = -hp.z;
    const gDist = Math.sqrt(gx * gx + gz * gz);
    if (gDist > 0.5) {
      const gForce = GRAVITY_PULL * dt;
      hp.x += (gx / gDist) * gForce;
      hp.z += (gz / gDist) * gForce;
    }
  }
  // Wrap edges
  if (lvl.isWrap) {
    const s = lvl.arenaSize;
    if (hp.x > s) hp.x -= s * 2;
    else if (hp.x < -s) hp.x += s * 2;
    if (hp.z > s) hp.z -= s * 2;
    else if (hp.z < -s) hp.z += s * 2;
  }
  hp.y = 0.5;
  snake.rotations[0] = snake.targetRotation;
  snake.segments[0].position.copy(hp);
  snake.segments[0].rotation.y = snake.targetRotation;

  // Head squash-and-stretch + chomp animation
  let headScaleX = isBoosting ? 1.08 : 1.0;
  let headScaleY = isBoosting ? 1.0 / 1.08 : 1.0;
  let headScaleZ = headScaleX;
  if (chompTimer > 0) {
    chompTimer -= dt;
    const t = Math.max(0, chompTimer / CHOMP_DURATION); // 1 at start, 0 at end
    const chompOpen = Math.sin(t * Math.PI); // peaks at 0.5, smooth open/close
    // Stretch head forward during chomp
    headScaleZ *= 1.0 + chompOpen * 0.25;
    headScaleY *= 1.0 - chompOpen * 0.15;
    // Animate jaws
    const head = snake.segments[0];
    const upperJaw = head.getObjectByName('upperJaw');
    const lowerJaw = head.getObjectByName('lowerJaw');
    const mouthInside = head.getObjectByName('mouthInside');
    if (upperJaw) upperJaw.rotation.x = -chompOpen * 0.4;
    if (lowerJaw) lowerJaw.rotation.x = chompOpen * 0.5;
    if (mouthInside) mouthInside.scale.setScalar(0.5 + chompOpen * 1.0);
  } else {
    // Reset jaws when not chomping
    const head = snake.segments[0];
    const upperJaw = head.getObjectByName('upperJaw');
    const lowerJaw = head.getObjectByName('lowerJaw');
    const mouthInside = head.getObjectByName('mouthInside');
    if (upperJaw) upperJaw.rotation.x = 0;
    if (lowerJaw) lowerJaw.rotation.x = 0;
    if (mouthInside) mouthInside.scale.setScalar(0.5);
  }
  snake.segments[0].scale.set(headScaleX, headScaleY, headScaleZ);

  for (let i = 1; i < snake.segments.length; i++) {
    const lp = snake.positions[i-1], cp = snake.positions[i];
    _moveDir.subVectors(lp, cp); _moveDir.y = 0;
    const d = _moveDir.length();
    if (d > SEGMENT_SPACING) { _moveDir.normalize().multiplyScalar(d - SEGMENT_SPACING); cp.add(_moveDir); }
    cp.y = 0.5;
    if (d > 0.01) snake.rotations[i] = Math.atan2(_moveDir.x, _moveDir.z);
    snake.segments[i].position.copy(cp);
    snake.segments[i].rotation.y = snake.rotations[i];
  }
}

function updateFoodBulges(dt) {
  const toRemove = [];
  for (let i = 0; i < foodBulges.length; i++) {
    foodBulges[i] += BULGE_SPEED * dt;
    if (foodBulges[i] >= snake.segments.length) { toRemove.push(i); if (pendingSegments > 0) { addSegmentAtTail(); pendingSegments--; } }
  }
  for (let i = toRemove.length - 1; i >= 0; i--) foodBulges.splice(toRemove[i], 1);
  for (let i = 0; i < snake.segments.length; i++) {
    let bulge = 0;
    for (const bp of foodBulges) { const d = Math.abs(bp - i); if (d < 2) bulge = Math.max(bulge, Math.cos((d / 2) * Math.PI * 0.5)); }
    if (i > 0) snake.segments[i].scale.setScalar(1 + (BULGE_SCALE - 1) * bulge);
  }
}

function addSegmentAtTail() {
  const lastPos = snake.positions[snake.positions.length - 1];
  const secondLast = snake.positions.length > 1 ? snake.positions[snake.positions.length - 2] : lastPos;
  _tailDir.subVectors(lastPos, secondLast).normalize();
  if (_tailDir.length() < 0.01) _tailDir.copy(snake.direction).negate();
  const newPos = lastPos.clone().addScaledVector(_tailDir, -SEGMENT_SPACING);
  newPos.y = lastPos.y;
  const mesh = createSnakeSegment(false);
  mesh.position.copy(newPos);
  mesh.rotation.y = snake.rotations[snake.rotations.length - 1];
  snakeGroup.add(mesh);
  snake.segments.push(mesh); snake.positions.push(newPos);
  snake.rotations.push(snake.rotations[snake.rotations.length - 1]);
}

function updateTail() {
  if (!snake.tail || snake.positions.length < 2) return;
  const lastPos = snake.positions[snake.positions.length - 1];
  const secondLast = snake.positions[snake.positions.length - 2];
  _tailDir.subVectors(lastPos, secondLast).normalize();
  if (_tailDir.length() < 0.01) _tailDir.copy(snake.direction).negate();
  _tailPos.copy(lastPos).addScaledVector(_tailDir, 0.5);
  _tailPos.y = lastPos.y;
  snake.tail.position.copy(_tailPos);
  if (Math.abs(_tailDir.x) > 0.01 || Math.abs(_tailDir.z) > 0.01) snake.tail.rotation.y = Math.atan2(_tailDir.x, _tailDir.z);
}

// ═══════════════════════════════════════════════════════════════════════
// COLLISIONS (with shield support)
// ═══════════════════════════════════════════════════════════════════════

function detectCollision() {
  const hp = snake.positions[0];
  const lvl = LEVELS[currentLevel];

  // Boundary (wrap levels have no walls)
  if (!lvl.isWrap) {
    const effectiveSize = lvl.isShrinking ? currentArenaSize : (lvl.isInfinity ? infinityShrinkSize : lvl.arenaSize);
    if (Math.abs(hp.x) > effectiveSize || Math.abs(hp.z) > effectiveSize) return 'wall';
  }

  // Obstacles
  if (lvl.obstacles) {
    for (const ob of obstacles) {
      if (ob.isBar) {
        const dx = hp.x - ob.x, dz = hp.z - ob.z;
        const cos = Math.cos(-ob.angle), sin = Math.sin(-ob.angle);
        const lx = dx * cos - dz * sin, lz = dx * sin + dz * cos;
        if (Math.abs(lx) < ob.width / 2 + 0.3 && Math.abs(lz) < 0.6) return 'obstacle';
      } else {
        const dx = hp.x - ob.x, dz = hp.z - ob.z;
        if (Math.sqrt(dx*dx + dz*dz) < ob.radius) return 'obstacle';
      }
    }
  }

  // Maze
  if (lvl.isMaze) {
    const r = 0.4;
    for (const w of mazeColliders) {
      if (hp.x+r > w.minX && hp.x-r < w.maxX && hp.z+r > w.minZ && hp.z-r < w.maxZ) return 'maze';
    }
  }

  // Tron
  if (lvl.isTron && checkTronCollision(hp)) return 'tron';

  // Mines
  if (lvl.hasMinefield && checkMineCollision(hp)) return 'mine';

  // AI Snake
  if (lvl.hasAISnake && checkAISnakeCollision(hp)) return 'ai';

  // Infinity mines
  if (lvl.isInfinity && checkMineCollision(hp, infinityMines)) return 'mine';

  // Self collision
  for (let i = 4; i < snake.positions.length; i++) {
    if (hp.distanceTo(snake.positions[i]) < 0.6) return 'self';
  }

  return null;
}

function checkCollisions() {
  const hp = snake.positions[0];

  const collision = detectCollision();
  if (collision) {
    // Shield absorbs one hit
    if (activePowerUp === 'shield') {
      playShieldBreakSound();
      particles.emit(hp, 25, 0x44FF44, { speed: 8, life: 0.6, scale: 1.5 });
      shakeIntensity = 0.4;
      haptic(100);
      clearActivePowerUp();
      // Push snake away from collision
      hp.addScaledVector(snake.direction, -1.5);
      return;
    }
    if (collision === 'mine') playMineSound();
    gameOver();
    return;
  }

  // Food
  for (let i = foods.length - 1; i >= 0; i--) {
    if (hp.distanceTo(foods[i].position) < 1.3) { eatFood(i); break; }
  }

  // Power-up items
  for (let i = powerUpItems.length - 1; i >= 0; i--) {
    if (hp.distanceTo(powerUpItems[i].mesh.position) < 1.5) { collectPowerUp(i); break; }
  }
}

function eatFood(index) {
  const lvl = LEVELS[currentLevel];
  const food = foods[index];
  const isGolden = food.userData.isGolden;
  const foodColor = food.userData.color;
  const foodPos = food.position.clone();

  foodGroup.remove(food);
  disposeObject(food);
  foods.splice(index, 1);

  // Combo
  if (comboTimer > 0) comboCount++; else comboCount = 1;
  comboTimer = COMBO_WINDOW;
  const mult = Math.min(comboCount, 5);
  const scoreMult = activePowerUp === 'x2' ? 2 : 1;
  const pts = (isGolden ? 30 * mult : 10 * mult) * scoreMult;
  score += pts;
  if (comboCount >= 2) {
    showCombo(mult);
    playComboSound(mult);
  }
  updateScoreDisplay();

  // Speed ramp
  foodEaten++;
  speedRampMult = Math.min(SPEED_RAMP_MAX, 1 + foodEaten * SPEED_RAMP_PER_FOOD);

  // Bulge + grow
  foodBulges.push(0);
  pendingSegments++;

  // Sound
  if (isGolden) playGoldenSound(); else playEatSound();

  // Boost refill
  if (boostGauge < 1) boostGauge = 1;

  // Particles
  const particleCount = isGolden ? 20 : 10;
  particles.emit(foodPos, particleCount, foodColor, { speed: isGolden ? 7 : 4, life: isGolden ? 0.8 : 0.5, scale: isGolden ? 1.5 : 1.0 });

  // Food eat effect
  createFoodEatEffect(foodPos, foodColor);

  // Chomp animation
  chompTimer = CHOMP_DURATION;

  // Score popup
  showScorePopup(foodPos, pts, isGolden);

  // Score element pop
  scoreEl.classList.add('pop');
  setTimeout(() => scoreEl.classList.remove('pop'), 100);

  // Haptic
  haptic(isGolden ? 80 : 40);

  // Ensure food exists
  if (foods.length === 0) spawnFood();

  // Time attack bonus
  if (lvl.isTimeAttack) timeAttackTimer += TIME_ATTACK_PER_FOOD;

  // Power-up spawn chance
  if (Math.random() < POWERUP_SPAWN_CHANCE && powerUpItems.length === 0) {
    spawnPowerUpItem();
  }
}

// ═══════════════════════════════════════════════════════════════════════
// CAMERA (with FOV boost)
// ═══════════════════════════════════════════════════════════════════════

const CAM_SMOOTH = 2.5;
const CAM_TURN_THRESH = 0.35;

function updateCamera(dt) {
  if (snake.positions.length === 0) return;
  const hp = snake.positions[0];
  const lvl = LEVELS[currentLevel];

  const snakeAngle = snake.targetRotation;
  let angleDiff = snakeAngle - cameraAngle;
  while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
  while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
  if (Math.abs(angleDiff) > CAM_TURN_THRESH) cameraAngle += angleDiff * CAM_SMOOTH * dt;

  _camForward.set(Math.sin(cameraAngle), 0, Math.cos(cameraAngle));
  _camPos.copy(hp).addScaledVector(_camForward, -lvl.camDist);
  _camPos.y = lvl.camHeight;
  camera.position.lerp(_camPos, 5 * dt);

  _camLook.copy(hp).addScaledVector(_camForward, 3);
  _camLook.y = 0.3;
  camera.lookAt(_camLook);

  // FOV shift during boost
  const targetFOV = isBoosting ? BOOST_FOV : BASE_FOV;
  if (Math.abs(camera.fov - targetFOV) > 0.1) {
    camera.fov += (targetFOV - camera.fov) * 4 * dt;
    camera.updateProjectionMatrix();
  }
}

// ═══════════════════════════════════════════════════════════════════════
// INPUT EVENTS
// ═══════════════════════════════════════════════════════════════════════

function pauseGame() {
  if (!isPlaying || !snake.alive || isPaused) return;
  isPaused = true;
  clock.getDelta();
  music.stop();
  pauseOverlay.style.display = 'flex';
}

function resumeGame() {
  if (!isPaused) return;
  isPaused = false;
  clock.getDelta();
  const lvl = LEVELS[currentLevel];
  music.start(lvl.musicRoot, 100);
  pauseOverlay.style.display = 'none';
}

function onKeyDown(e) {
  if (isPaused) { resumeGame(); return; }
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') turnLeft = true;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') turnRight = true;
  if (e.key === 'Shift') shiftHeld = true;
  if (!isPlaying && startScreen.style.display !== 'none') {
    if (e.key === ' ' || e.key === 'Enter') { initAudio(); playUIClick(); showLevelSelect(); }
  }
}

function onKeyUp(e) {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') turnLeft = false;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') turnRight = false;
  if (e.key === 'Shift') shiftHeld = false;
}

function onTouchStart(e) {
  e.preventDefault();
  if (isPaused) { resumeGame(); return; }
  initAudio();
  updateTouchZones(e);
}

function onTouchMove(e) {
  e.preventDefault();
  updateTouchZones(e);
}

function onTouchEnd(e) {
  e.preventDefault();
  turnLeft = false; turnRight = false; shiftHeld = false;
}

function updateTouchZones(e) {
  turnLeft = false; turnRight = false; shiftHeld = false;
  const w = window.innerWidth;
  for (let i = 0; i < e.touches.length; i++) {
    const x = e.touches[i].clientX;
    if (x < w * 0.35) turnLeft = true;
    else if (x > w * 0.65) turnRight = true;
    else shiftHeld = true;
  }
}

function onVisibilityChange() {
  if (document.hidden && isPlaying && snake.alive) {
    pauseGame();
  }
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ═══════════════════════════════════════════════════════════════════════
// UI & JUICE
// ═══════════════════════════════════════════════════════════════════════

function updateScoreDisplay() {
  targetScore = score;
}

function updateScoreRolling(dt) {
  if (displayScore < targetScore) {
    const diff = targetScore - displayScore;
    const step = Math.max(1, Math.ceil(diff * 8 * dt));
    displayScore = Math.min(targetScore, displayScore + step);
    scoreEl.textContent = displayScore;
  }
}

function showCombo(mult) {
  comboEl.textContent = `x${mult}`;
  const colors = ['#FF6B35', '#FF5722', '#F44336', '#E91E63', '#D50000'];
  comboEl.style.color = colors[Math.min(mult - 1, 4)];
  comboEl.style.display = 'block';
  comboEl.style.opacity = '1';
  comboEl.style.fontSize = `${30 + mult * 5}px`;
  // Bounce animation
  comboEl.classList.remove('bounce');
  void comboEl.offsetWidth; // force reflow
  comboEl.classList.add('bounce');
  comboDisplayTimer = 1.0;
}


function showScorePopup(worldPos, points, isGolden) {
  const vec = worldPos.clone().project(camera);
  if (vec.z > 1) return;
  const x = Math.max(20, Math.min(window.innerWidth - 60, (vec.x * 0.5 + 0.5) * window.innerWidth));
  const y = Math.max(20, Math.min(window.innerHeight - 40, (-vec.y * 0.5 + 0.5) * window.innerHeight));
  const el = document.createElement('div');
  el.className = 'score-popup' + (isGolden ? ' golden' : '');
  el.textContent = `+${points}`;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  document.getElementById('score-popups').appendChild(el);
  requestAnimationFrame(() => {
    el.style.transform = 'translateY(-50px)';
    el.style.opacity = '0';
  });
  setTimeout(() => el.remove(), 700);
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN LOOP
// ═══════════════════════════════════════════════════════════════════════

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  updateGame(dt);
  particles.update(dt);
  updateFoodEatEffects(dt);
  updateDeathAnimation(dt);
  updateScoreRolling(dt);

  if (comboDisplayTimer > 0) {
    comboDisplayTimer -= dt;
    comboEl.style.opacity = String(Math.max(0, comboDisplayTimer));
    if (comboDisplayTimer <= 0) comboEl.style.display = 'none';
  }

  if (shakeIntensity > 0) {
    camera.position.x += (Math.random() - 0.5) * shakeIntensity;
    camera.position.y += (Math.random() - 0.5) * shakeIntensity * 0.5;
    shakeIntensity *= 0.86;
    if (shakeIntensity < 0.01) shakeIntensity = 0;
  }

  if (!isPlaying && !deathAnimActive) {
    const t = clock.elapsedTime * 0.15;
    camera.position.set(Math.sin(t) * 25, 18, Math.cos(t) * 25);
    camera.lookAt(0, 0, 0);
  }

  renderer.render(scene, camera);
}

// ═══════════════════════════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════════════════════════

init();
