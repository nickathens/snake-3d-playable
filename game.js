import * as THREE from 'three';

// ── Level Defaults & Helper ───────────────────────────────────────────
const LD = {
  hasBoost: false, hasJump: false, isFlying: false, obstacles: false,
  isMaze: false, isLightsOut: false, hasPortals: false, isTron: false,
  isGravity: false, isIce: false, isShrinking: false, isTimeAttack: false,
  hasMinefield: false, isDualArena: false, hasAISnake: false, isReverse: false,
  hasTsunami: false, isGauntlet: false, isWrap: false, isInfinity: false,
};
const L = (o) => ({ ...LD, ...o });

// ── Level Configuration ─────────────────────────────────────────────────
const LEVELS = [
  L({
    name: 'CLASSIC', description: 'FLAT ARENA / PURE SKILL',
    arenaSize: 20, moveSpeed: 8, maxFood: 5, foodSpawnInterval: 2.5,
    unlockScore: 0, unlockLevel: -1,
    fogDensity: 0.005, groundColor: 0x4a8c3f, wallColor: 0x8b7355, accentColor: 0x5a9a4a,
    camDist: 12, camHeight: 6,
  }),
  L({
    name: 'SKATEPARK', description: 'OBSTACLES / JUMP / BOOST',
    arenaSize: 30, moveSpeed: 9, maxFood: 10, foodSpawnInterval: 1.5,
    unlockScore: 100, unlockLevel: 0,
    hasBoost: true, hasJump: true, obstacles: true,
    fogDensity: 0.004, groundColor: 0x666666, wallColor: 0x999999, accentColor: 0xdd8833,
    camDist: 14, camHeight: 8,
  }),
  L({
    name: 'SPACE FLIGHT', description: '3D FLYING / SPHERICAL ARENA',
    arenaSize: 60, moveSpeed: 10, maxFood: 20, foodSpawnInterval: 0.8,
    unlockScore: 200, unlockLevel: 1,
    hasBoost: true, isFlying: true,
    fogDensity: 0.002, groundColor: 0x1a1a2e, wallColor: 0x4466aa, accentColor: 0x6688cc,
    camDist: 12, camHeight: 4,
  }),
  L({
    name: 'MAZE', description: 'CORRIDORS / TIGHT SPACES',
    arenaSize: 22, moveSpeed: 7, maxFood: 6, foodSpawnInterval: 2.0,
    unlockScore: 150, unlockLevel: 2,
    isMaze: true,
    fogDensity: 0.004, groundColor: 0x5a7a5a, wallColor: 0x887766, accentColor: 0x778866,
    camDist: 18, camHeight: 16,
  }),
  L({
    name: 'LIGHTS OUT', description: 'LIMITED VISIBILITY / BOOST',
    arenaSize: 22, moveSpeed: 8, maxFood: 8, foodSpawnInterval: 2.0,
    unlockScore: 100, unlockLevel: 3,
    hasBoost: true, obstacles: true, isLightsOut: true,
    fogDensity: 0.12, groundColor: 0x2a2a2a, wallColor: 0x555555, accentColor: 0xcc6633,
    camDist: 8, camHeight: 5,
  }),
  L({
    name: 'PORTAL', description: 'TELEPORTERS / BOOST',
    arenaSize: 25, moveSpeed: 9, maxFood: 8, foodSpawnInterval: 1.8,
    unlockScore: 150, unlockLevel: 4,
    hasBoost: true, hasPortals: true,
    fogDensity: 0.004, groundColor: 0x4a6a5a, wallColor: 0x7a6a8a, accentColor: 0x8866aa,
    camDist: 14, camHeight: 8,
  }),
  L({
    name: 'TRON', description: 'LIGHT TRAIL / SURVIVAL',
    arenaSize: 20, moveSpeed: 9, maxFood: 5, foodSpawnInterval: 2.5,
    unlockScore: 150, unlockLevel: 5,
    isTron: true,
    fogDensity: 0.005, groundColor: 0x3a4a5a, wallColor: 0x5577aa, accentColor: 0x4488cc,
    camDist: 16, camHeight: 14,
  }),
  L({
    name: 'GRAVITY WELL', description: 'GRAVITATIONAL PULL / BOOST',
    arenaSize: 25, moveSpeed: 8, maxFood: 8, foodSpawnInterval: 1.8,
    unlockScore: 200, unlockLevel: 6,
    hasBoost: true, isGravity: true,
    fogDensity: 0.004, groundColor: 0x5a4a3a, wallColor: 0x997744, accentColor: 0xcc8833,
    camDist: 14, camHeight: 10,
  }),
  // ── New Levels ──────────────────────────────────────────────────────
  L({
    name: 'ICE RINK', description: 'SLIPPERY CONTROLS / DRIFT',
    arenaSize: 24, moveSpeed: 10, maxFood: 6, foodSpawnInterval: 2.0,
    unlockScore: 150, unlockLevel: 7,
    isIce: true,
    fogDensity: 0.003, groundColor: 0xc8dae8, wallColor: 0x8899aa, accentColor: 0x6688bb,
    camDist: 14, camHeight: 8,
  }),
  L({
    name: 'SHRINKING', description: 'ARENA CLOSES IN / BOOST',
    arenaSize: 28, moveSpeed: 8, maxFood: 8, foodSpawnInterval: 1.5,
    unlockScore: 100, unlockLevel: 8,
    hasBoost: true, isShrinking: true,
    fogDensity: 0.004, groundColor: 0x6a4a3a, wallColor: 0xaa5533, accentColor: 0xcc4422,
    camDist: 16, camHeight: 10,
  }),
  L({
    name: 'TIME ATTACK', description: 'COUNTDOWN / EAT TO SURVIVE',
    arenaSize: 22, moveSpeed: 10, maxFood: 10, foodSpawnInterval: 1.0,
    unlockScore: 150, unlockLevel: 9,
    isTimeAttack: true,
    fogDensity: 0.004, groundColor: 0x5a3a3a, wallColor: 0x884444, accentColor: 0xcc3333,
    camDist: 12, camHeight: 6,
  }),
  L({
    name: 'MINEFIELD', description: 'MINES EVERYWHERE / BOOST',
    arenaSize: 25, moveSpeed: 8, maxFood: 8, foodSpawnInterval: 1.8,
    unlockScore: 100, unlockLevel: 10,
    hasBoost: true, hasMinefield: true,
    fogDensity: 0.004, groundColor: 0x3a4a3a, wallColor: 0x556644, accentColor: 0x884422,
    camDist: 14, camHeight: 8,
  }),
  L({
    name: 'DUAL ARENA', description: 'TWO ROOMS / NARROW PASSAGE',
    arenaSize: 22, moveSpeed: 8, maxFood: 8, foodSpawnInterval: 1.8,
    unlockScore: 150, unlockLevel: 11,
    isDualArena: true, isMaze: true,
    fogDensity: 0.004, groundColor: 0x5a6a5a, wallColor: 0x887766, accentColor: 0x778866,
    camDist: 18, camHeight: 16,
  }),
  L({
    name: 'SNAKE HUNT', description: 'AI COMPETITOR / BOOST',
    arenaSize: 24, moveSpeed: 9, maxFood: 10, foodSpawnInterval: 1.5,
    unlockScore: 100, unlockLevel: 12,
    hasBoost: true, hasAISnake: true,
    fogDensity: 0.004, groundColor: 0x4a7a4a, wallColor: 0x8b7355, accentColor: 0xcc6633,
    camDist: 14, camHeight: 8,
  }),
  L({
    name: 'REVERSE', description: 'CONTROLS FLIP PERIODICALLY',
    arenaSize: 22, moveSpeed: 9, maxFood: 6, foodSpawnInterval: 2.0,
    unlockScore: 100, unlockLevel: 13,
    isReverse: true,
    fogDensity: 0.004, groundColor: 0x5a5a6a, wallColor: 0x7766aa, accentColor: 0x9955cc,
    camDist: 12, camHeight: 6,
  }),
  L({
    name: 'TSUNAMI', description: 'PERIODIC WAVE / JUMP TO SURVIVE',
    arenaSize: 25, moveSpeed: 8, maxFood: 8, foodSpawnInterval: 1.8,
    unlockScore: 150, unlockLevel: 14,
    hasJump: true, hasTsunami: true,
    fogDensity: 0.004, groundColor: 0x3a6a7a, wallColor: 0x557788, accentColor: 0x3399bb,
    camDist: 14, camHeight: 8,
  }),
  L({
    name: 'SPEED DEMON', description: 'MAXIMUM SPEED / TINY ARENA',
    arenaSize: 12, moveSpeed: 14, maxFood: 4, foodSpawnInterval: 2.0,
    unlockScore: 100, unlockLevel: 15,
    fogDensity: 0.006, groundColor: 0x5a2a2a, wallColor: 0x993333, accentColor: 0xee2222,
    camDist: 10, camHeight: 5,
  }),
  L({
    name: 'GAUNTLET', description: 'DENSE OBSTACLES / BOOST',
    arenaSize: 28, moveSpeed: 9, maxFood: 10, foodSpawnInterval: 1.5,
    unlockScore: 150, unlockLevel: 16,
    hasBoost: true, isGauntlet: true, obstacles: true,
    fogDensity: 0.004, groundColor: 0x5a5a5a, wallColor: 0x888888, accentColor: 0xaa7733,
    camDist: 16, camHeight: 10,
  }),
  L({
    name: 'ZEN', description: 'NO WALLS / WRAP AROUND',
    arenaSize: 30, moveSpeed: 6, maxFood: 15, foodSpawnInterval: 1.0,
    unlockScore: 100, unlockLevel: 17,
    isWrap: true,
    fogDensity: 0.003, groundColor: 0x5a8a6a, wallColor: 0x779977, accentColor: 0x66aa77,
    camDist: 14, camHeight: 8,
  }),
  L({
    name: 'INFINITY', description: 'ENDLESS / ESCALATING HAZARDS',
    arenaSize: 28, moveSpeed: 8, maxFood: 8, foodSpawnInterval: 1.5,
    unlockScore: 200, unlockLevel: 18,
    hasBoost: true, isInfinity: true,
    fogDensity: 0.004, groundColor: 0x4a4a5a, wallColor: 0x666688, accentColor: 0x8866cc,
    camDist: 14, camHeight: 8,
  }),
];

const NUM_LEVELS = LEVELS.length;

// ── Constants ──────────────────────────────────────────────────────────
const TURN_SPEED = 3;
const SEGMENT_SPACING = 0.8;
const INITIAL_SEGMENTS = 3;
const SNAKE_COLOR = 0x2d8a2d;
const SNAKE_HEAD_COLOR = 0x3aaa3a;
const FOOD_COLORS = [0xdd3333, 0xee6622, 0xeecc22, 0xdd4488, 0x33aa55];

const BOOST_DURATION = 1.2;
const BOOST_SPEED_MULT = 2.2;
const BOOST_RECHARGE = 3.5;
const BOOST_ACCEL = 8;
const BOOST_DECEL = 2;

const JUMP_FORCE = 12;
const GRAVITY = 25;

const BULGE_SPEED = 8;
const BULGE_SCALE = 1.5;

const SPEED_RAMP_PER_FOOD = 0.02;
const SPEED_RAMP_MAX = 1.6;

const COMBO_WINDOW = 3.0;

const GRAVITY_WELL_STRENGTH = 3.0;

const TRON_TRAIL_INTERVAL = 0.4;
const TRON_TRAIL_MAX = 5000;
const TRON_GRACE_COUNT = 20;

// Ice
const ICE_TURN_FRICTION = 1.8;
const ICE_TURN_ACCEL = 4.0;

// Shrinking
const SHRINK_RATE = 0.4;
const SHRINK_MIN = 8;

// Time Attack
const TIME_ATTACK_START = 30;
const TIME_ATTACK_PER_FOOD = 4;

// Minefield
const MINE_INITIAL = 15;
const MINE_SPAWN_INTERVAL = 8;
const MINE_MAX = 40;
const MINE_RADIUS = 0.8;

// AI Snake
const AI_SPEED_MULT = 0.7;
const AI_TURN_SPEED = 2.5;
const AI_SEGMENTS = 5;

// Reverse
const REVERSE_CYCLE = 10;
const REVERSE_DURATION = 5;
const REVERSE_WARN = 2;

// Tsunami
const TSUNAMI_CYCLE = 12;
const TSUNAMI_SPEED = 18;
const TSUNAMI_HEIGHT = 2.5;

// Infinity
const INFINITY_PHASE_DURATION = 30;

// Maze wall layout [x1, z1, x2, z2] segments
const MAZE_LAYOUT = [
  [-8, -8, -2, -8], [2, -8, 8, -8], [-8, 8, -2, 8], [2, 8, 8, 8],
  [-8, -8, -8, -2], [-8, 2, -8, 8], [8, -8, 8, -2], [8, 2, 8, 8],
  [-18, -14, -4, -14], [4, -14, 18, -14], [-18, 14, -4, 14], [4, 14, 18, 14],
  [-14, -18, -14, -8], [-14, 8, -14, 18], [14, -18, 14, -8], [14, 8, 14, 18],
  [0, -18, 0, -10], [0, 10, 0, 18], [-18, 0, -10, 0], [10, 0, 18, 0],
];

// Dual Arena wall layout
const DUAL_ARENA_LAYOUT = [
  [0, -22, 0, -3], [0, 3, 0, 22],
];

// Portal positions
const PORTAL_PAIRS = [
  { a: { x: -16, z: -16 }, b: { x: 16, z: 16 }, color: 0x3399cc },
  { a: { x: -16, z: 16 }, b: { x: 16, z: -16 }, color: 0xcc6699 },
];

// ── Audio System ──────────────────────────────────────────────────────
let audioCtx = null;
const audioBuffers = { eat: [], jump: [], land: [] };
let lastEatIndex = -1, lastJumpIndex = -1, lastLandIndex = -1;
let audioLoaded = false;

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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

  const eatFiles = ['eat_1', 'eat_2', 'eat_3', 'eat_4', 'eat_5', 'eat_6'];
  const jumpFiles = ['jump_1', 'jump_2'];
  const landFiles = ['land_1', 'land_2', 'land_3', 'land_4'];

  const [eatBufs, jumpBufs, landBufs] = await Promise.all([
    Promise.all(eatFiles.map(f => load(`sounds/eat/${f}.mp3`))),
    Promise.all(jumpFiles.map(f => load(`sounds/jump/${f}.mp3`))),
    Promise.all(landFiles.map(f => load(`sounds/land/${f}.mp3`))),
  ]);

  audioBuffers.eat = eatBufs.filter(Boolean);
  audioBuffers.jump = jumpBufs.filter(Boolean);
  audioBuffers.land = landBufs.filter(Boolean);
  audioLoaded = true;
}

function playSound(category) {
  if (!audioCtx || !audioBuffers[category].length) return;
  const bufs = audioBuffers[category];
  let idx = Math.floor(Math.random() * bufs.length);
  const lastMap = { eat: lastEatIndex, jump: lastJumpIndex, land: lastLandIndex };
  if (bufs.length > 1) {
    while (idx === lastMap[category]) idx = Math.floor(Math.random() * bufs.length);
  }
  if (category === 'eat') lastEatIndex = idx;
  else if (category === 'jump') lastJumpIndex = idx;
  else lastLandIndex = idx;

  const source = audioCtx.createBufferSource();
  const gain = audioCtx.createGain();
  source.buffer = bufs[idx];
  gain.gain.value = 0.3;
  source.connect(gain);
  gain.connect(audioCtx.destination);
  source.start();
}

function playDeathSound() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain); gain.connect(audioCtx.destination);
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
  osc.connect(gain); gain.connect(audioCtx.destination);
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
  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.type = 'square';
  osc.frequency.setValueAtTime(150, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.4);
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
  osc.start(); osc.stop(audioCtx.currentTime + 0.4);
}

function playTsunamiSound() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(100, audioCtx.currentTime);
  osc.frequency.linearRampToValueAtTime(200, audioCtx.currentTime + 0.8);
  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
  osc.start(); osc.stop(audioCtx.currentTime + 0.8);
}

// ── State ──────────────────────────────────────────────────────────────
let scene, camera, renderer;
let ambientLight, dirLight, hemiLight;
let snake = {
  segments: [], positions: [], rotations: [],
  direction: new THREE.Vector3(0, 0, 1),
  targetRotation: Math.PI, alive: false, tail: null,
};
let foods = [];
let foodGroup, snakeGroup, arenaGroup, obstacleGroup, starGroup;
let score = 0;
let isPlaying = false;
let foodSpawnTimer = 0;
let clock;
let currentLevel = 0;
let highScores = new Array(NUM_LEVELS).fill(0);
let unlockedLevels = new Array(NUM_LEVELS).fill(false);

// Food bulge
let foodBulges = [];
let pendingSegments = 0;

// Boost state
let boostGauge = 1;
let isBoosting = false;
let boostTimer = 0;
let currentSpeedMult = 1;

// Jump state
let isJumping = false;
let jumpVelocity = 0;

// Flight state
let flightQuaternion = new THREE.Quaternion();
let pitchAngle = 0;

// Obstacles
let obstacles = [];

// Speed ramp
let speedRampMult = 1;
let foodEaten = 0;

// Combo
let comboCount = 0;
let comboTimer = 0;
let comboDisplayTimer = 0;

// Maze colliders
let mazeColliders = [];

// Lights Out
let headLight = null;

// Portals
let portalPairs = [];
let portalMeshGroups = [];
let portalCooldowns = [0, 0];

// Tron trail
let tronTrailPoints = [];
let tronTrailMesh = null;
let tronTrailCount = 0;
const tronDummy = new THREE.Object3D();

// Screen shake
let shakeIntensity = 0;

// Ice
let iceAngularVel = 0;

// Shrinking
let shrinkTimer = 0;
let currentArenaSize = 0;
let shrinkWalls = [];

// Time Attack
let timeAttackTimer = 0;

// Minefield
let mines = [];
let mineGroup = null;
let mineSpawnTimer = 0;

// AI Snake
let aiSnake = {
  segments: [], positions: [], direction: new THREE.Vector3(0, 0, 1),
  targetRotation: Math.PI, alive: true,
};
let aiSnakeGroup = null;

// Reverse
let reverseTimer = 0;
let isReversed = false;

// Tsunami
let tsunamiTimer = 0;
let tsunamiWave = null;
let tsunamiDir = 0; // 0=+x, 1=-x, 2=+z, 3=-z
let tsunamiPos = 0;
let tsunamiActive = false;

// Infinity
let infinityPhase = 0;
let infinityPhaseTimer = 0;
let infinityMines = [];
let infinityShrinkSize = 0;

// Input
let turnLeft = false, turnRight = false;
let moveUp = false, moveDown = false;
let shiftHeld = false;
let wJustPressed = false, wHeld = false;
let touchStartX = 0, touchStartY = 0, touchActive = false;

// UI
const scoreEl = document.getElementById('score');
const startScreen = document.getElementById('start-screen');
const gameoverScreen = document.getElementById('gameover-screen');
const levelSelectScreen = document.getElementById('level-select-screen');
const finalScoreEl = document.getElementById('final-score');
const finalHighscoreEl = document.getElementById('final-highscore');
const levelUnlockMsg = document.getElementById('level-unlock-msg');
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

// ── Initialization ─────────────────────────────────────────────────────
function init() {
  clock = new THREE.Clock();
  loadProgress();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

  camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 500);

  const canvas = document.getElementById('game');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x556633, 0.6);
  scene.add(hemiLight);

  ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  dirLight = new THREE.DirectionalLight(0xfff5e0, 1.0);
  dirLight.position.set(15, 25, 10);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
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
  starGroup = new THREE.Group();
  scene.add(arenaGroup);
  scene.add(snakeGroup);
  scene.add(foodGroup);
  scene.add(obstacleGroup);
  scene.add(starGroup);

  createLevelButtons();

  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('touchstart', onTouchStart, { passive: false });
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  canvas.addEventListener('touchend', onTouchEnd, { passive: false });
  playBtn.addEventListener('click', showLevelSelect);
  restartBtn.addEventListener('click', () => startGame(currentLevel));
  levelsBtn.addEventListener('click', showLevelSelect);
  backBtn.addEventListener('click', () => {
    levelSelectScreen.style.display = 'none';
    startScreen.style.display = 'flex';
  });

  camera.position.set(0, 25, 25);
  camera.lookAt(0, 0, 0);

  animate();
}

// ── Level Buttons ─────────────────────────────────────────────────────
function createLevelButtons() {
  for (let i = 0; i < NUM_LEVELS; i++) {
    const btn = document.createElement('button');
    btn.className = 'btn level-btn';
    btn.id = `level-${i + 1}-btn`;
    btn.innerHTML = `
      <span class="level-name">${LEVELS[i].name}</span>
      <span class="level-info">${LEVELS[i].description}</span>
      <span class="level-score" id="level-${i + 1}-score"></span>
    `;
    const idx = i;
    btn.addEventListener('click', () => {
      if (unlockedLevels[idx]) startGame(idx);
    });
    levelListEl.appendChild(btn);
  }
}

// ── Save/Load ──────────────────────────────────────────────────────────
function loadProgress() {
  for (let i = 0; i < NUM_LEVELS; i++) {
    highScores[i] = parseInt(localStorage.getItem(`snake3d_hs_${i}`) || '0', 10);
  }
  unlockedLevels[0] = true;
  for (let i = 1; i < NUM_LEVELS; i++) {
    const req = LEVELS[i];
    unlockedLevels[i] = highScores[req.unlockLevel] >= req.unlockScore;
  }
  // TODO: revert before shipping
  for (let i = 0; i < NUM_LEVELS; i++) unlockedLevels[i] = true;
}

function saveProgress() {
  for (let i = 0; i < NUM_LEVELS; i++) {
    localStorage.setItem(`snake3d_hs_${i}`, String(highScores[i]));
  }
}

// ── Level Select ──────────────────────────────────────────────────────
function showLevelSelect() {
  startScreen.style.display = 'none';
  gameoverScreen.style.display = 'none';
  levelSelectScreen.style.display = 'flex';
  loadProgress();
  updateLevelButtons();
}

function updateLevelButtons() {
  for (let i = 0; i < NUM_LEVELS; i++) {
    const btn = document.getElementById(`level-${i + 1}-btn`);
    const scoreSpan = document.getElementById(`level-${i + 1}-score`);

    if (unlockedLevels[i]) {
      btn.disabled = false;
      btn.querySelector('.level-name').innerHTML = LEVELS[i].name;
      scoreSpan.textContent = highScores[i] > 0 ? `BEST: ${highScores[i]}` : '';
    } else {
      btn.disabled = true;
      btn.querySelector('.level-name').innerHTML = `<span class="lock-icon">&#x25A0;</span>${LEVELS[i].name}`;
      scoreSpan.textContent = `UNLOCK: ${LEVELS[i].unlockScore} PTS ON ${LEVELS[LEVELS[i].unlockLevel].name}`;
    }
  }
}

// ── Arena Building ────────────────────────────────────────────────────
function clearArena() {
  const clearGroup = (group) => {
    while (group.children.length) {
      const c = group.children[0];
      group.remove(c);
      c.traverse(ch => { if (ch.geometry) ch.geometry.dispose(); if (ch.material) ch.material.dispose(); });
    }
  };
  clearGroup(arenaGroup);
  clearGroup(obstacleGroup);
  clearGroup(starGroup);
  obstacles = [];
  mazeColliders = [];
  portalPairs = [];
  portalMeshGroups = [];
  portalCooldowns = [0, 0];
  shrinkWalls = [];

  if (headLight) { scene.remove(headLight); headLight = null; }

  if (tronTrailMesh) {
    scene.remove(tronTrailMesh);
    tronTrailMesh.geometry.dispose();
    tronTrailMesh.material.dispose();
    tronTrailMesh = null;
  }
  tronTrailPoints = [];
  tronTrailCount = 0;

  // Mines
  if (mineGroup) {
    scene.remove(mineGroup);
    mineGroup.traverse(ch => { if (ch.geometry) ch.geometry.dispose(); if (ch.material) ch.material.dispose(); });
    mineGroup = null;
  }
  mines = [];

  // AI Snake
  if (aiSnakeGroup) {
    scene.remove(aiSnakeGroup);
    aiSnakeGroup.traverse(ch => { if (ch.geometry) ch.geometry.dispose(); if (ch.material) ch.material.dispose(); });
    aiSnakeGroup = null;
  }
  aiSnake.segments = [];
  aiSnake.positions = [];

  // Tsunami
  if (tsunamiWave) {
    scene.remove(tsunamiWave);
    tsunamiWave.geometry.dispose();
    tsunamiWave.material.dispose();
    tsunamiWave = null;
  }
  tsunamiActive = false;
}

function buildArena(levelIdx) {
  clearArena();
  const lvl = LEVELS[levelIdx];

  // Reset lighting
  ambientLight.intensity = 0.4;
  dirLight.intensity = 1.0;
  dirLight.color.setHex(0xfff5e0);
  hemiLight.intensity = 0.6;
  hemiLight.color.setHex(0x87ceeb);
  hemiLight.groundColor.setHex(0x556633);

  if (lvl.isFlying) {
    scene.background = new THREE.Color(0x0a0a1e);
    scene.fog = new THREE.FogExp2(0x0a0a1e, lvl.fogDensity);
    hemiLight.color.setHex(0x222244);
    hemiLight.groundColor.setHex(0x111122);
    buildSpaceArena(lvl);
  } else if (lvl.isLightsOut) {
    scene.background = new THREE.Color(0x111111);
    scene.fog = new THREE.FogExp2(0x111111, lvl.fogDensity);
    ambientLight.intensity = 0.05;
    dirLight.intensity = 0.08;
    hemiLight.intensity = 0.05;
    headLight = new THREE.PointLight(0xffaa66, 2.5, 14);
    headLight.position.set(0, 2, 0);
    scene.add(headLight);
    buildGroundArena(lvl);
    buildObstacles(lvl);
  } else {
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.FogExp2(0x87ceeb, lvl.fogDensity);

    if (lvl.isIce) {
      scene.background = new THREE.Color(0xd0e4f0);
      scene.fog = new THREE.FogExp2(0xd0e4f0, lvl.fogDensity);
    }
    if (lvl.isShrinking || lvl.isTimeAttack) {
      scene.background = new THREE.Color(0x87ceeb);
    }

    buildGroundArena(lvl);
    if (lvl.obstacles) buildObstacles(lvl);
    if (lvl.isMaze) {
      if (lvl.isDualArena) buildMaze(lvl, DUAL_ARENA_LAYOUT);
      else buildMaze(lvl, MAZE_LAYOUT);
    }
    if (lvl.hasPortals) buildPortals(lvl);
    if (lvl.isTron) buildTronTrail(lvl);
    if (lvl.isGravity) {
      scene.background = new THREE.Color(0x2a1a0a);
      scene.fog = new THREE.FogExp2(0x2a1a0a, lvl.fogDensity);
      hemiLight.color.setHex(0x443322);
      hemiLight.groundColor.setHex(0x221100);
      buildGravityArena(lvl);
    }
    if (lvl.hasMinefield) buildMinefield(lvl);
    if (lvl.hasAISnake) buildAISnake(lvl);
    if (lvl.hasTsunami) buildTsunamiWave(lvl);
    if (lvl.isGauntlet) buildGauntletObstacles(lvl);
    if (lvl.isInfinity) {
      mineGroup = new THREE.Group();
      scene.add(mineGroup);
      infinityMines = [];
    }
  }
}

function buildGroundArena(lvl) {
  const gridSize = lvl.arenaSize * 2;

  const floorGeo = new THREE.PlaneGeometry(gridSize, gridSize);
  const floorMat = new THREE.MeshStandardMaterial({
    color: lvl.groundColor, roughness: 0.85, metalness: 0.05,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.01;
  floor.receiveShadow = true;
  arenaGroup.add(floor);

  const gridHelper = new THREE.GridHelper(gridSize, Math.min(40, gridSize), 0x000000, 0x000000);
  gridHelper.material.opacity = 0.08;
  gridHelper.material.transparent = true;
  arenaGroup.add(gridHelper);

  if (lvl.isWrap) return; // No walls for wrap mode

  const wallMat = new THREE.MeshStandardMaterial({
    color: lvl.wallColor, roughness: 0.7, metalness: 0.1,
  });
  const wallHeight = 2;
  const wt = 0.3;
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
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    arenaGroup.add(mesh);
    if (lvl.isShrinking) shrinkWalls.push(mesh);
  }

  const postMat = new THREE.MeshStandardMaterial({ color: 0x665544, roughness: 0.6 });
  const postGeo = new THREE.CylinderGeometry(0.2, 0.2, wallHeight + 1, 8);
  for (const cx of [-1, 1]) {
    for (const cz of [-1, 1]) {
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(cx * lvl.arenaSize, (wallHeight + 1) / 2, cz * lvl.arenaSize);
      post.castShadow = true;
      arenaGroup.add(post);
    }
  }
}

function buildObstacles(lvl) {
  const obstacleMat = new THREE.MeshStandardMaterial({
    color: lvl.accentColor, roughness: 0.5, metalness: 0.3,
  });

  const pillarCount = lvl.isLightsOut ? 8 : lvl.isGauntlet ? 25 : 12;
  const margin = 4;
  for (let i = 0; i < pillarCount; i++) {
    const height = 1.5 + Math.random() * 2;
    const radius = 0.4 + Math.random() * 0.4;
    const geo = new THREE.CylinderGeometry(radius, radius, height, 8);
    const mesh = new THREE.Mesh(geo, obstacleMat);

    let x, z, tooClose;
    let attempts = 0;
    do {
      x = (Math.random() * 2 - 1) * (lvl.arenaSize - margin);
      z = (Math.random() * 2 - 1) * (lvl.arenaSize - margin);
      tooClose = Math.abs(x) < 5 && Math.abs(z) < 5;
      for (const ob of obstacles) {
        if (new THREE.Vector2(x - ob.x, z - ob.z).length() < 3) tooClose = true;
      }
      attempts++;
    } while (tooClose && attempts < 50);

    mesh.position.set(x, height / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    obstacleGroup.add(mesh);
    obstacles.push({ x, z, radius: radius + 0.5, height, mesh });
  }

  if (!lvl.isLightsOut) {
    const barCount = lvl.isGauntlet ? 12 : 6;
    for (let i = 0; i < barCount; i++) {
      const width = 3 + Math.random() * 5;
      const geo = new THREE.BoxGeometry(width, 0.3, 0.3);
      const mesh = new THREE.Mesh(geo, obstacleMat);
      const x = (Math.random() * 2 - 1) * (lvl.arenaSize - 5);
      const z = (Math.random() * 2 - 1) * (lvl.arenaSize - 5);
      const angle = Math.random() * Math.PI;
      mesh.position.set(x, 0.5, z);
      mesh.rotation.y = angle;
      mesh.castShadow = true;
      obstacleGroup.add(mesh);
      obstacles.push({ x, z, radius: width / 2, height: 0.3, mesh, isBar: true, angle, width });
    }
  }
}

function buildSpaceArena(lvl) {
  const starCount = 2000;
  const starGeo = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 100 + Math.random() * 200;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    starPositions[i * 3 + 2] = r * Math.cos(phi);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, sizeAttenuation: true });
  starGroup.add(new THREE.Points(starGeo, starMat));

  const boundGeo = new THREE.SphereGeometry(lvl.arenaSize, 24, 16);
  const boundMat = new THREE.MeshBasicMaterial({
    color: lvl.accentColor, wireframe: true, transparent: true, opacity: 0.12,
  });
  arenaGroup.add(new THREE.Mesh(boundGeo, boundMat));

  const beaconGeo = new THREE.OctahedronGeometry(1.5, 0);
  const beaconMat = new THREE.MeshStandardMaterial({ color: lvl.accentColor, roughness: 0.3, metalness: 0.5 });
  arenaGroup.add(new THREE.Mesh(beaconGeo, beaconMat));

  ambientLight.intensity = 0.5;
  dirLight.intensity = 0.8;
}

// ── Maze ──────────────────────────────────────────────────────────────
function buildMaze(lvl, layout) {
  const wallMat = new THREE.MeshStandardMaterial({
    color: lvl.wallColor, roughness: 0.6, metalness: 0.1,
  });
  const wallHeight = 2;
  const wallThick = 0.4;

  for (const seg of layout) {
    const [x1, z1, x2, z2] = seg;
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.sqrt(dx * dx + dz * dz);
    const cx = (x1 + x2) / 2;
    const cz = (z1 + z2) / 2;
    const angle = Math.atan2(dx, dz);

    const geo = new THREE.BoxGeometry(wallThick, wallHeight, len);
    const mesh = new THREE.Mesh(geo, wallMat);
    mesh.position.set(cx, wallHeight / 2, cz);
    mesh.rotation.y = angle;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    obstacleGroup.add(mesh);

    const isHorizontal = Math.abs(dz) < Math.abs(dx);
    if (isHorizontal) {
      const minX = Math.min(x1, x2) - wallThick / 2;
      const maxX = Math.max(x1, x2) + wallThick / 2;
      const midZ = (z1 + z2) / 2;
      mazeColliders.push({ minX, maxX, minZ: midZ - wallThick / 2, maxZ: midZ + wallThick / 2 });
    } else {
      const minZ = Math.min(z1, z2) - wallThick / 2;
      const maxZ = Math.max(z1, z2) + wallThick / 2;
      const midX = (x1 + x2) / 2;
      mazeColliders.push({ minX: midX - wallThick / 2, maxX: midX + wallThick / 2, minZ, maxZ });
    }
  }
}

function isInMazeWall(pos) {
  const r = 0.6;
  for (const wall of mazeColliders) {
    if (pos.x + r > wall.minX && pos.x - r < wall.maxX &&
        pos.z + r > wall.minZ && pos.z - r < wall.maxZ) {
      return true;
    }
  }
  return false;
}

// ── Portals ───────────────────────────────────────────────────────────
function buildPortals(lvl) {
  portalPairs = PORTAL_PAIRS.map(p => ({ ...p }));
  portalCooldowns = [0, 0];
  portalMeshGroups = [];

  for (let i = 0; i < portalPairs.length; i++) {
    const pair = portalPairs[i];
    const color = pair.color;

    for (const pos of [pair.a, pair.b]) {
      const group = new THREE.Group();
      const torusGeo = new THREE.TorusGeometry(1.2, 0.15, 12, 24);
      const torusMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.6 });
      const torus = new THREE.Mesh(torusGeo, torusMat);
      torus.rotation.x = Math.PI / 2;
      torus.castShadow = true;
      group.add(torus);

      const discGeo = new THREE.CircleGeometry(1.0, 24);
      const discMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.rotation.x = Math.PI / 2;
      disc.position.y = 0.01;
      group.add(disc);

      group.position.set(pos.x, 0.5, pos.z);
      arenaGroup.add(group);
      portalMeshGroups.push(group);
    }
  }
}

function isOnPortal(pos) {
  for (const pair of portalPairs) {
    const da = Math.sqrt((pos.x - pair.a.x) ** 2 + (pos.z - pair.a.z) ** 2);
    const db = Math.sqrt((pos.x - pair.b.x) ** 2 + (pos.z - pair.b.z) ** 2);
    if (da < 3 || db < 3) return true;
  }
  return false;
}

function updatePortals(dt) {
  for (const group of portalMeshGroups) {
    group.children[0].rotation.z += dt * 2;
  }
  for (let i = 0; i < portalCooldowns.length; i++) {
    if (portalCooldowns[i] > 0) portalCooldowns[i] -= dt;
  }
  if (snake.positions.length === 0) return;
  const headPos = snake.positions[0];

  for (let i = 0; i < portalPairs.length; i++) {
    if (portalCooldowns[i] > 0) continue;
    const pair = portalPairs[i];
    const distA = Math.sqrt((headPos.x - pair.a.x) ** 2 + (headPos.z - pair.a.z) ** 2);
    const distB = Math.sqrt((headPos.x - pair.b.x) ** 2 + (headPos.z - pair.b.z) ** 2);

    if (distA < 1.5) {
      headPos.x = pair.b.x + snake.direction.x * 2.5;
      headPos.z = pair.b.z + snake.direction.z * 2.5;
      portalCooldowns[i] = 1.5;
      playPortalSound();
      return;
    }
    if (distB < 1.5) {
      headPos.x = pair.a.x + snake.direction.x * 2.5;
      headPos.z = pair.a.z + snake.direction.z * 2.5;
      portalCooldowns[i] = 1.5;
      playPortalSound();
      return;
    }
  }
}

// ── Tron Trail ────────────────────────────────────────────────────────
function buildTronTrail(lvl) {
  const geo = new THREE.BoxGeometry(0.3, 0.15, 0.3);
  const mat = new THREE.MeshStandardMaterial({ color: lvl.accentColor, roughness: 0.4, metalness: 0.3 });
  tronTrailMesh = new THREE.InstancedMesh(geo, mat, TRON_TRAIL_MAX);
  tronTrailMesh.count = 0;
  scene.add(tronTrailMesh);
  tronTrailPoints = [];
  tronTrailCount = 0;
}

function updateTronTrail(dt) {
  if (!tronTrailMesh || snake.positions.length === 0) return;
  const headPos = snake.positions[0];
  const lastPoint = tronTrailPoints.length > 0 ? tronTrailPoints[tronTrailPoints.length - 1] : null;
  const distFromLast = lastPoint
    ? Math.sqrt((headPos.x - lastPoint.x) ** 2 + (headPos.z - lastPoint.z) ** 2)
    : TRON_TRAIL_INTERVAL + 1;

  if (distFromLast >= TRON_TRAIL_INTERVAL && tronTrailCount < TRON_TRAIL_MAX) {
    const point = { x: headPos.x, z: headPos.z };
    tronTrailPoints.push(point);
    tronDummy.position.set(point.x, 0.08, point.z);
    tronDummy.updateMatrix();
    tronTrailMesh.setMatrixAt(tronTrailCount, tronDummy.matrix);
    tronTrailCount++;
    tronTrailMesh.count = tronTrailCount;
    tronTrailMesh.instanceMatrix.needsUpdate = true;
  }
}

function checkTronCollision(headPos) {
  if (tronTrailPoints.length <= TRON_GRACE_COUNT) return false;
  const checkEnd = tronTrailPoints.length - TRON_GRACE_COUNT;
  for (let i = 0; i < checkEnd; i++) {
    const p = tronTrailPoints[i];
    const dx = headPos.x - p.x;
    const dz = headPos.z - p.z;
    if (dx * dx + dz * dz < 0.36) return true;
  }
  return false;
}

// ── Gravity Well Arena ────────────────────────────────────────────────
function buildGravityArena(lvl) {
  const floorGeo = new THREE.CircleGeometry(lvl.arenaSize, 64);
  const floorMat = new THREE.MeshStandardMaterial({ color: lvl.groundColor, roughness: 0.8, metalness: 0.1 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.01;
  floor.receiveShadow = true;
  arenaGroup.add(floor);

  for (let r = 5; r <= lvl.arenaSize; r += 5) {
    const ringGeo = new THREE.RingGeometry(r - 0.05, r + 0.05, 64);
    const intensity = r / lvl.arenaSize;
    const ringMat = new THREE.MeshBasicMaterial({
      color: lvl.accentColor, transparent: true, opacity: 0.1 + intensity * 0.15, side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    arenaGroup.add(ring);
  }

  const wallGeo = new THREE.TorusGeometry(lvl.arenaSize, 0.2, 8, 64);
  const wallMat = new THREE.MeshStandardMaterial({ color: lvl.wallColor, roughness: 0.5, metalness: 0.3 });
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.rotation.x = Math.PI / 2;
  wall.position.y = 0.5;
  wall.castShadow = true;
  arenaGroup.add(wall);

  const coreGeo = new THREE.SphereGeometry(0.8, 16, 12);
  const coreMat = new THREE.MeshStandardMaterial({ color: lvl.accentColor, roughness: 0.3, metalness: 0.5 });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.y = 0.8;
  core.castShadow = true;
  arenaGroup.add(core);

  const lineMat = new THREE.LineBasicMaterial({ color: lvl.wallColor, transparent: true, opacity: 0.2 });
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
    const pts = [
      new THREE.Vector3(0, 0.02, 0),
      new THREE.Vector3(Math.cos(a) * lvl.arenaSize, 0.02, Math.sin(a) * lvl.arenaSize),
    ];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
    arenaGroup.add(new THREE.Line(lineGeo, lineMat));
  }
}

// ── Minefield ─────────────────────────────────────────────────────────
function buildMinefield(lvl) {
  mineGroup = new THREE.Group();
  scene.add(mineGroup);
  mines = [];
  for (let i = 0; i < MINE_INITIAL; i++) spawnMine(lvl);
  mineSpawnTimer = 0;
}

function spawnMine(lvl) {
  if (mines.length >= MINE_MAX) return;
  const geo = new THREE.SphereGeometry(0.4, 8, 6);
  const mat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.3, metalness: 0.8 });
  const mesh = new THREE.Mesh(geo, mat);

  // Spikes
  const spikeGeo = new THREE.ConeGeometry(0.1, 0.3, 4);
  const spikeMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.4, metalness: 0.6 });
  for (let j = 0; j < 8; j++) {
    const spike = new THREE.Mesh(spikeGeo, spikeMat);
    const theta = (j / 8) * Math.PI * 2;
    const phi = (j % 2) * 0.8 + 0.4;
    spike.position.set(Math.sin(phi) * Math.cos(theta) * 0.4, Math.cos(phi) * 0.4, Math.sin(phi) * Math.sin(theta) * 0.4);
    spike.lookAt(spike.position.clone().multiplyScalar(2));
    mesh.add(spike);
  }

  const size = lvl.arenaSize;
  let x, z, attempts = 0;
  do {
    x = (Math.random() * 2 - 1) * (size - 2);
    z = (Math.random() * 2 - 1) * (size - 2);
    attempts++;
  } while ((Math.abs(x) < 4 && Math.abs(z) < 4) && attempts < 50);

  mesh.position.set(x, 0.4, z);
  mesh.castShadow = true;
  mineGroup.add(mesh);
  mines.push({ x, z, mesh });
}

function updateMinefield(dt) {
  const lvl = LEVELS[currentLevel];
  mineSpawnTimer += dt;
  if (mineSpawnTimer >= MINE_SPAWN_INTERVAL) {
    mineSpawnTimer = 0;
    spawnMine(lvl);
  }
  // Rotate mines
  for (const mine of mines) {
    mine.mesh.rotation.y += dt * 0.5;
  }
}

function checkMineCollision(headPos) {
  for (const mine of mines) {
    const dx = headPos.x - mine.x;
    const dz = headPos.z - mine.z;
    if (dx * dx + dz * dz < MINE_RADIUS * MINE_RADIUS) return true;
  }
  return false;
}

// ── AI Snake ──────────────────────────────────────────────────────────
function buildAISnake(lvl) {
  aiSnakeGroup = new THREE.Group();
  scene.add(aiSnakeGroup);
  aiSnake.segments = [];
  aiSnake.positions = [];
  aiSnake.direction = new THREE.Vector3(0, 0, -1);
  aiSnake.targetRotation = 0;
  aiSnake.alive = true;

  const aiColor = 0xcc4422;
  const aiHeadColor = 0xee5533;

  for (let i = 0; i < AI_SEGMENTS; i++) {
    const size = i === 0 ? 0.55 : 0.4;
    const geo = new THREE.SphereGeometry(size, i === 0 ? 12 : 8, i === 0 ? 8 : 6);
    const mat = new THREE.MeshStandardMaterial({
      color: i === 0 ? aiHeadColor : aiColor, roughness: 0.4, metalness: 0.2,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;

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
  const headPos = aiSnake.positions[0];

  // Find nearest food
  let nearestFood = null;
  let nearestDist = Infinity;
  for (const food of foods) {
    const d = headPos.distanceTo(food.position);
    if (d < nearestDist) {
      nearestDist = d;
      nearestFood = food;
    }
  }

  // Steer toward food
  if (nearestFood) {
    const targetDir = new THREE.Vector3().subVectors(nearestFood.position, headPos);
    targetDir.y = 0;
    if (targetDir.length() > 0.1) {
      const targetAngle = Math.atan2(targetDir.x, targetDir.z);
      let angleDiff = targetAngle - aiSnake.targetRotation;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      aiSnake.targetRotation += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), AI_TURN_SPEED * dt);
    }
  }

  aiSnake.direction.set(Math.sin(aiSnake.targetRotation), 0, Math.cos(aiSnake.targetRotation)).normalize();
  const aiSpeed = lvl.moveSpeed * AI_SPEED_MULT;
  headPos.addScaledVector(aiSnake.direction, aiSpeed * dt);
  headPos.y = 0.5;

  // Bounce off walls
  const margin = lvl.arenaSize - 1;
  if (headPos.x > margin) { headPos.x = margin; aiSnake.targetRotation = Math.PI - aiSnake.targetRotation; }
  if (headPos.x < -margin) { headPos.x = -margin; aiSnake.targetRotation = Math.PI - aiSnake.targetRotation; }
  if (headPos.z > margin) { headPos.z = margin; aiSnake.targetRotation = -aiSnake.targetRotation; }
  if (headPos.z < -margin) { headPos.z = -margin; aiSnake.targetRotation = -aiSnake.targetRotation; }

  aiSnake.segments[0].position.copy(headPos);
  aiSnake.segments[0].rotation.y = aiSnake.targetRotation;

  // Body follows
  for (let i = 1; i < aiSnake.segments.length; i++) {
    const leaderPos = aiSnake.positions[i - 1];
    const curPos = aiSnake.positions[i];
    const dir = new THREE.Vector3().subVectors(leaderPos, curPos);
    dir.y = 0;
    const dist = dir.length();
    if (dist > SEGMENT_SPACING) {
      dir.normalize().multiplyScalar(dist - SEGMENT_SPACING);
      curPos.add(dir);
    }
    curPos.y = 0.5;
    aiSnake.segments[i].position.copy(curPos);
    const flatDir = new THREE.Vector3(dir.x, 0, dir.z);
    if (flatDir.length() > 0.01) {
      aiSnake.segments[i].rotation.y = Math.atan2(flatDir.x, flatDir.z);
    }
  }

  // AI eats food
  for (let i = foods.length - 1; i >= 0; i--) {
    if (headPos.distanceTo(foods[i].position) < 1.3) {
      const food = foods[i];
      foodGroup.remove(food);
      food.traverse(c => { if (c.geometry) c.geometry.dispose(); });
      foods.splice(i, 1);
      break;
    }
  }
}

function checkAISnakeCollision(headPos) {
  for (let i = 0; i < aiSnake.positions.length; i++) {
    if (headPos.distanceTo(aiSnake.positions[i]) < 0.7) return true;
  }
  return false;
}

// ── Tsunami ───────────────────────────────────────────────────────────
function buildTsunamiWave(lvl) {
  const geo = new THREE.BoxGeometry(lvl.arenaSize * 2 + 2, TSUNAMI_HEIGHT, 1.5);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x2277bb, transparent: true, opacity: 0.6, roughness: 0.2, metalness: 0.3,
  });
  tsunamiWave = new THREE.Mesh(geo, mat);
  tsunamiWave.visible = false;
  tsunamiWave.position.y = TSUNAMI_HEIGHT / 2;
  scene.add(tsunamiWave);
  tsunamiTimer = TSUNAMI_CYCLE;
  tsunamiActive = false;
}

function updateTsunami(dt) {
  const lvl = LEVELS[currentLevel];
  if (!tsunamiWave) return;

  if (!tsunamiActive) {
    tsunamiTimer -= dt;

    // Warning at 3 seconds
    if (tsunamiTimer < 3 && tsunamiTimer > 0) {
      warningEl.textContent = 'WAVE INCOMING';
      warningEl.style.color = '#2277bb';
      warningEl.style.display = 'block';
      warningEl.style.opacity = String(Math.abs(Math.sin(tsunamiTimer * 4)));
    }

    if (tsunamiTimer <= 0) {
      tsunamiActive = true;
      tsunamiDir = Math.floor(Math.random() * 4);
      const size = lvl.arenaSize;

      if (tsunamiDir === 0 || tsunamiDir === 1) {
        tsunamiWave.scale.set(1, 1, 1);
        tsunamiWave.rotation.y = 0;
        tsunamiPos = tsunamiDir === 0 ? -size - 2 : size + 2;
      } else {
        tsunamiWave.scale.set(1, 1, 1);
        tsunamiWave.rotation.y = Math.PI / 2;
        tsunamiPos = tsunamiDir === 2 ? -size - 2 : size + 2;
      }
      tsunamiWave.visible = true;
      warningEl.style.display = 'none';
      playTsunamiSound();
    }
  } else {
    const speed = TSUNAMI_SPEED;
    const size = lvl.arenaSize;
    const dir = (tsunamiDir === 0 || tsunamiDir === 2) ? 1 : -1;
    tsunamiPos += speed * dir * dt;

    if (tsunamiDir === 0 || tsunamiDir === 1) {
      tsunamiWave.position.set(tsunamiPos, TSUNAMI_HEIGHT / 2, 0);
    } else {
      tsunamiWave.position.set(0, TSUNAMI_HEIGHT / 2, tsunamiPos);
    }

    // Check if wave has crossed the arena
    if ((dir === 1 && tsunamiPos > size + 2) || (dir === -1 && tsunamiPos < -size - 2)) {
      tsunamiActive = false;
      tsunamiWave.visible = false;
      tsunamiTimer = TSUNAMI_CYCLE;
    }
  }
}

function checkTsunamiCollision(headPos) {
  if (!tsunamiActive || !tsunamiWave || isJumping) return false;
  const wavePos = tsunamiPos;
  if (tsunamiDir === 0 || tsunamiDir === 1) {
    return Math.abs(headPos.x - wavePos) < 1.2;
  } else {
    return Math.abs(headPos.z - wavePos) < 1.2;
  }
}

// ── Gauntlet Obstacles ────────────────────────────────────────────────
function buildGauntletObstacles(lvl) {
  // Extra dense obstacles already handled by buildObstacles with isGauntlet flag
  // Add some moving barrier indicators (colored floor markers)
  const markerMat = new THREE.MeshBasicMaterial({ color: 0xffaa33, transparent: true, opacity: 0.15 });
  for (let i = 0; i < 6; i++) {
    const geo = new THREE.RingGeometry(2, 2.3, 24);
    const mesh = new THREE.Mesh(geo, markerMat);
    mesh.rotation.x = -Math.PI / 2;
    const x = (Math.random() * 2 - 1) * (lvl.arenaSize - 5);
    const z = (Math.random() * 2 - 1) * (lvl.arenaSize - 5);
    mesh.position.set(x, 0.02, z);
    arenaGroup.add(mesh);
  }
}

// ── Snake ──────────────────────────────────────────────────────────────
function createSnakeSegment(isHead) {
  const lvl = LEVELS[currentLevel];
  const snakeColor = lvl.isFlying ? 0x4488cc : SNAKE_COLOR;
  const headColor = lvl.isFlying ? 0x66aaee : SNAKE_HEAD_COLOR;

  const size = isHead ? 0.55 : 0.4;
  const geo = isHead ? new THREE.SphereGeometry(size, 12, 8) : new THREE.SphereGeometry(size, 8, 6);
  const mat = new THREE.MeshStandardMaterial({
    color: isHead ? headColor : snakeColor, roughness: 0.4, metalness: 0.2,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;

  if (isHead) {
    const eyeGeo = new THREE.SphereGeometry(0.1, 6, 4);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilGeo = new THREE.SphereGeometry(0.06, 6, 4);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    for (const side of [-1, 1]) {
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(side * 0.25, 0.2, 0.35);
      mesh.add(eye);
      const pupil = new THREE.Mesh(pupilGeo, pupilMat);
      pupil.position.set(side * 0.27, 0.22, 0.42);
      mesh.add(pupil);
    }
  }
  return mesh;
}

function createTail() {
  const lvl = LEVELS[currentLevel];
  const snakeColor = lvl.isFlying ? 0x4488cc : SNAKE_COLOR;
  const geo = new THREE.ConeGeometry(0.3, 1.0, 6);
  const mat = new THREE.MeshStandardMaterial({ color: snakeColor, roughness: 0.4, metalness: 0.2 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = Math.PI / 2;
  mesh.castShadow = true;
  const wrapper = new THREE.Group();
  wrapper.add(mesh);
  return wrapper;
}

function resetSnake() {
  while (snakeGroup.children.length) {
    const child = snakeGroup.children[0];
    snakeGroup.remove(child);
    child.traverse(c => { if (c.geometry) c.geometry.dispose(); });
  }
  snake.segments = [];
  snake.positions = [];
  snake.rotations = [];
  snake.direction.set(0, 0, 1);
  snake.targetRotation = Math.PI;
  snake.alive = true;
  foodBulges = [];
  pendingSegments = 0;

  boostGauge = 1;
  isBoosting = false;
  boostTimer = 0;
  currentSpeedMult = 1;

  isJumping = false;
  jumpVelocity = 0;

  flightQuaternion.identity();
  flightQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
  pitchAngle = 0;

  speedRampMult = 1;
  foodEaten = 0;
  comboCount = 0;
  comboTimer = 0;

  // Ice
  iceAngularVel = 0;

  // Shrinking
  shrinkTimer = 0;
  currentArenaSize = LEVELS[currentLevel].arenaSize;

  // Time Attack
  timeAttackTimer = TIME_ATTACK_START;

  // Minefield
  mineSpawnTimer = 0;

  // Reverse
  reverseTimer = 0;
  isReversed = false;

  // Tsunami
  tsunamiTimer = TSUNAMI_CYCLE;
  tsunamiActive = false;

  // Infinity
  infinityPhase = 0;
  infinityPhaseTimer = 0;
  infinityShrinkSize = LEVELS[currentLevel].arenaSize;

  const startY = LEVELS[currentLevel].isFlying ? 0 : 0.5;

  for (let i = 0; i < INITIAL_SEGMENTS; i++) {
    const mesh = createSnakeSegment(i === 0);
    const pos = new THREE.Vector3(0, startY, -i * SEGMENT_SPACING);
    mesh.position.copy(pos);
    mesh.rotation.y = Math.PI;
    snakeGroup.add(mesh);
    snake.segments.push(mesh);
    snake.positions.push(pos.clone());
    snake.rotations.push(Math.PI);
  }

  snake.tail = createTail();
  snakeGroup.add(snake.tail);
  updateTail();
}

// ── Food ───────────────────────────────────────────────────────────────
function spawnFood() {
  const lvl = LEVELS[currentLevel];
  const color = FOOD_COLORS[Math.floor(Math.random() * FOOD_COLORS.length)];
  const group = new THREE.Group();

  const geo = new THREE.SphereGeometry(0.35, 12, 8);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.1 });
  const foodMesh = new THREE.Mesh(geo, mat);
  foodMesh.castShadow = true;
  group.add(foodMesh);

  let pos, attempts = 0;
  const effectiveSize = lvl.isShrinking ? currentArenaSize : (lvl.isInfinity ? infinityShrinkSize : lvl.arenaSize);

  if (lvl.isFlying) {
    do {
      const r = 5 + Math.random() * (lvl.arenaSize * 0.8);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      pos = new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
      attempts++;
    } while (isOnSnake(pos, 3) && attempts < 50);
  } else if (lvl.isGravity) {
    do {
      const angle = Math.random() * Math.PI * 2;
      const r = lvl.arenaSize * (0.3 + Math.random() * 0.6);
      pos = new THREE.Vector3(Math.cos(angle) * r, 0.5, Math.sin(angle) * r);
      attempts++;
    } while (isOnSnake(pos, 2) && attempts < 50);
  } else {
    const sz = effectiveSize - 1.5;
    do {
      const x = (Math.random() * 2 - 1) * sz;
      const z = (Math.random() * 2 - 1) * sz;
      pos = new THREE.Vector3(x, 0.5, z);
      attempts++;
    } while ((isOnSnake(pos, 2) || isInObstacle(pos) ||
              (lvl.isMaze && isInMazeWall(pos)) ||
              (lvl.hasPortals && isOnPortal(pos)) ||
              (lvl.hasMinefield && isOnMine(pos)) ||
              (lvl.isInfinity && isOnInfinityMine(pos))) && attempts < 50);
  }

  group.position.copy(pos);
  group.userData = { time: Math.random() * Math.PI * 2, baseY: pos.y };
  foodGroup.add(group);
  foods.push(group);
}

function isOnSnake(pos, threshold) {
  for (const sp of snake.positions) {
    if (pos.distanceTo(sp) < threshold) return true;
  }
  return false;
}

function isInObstacle(pos) {
  for (const ob of obstacles) {
    const dx = pos.x - ob.x;
    const dz = pos.z - ob.z;
    if (Math.sqrt(dx * dx + dz * dz) < ob.radius + 1) return true;
  }
  return false;
}

function isOnMine(pos) {
  for (const mine of mines) {
    const dx = pos.x - mine.x;
    const dz = pos.z - mine.z;
    if (dx * dx + dz * dz < 4) return true;
  }
  return false;
}

function isOnInfinityMine(pos) {
  for (const mine of infinityMines) {
    const dx = pos.x - mine.x;
    const dz = pos.z - mine.z;
    if (dx * dx + dz * dz < 4) return true;
  }
  return false;
}

function updateFoods(dt) {
  for (const food of foods) {
    food.userData.time += dt;
    food.position.y = food.userData.baseY + Math.sin(food.userData.time * 3) * 0.15;
    food.children[0].rotation.y += dt * 1.5;
  }
}

// ── Game Logic ─────────────────────────────────────────────────────────
function startGame(levelIdx) {
  currentLevel = levelIdx;
  const lvl = LEVELS[levelIdx];

  startScreen.style.display = 'none';
  gameoverScreen.style.display = 'none';
  levelSelectScreen.style.display = 'none';

  score = 0;
  updateScoreDisplay();

  levelIndicator.textContent = `LEVEL ${levelIdx + 1}: ${lvl.name}`;
  levelIndicator.style.display = 'block';
  levelIndicator.style.color = '#ddd';

  const showBoost = lvl.hasBoost;
  boostBar.style.display = showBoost ? 'block' : 'none';
  boostLabel.style.display = showBoost ? 'block' : 'none';

  timerEl.style.display = lvl.isTimeAttack ? 'block' : 'none';
  warningEl.style.display = 'none';

  if (lvl.isFlying) {
    controlsHint.textContent = 'ARROWS: STEER / W/S: PITCH / SHIFT: BOOST';
  } else if (lvl.hasJump && lvl.hasTsunami) {
    controlsHint.textContent = 'ARROWS: STEER / W: JUMP OVER WAVES';
  } else if (lvl.hasJump) {
    controlsHint.textContent = 'ARROWS: STEER / W: JUMP / SHIFT: BOOST';
  } else if (lvl.hasBoost) {
    controlsHint.textContent = 'ARROWS: STEER / SHIFT: BOOST';
  } else if (lvl.isIce) {
    controlsHint.textContent = 'ARROWS / SWIPE (SLIPPERY!)';
  } else if (lvl.isReverse) {
    controlsHint.textContent = 'ARROWS / SWIPE (CONTROLS FLIP!)';
  } else if (lvl.isWrap) {
    controlsHint.textContent = 'ARROWS / SWIPE (NO WALLS)';
  } else if (lvl.isInfinity) {
    controlsHint.textContent = 'ARROWS: STEER / SHIFT: BOOST / SURVIVE';
  } else {
    controlsHint.textContent = 'ARROWS / SWIPE';
  }

  buildArena(levelIdx);
  resetSnake();

  while (foodGroup.children.length) {
    const child = foodGroup.children[0];
    foodGroup.remove(child);
    child.traverse(c => { if (c.geometry) c.geometry.dispose(); });
  }
  foods = [];

  const initialCount = lvl.isFlying ? 15 : (lvl.obstacles || lvl.isGauntlet ? 8 : lvl.isMaze ? 4 : lvl.isWrap ? 10 : 3);
  for (let i = 0; i < initialCount; i++) spawnFood();

  isPlaying = true;
  foodSpawnTimer = 0;
  cameraAngle = Math.PI;
  shakeIntensity = 0;
  comboDisplayTimer = 0;
  comboEl.style.display = 'none';
  initAudio();
}

function gameOver() {
  snake.alive = false;
  isPlaying = false;
  playDeathSound();
  shakeIntensity = 0.6;

  for (const seg of snake.segments) {
    if (seg.material) seg.material.color.setHex(0xcc2222);
  }

  timerEl.style.display = 'none';
  warningEl.style.display = 'none';

  let newUnlock = false;
  let unlockMsg = '';

  if (score > highScores[currentLevel]) {
    highScores[currentLevel] = score;
    saveProgress();
  }

  for (let i = 1; i < NUM_LEVELS; i++) {
    if (!unlockedLevels[i]) {
      const req = LEVELS[i];
      if (req.unlockLevel === currentLevel && score >= req.unlockScore) {
        unlockedLevels[i] = true;
        newUnlock = true;
        unlockMsg = `${LEVELS[i].name} UNLOCKED!`;
        break;
      }
    }
  }

  loadProgress();

  finalScoreEl.textContent = score;
  finalHighscoreEl.textContent = (score > 0 && score >= highScores[currentLevel])
    ? 'NEW HIGH SCORE!' : `BEST: ${highScores[currentLevel]}`;

  if (newUnlock) {
    levelUnlockMsg.textContent = unlockMsg;
    levelUnlockMsg.style.display = 'block';
  } else {
    levelUnlockMsg.style.display = 'none';
  }

  setTimeout(() => { gameoverScreen.style.display = 'flex'; }, 600);
}

function updateGame(dt) {
  if (!isPlaying || !snake.alive) return;

  const lvl = LEVELS[currentLevel];

  handleInput(dt);
  updateBoost(dt);
  moveSnake(dt);
  updateFoodBulges(dt);
  updateTail();

  if (lvl.hasPortals) updatePortals(dt);
  if (lvl.isTron) updateTronTrail(dt);
  if (lvl.isGravity) applyGravityWell(dt);
  if (lvl.isLightsOut && headLight) {
    headLight.position.copy(snake.positions[0]);
    headLight.position.y = 2;
  }
  if (lvl.hasMinefield) updateMinefield(dt);
  if (lvl.hasAISnake) updateAISnake(dt);
  if (lvl.isReverse) updateReverse(dt);
  if (lvl.hasTsunami) updateTsunami(dt);
  if (lvl.isShrinking) updateShrinking(dt);
  if (lvl.isTimeAttack) updateTimeAttack(dt);
  if (lvl.isInfinity) updateInfinity(dt);

  checkCollisions();

  if (comboTimer > 0) {
    comboTimer -= dt;
    if (comboTimer <= 0) { comboCount = 0; comboTimer = 0; }
  }

  foodSpawnTimer += dt;
  if (foodSpawnTimer >= lvl.foodSpawnInterval && foods.length < lvl.maxFood) {
    foodSpawnTimer = 0;
    spawnFood();
  }

  updateFoods(dt);
  updateCamera(dt);
  updateBoostUI();

  if (lvl.isFlying) {
    const beacon = arenaGroup.children.find(c => c.geometry && c.geometry.type === 'OctahedronGeometry');
    if (beacon) { beacon.rotation.y += dt * 0.5; beacon.rotation.x += dt * 0.3; }
  }

  if (lvl.isGravity) {
    const core = arenaGroup.children.find(c => c.geometry && c.geometry.type === 'SphereGeometry');
    if (core) core.rotation.y += dt * 0.8;
  }
}

function applyGravityWell(dt) {
  if (snake.positions.length === 0) return;
  const headPos = snake.positions[0];
  const dist = Math.sqrt(headPos.x * headPos.x + headPos.z * headPos.z);
  if (dist > 0.5) {
    const strength = GRAVITY_WELL_STRENGTH * dt;
    headPos.x -= (headPos.x / dist) * strength;
    headPos.z -= (headPos.z / dist) * strength;
  }
}

// ── Shrinking ─────────────────────────────────────────────────────────
function updateShrinking(dt) {
  if (currentArenaSize <= SHRINK_MIN) return;
  currentArenaSize -= SHRINK_RATE * dt;
  if (currentArenaSize < SHRINK_MIN) currentArenaSize = SHRINK_MIN;

  // Move walls visually
  if (shrinkWalls.length === 4) {
    const s = currentArenaSize;
    const gs = s * 2;
    shrinkWalls[0].position.x = s;
    shrinkWalls[1].position.x = -s;
    shrinkWalls[2].position.z = s;
    shrinkWalls[3].position.z = -s;
    shrinkWalls[0].scale.z = gs / (LEVELS[currentLevel].arenaSize * 2);
    shrinkWalls[1].scale.z = gs / (LEVELS[currentLevel].arenaSize * 2);
    shrinkWalls[2].scale.x = gs / (LEVELS[currentLevel].arenaSize * 2);
    shrinkWalls[3].scale.x = gs / (LEVELS[currentLevel].arenaSize * 2);
  }
}

// ── Time Attack ───────────────────────────────────────────────────────
function updateTimeAttack(dt) {
  timeAttackTimer -= dt;
  const secs = Math.max(0, Math.ceil(timeAttackTimer));
  timerEl.textContent = secs;
  timerEl.style.color = secs <= 5 ? '#ff2222' : secs <= 10 ? '#ff6622' : '#ff4444';
  if (secs <= 5) timerEl.style.fontSize = '34px';
  else timerEl.style.fontSize = '28px';

  if (timeAttackTimer <= 0) {
    gameOver();
  }
}

// ── Reverse ───────────────────────────────────────────────────────────
function updateReverse(dt) {
  reverseTimer += dt;
  const cyclePos = reverseTimer % (REVERSE_CYCLE + REVERSE_DURATION);

  if (cyclePos < REVERSE_CYCLE) {
    isReversed = false;
    // Warning before reversal
    const timeToFlip = REVERSE_CYCLE - cyclePos;
    if (timeToFlip < REVERSE_WARN) {
      warningEl.textContent = 'CONTROLS FLIPPING';
      warningEl.style.color = '#cc33cc';
      warningEl.style.display = 'block';
      warningEl.style.opacity = String(Math.abs(Math.sin(cyclePos * 6)));
    } else {
      warningEl.style.display = 'none';
    }
  } else {
    if (!isReversed) {
      warningEl.textContent = 'REVERSED!';
      warningEl.style.color = '#cc33cc';
      warningEl.style.display = 'block';
      warningEl.style.opacity = '1';
    }
    isReversed = true;
  }
}

// ── Infinity Mode ─────────────────────────────────────────────────────
function updateInfinity(dt) {
  infinityPhaseTimer += dt;
  const newPhase = Math.floor(infinityPhaseTimer / INFINITY_PHASE_DURATION);

  if (newPhase > infinityPhase) {
    infinityPhase = newPhase;

    // Phase 2: Start spawning mines
    if (infinityPhase >= 1) {
      spawnInfinityMine();
    }

    // Phase 3+: Shrink arena
    if (infinityPhase >= 2 && infinityShrinkSize > SHRINK_MIN + 4) {
      infinityShrinkSize -= 2;
    }

    // Phase 4+: Increase speed
    if (infinityPhase >= 3) {
      speedRampMult = Math.min(3.0, speedRampMult + 0.15);
    }

    // Phase 5+: More fog (darken)
    if (infinityPhase >= 4) {
      const fogAmount = Math.min(0.015, 0.004 + infinityPhase * 0.001);
      scene.fog = new THREE.FogExp2(scene.background.getHex(), fogAmount);
    }
  }

  // Continuous mine spawning after phase 2
  if (infinityPhase >= 1) {
    mineSpawnTimer += dt;
    const interval = Math.max(3, MINE_SPAWN_INTERVAL - infinityPhase);
    if (mineSpawnTimer >= interval && infinityMines.length < 60) {
      mineSpawnTimer = 0;
      spawnInfinityMine();
    }
  }

  // Rotate infinity mines
  if (mineGroup) {
    for (const child of mineGroup.children) {
      child.rotation.y += dt * 0.5;
    }
  }
}

function spawnInfinityMine() {
  if (!mineGroup) return;
  const lvl = LEVELS[currentLevel];
  const geo = new THREE.SphereGeometry(0.4, 8, 6);
  const mat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.3, metalness: 0.8 });
  const mesh = new THREE.Mesh(geo, mat);

  const spikeGeo = new THREE.ConeGeometry(0.1, 0.3, 4);
  const spikeMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.4, metalness: 0.6 });
  for (let j = 0; j < 6; j++) {
    const spike = new THREE.Mesh(spikeGeo, spikeMat);
    const theta = (j / 6) * Math.PI * 2;
    spike.position.set(Math.cos(theta) * 0.4, 0, Math.sin(theta) * 0.4);
    spike.lookAt(spike.position.clone().multiplyScalar(2));
    mesh.add(spike);
  }

  const size = infinityShrinkSize - 2;
  let x, z, attempts = 0;
  do {
    x = (Math.random() * 2 - 1) * size;
    z = (Math.random() * 2 - 1) * size;
    attempts++;
  } while ((Math.abs(x) < 3 && Math.abs(z) < 3) && attempts < 50);

  mesh.position.set(x, 0.4, z);
  mesh.castShadow = true;
  mineGroup.add(mesh);
  infinityMines.push({ x, z, mesh });
}

function checkInfinityMineCollision(headPos) {
  for (const mine of infinityMines) {
    const dx = headPos.x - mine.x;
    const dz = headPos.z - mine.z;
    if (dx * dx + dz * dz < MINE_RADIUS * MINE_RADIUS) return true;
  }
  return false;
}

function handleInput(dt) {
  const lvl = LEVELS[currentLevel];
  const effectiveLeft = lvl.isReverse && isReversed ? turnRight : turnLeft;
  const effectiveRight = lvl.isReverse && isReversed ? turnLeft : turnRight;

  if (lvl.isFlying) {
    const turnQ = new THREE.Quaternion();
    const pitchQ = new THREE.Quaternion();
    const localUp = new THREE.Vector3(0, 1, 0).applyQuaternion(flightQuaternion);
    const localRight = new THREE.Vector3(1, 0, 0).applyQuaternion(flightQuaternion);

    if (effectiveLeft) { turnQ.setFromAxisAngle(localUp, TURN_SPEED * dt); flightQuaternion.premultiply(turnQ); }
    if (effectiveRight) { turnQ.setFromAxisAngle(localUp, -TURN_SPEED * dt); flightQuaternion.premultiply(turnQ); }
    if (moveUp) { pitchQ.setFromAxisAngle(localRight, TURN_SPEED * dt); flightQuaternion.premultiply(pitchQ); }
    if (moveDown) { pitchQ.setFromAxisAngle(localRight, -TURN_SPEED * dt); flightQuaternion.premultiply(pitchQ); }

    flightQuaternion.normalize();
    snake.direction.set(0, 0, -1).applyQuaternion(flightQuaternion);
    snake.targetRotation = Math.atan2(-snake.direction.x, -snake.direction.z);
    pitchAngle = Math.asin(Math.max(-1, Math.min(1, -snake.direction.y)));
  } else if (lvl.isIce) {
    // Ice: angular velocity based turning
    if (effectiveLeft) iceAngularVel += ICE_TURN_ACCEL * dt;
    if (effectiveRight) iceAngularVel -= ICE_TURN_ACCEL * dt;
    // Friction
    iceAngularVel *= Math.max(0, 1 - ICE_TURN_FRICTION * dt);
    // Clamp
    iceAngularVel = Math.max(-4, Math.min(4, iceAngularVel));
    snake.targetRotation += iceAngularVel * dt;

    snake.direction.set(
      Math.sin(snake.targetRotation), 0, Math.cos(snake.targetRotation)
    ).normalize();
  } else {
    if (effectiveLeft) snake.targetRotation += TURN_SPEED * dt;
    if (effectiveRight) snake.targetRotation -= TURN_SPEED * dt;

    snake.direction.set(
      Math.sin(snake.targetRotation), 0, Math.cos(snake.targetRotation)
    ).normalize();

    if (lvl.hasJump && wJustPressed && !isJumping) {
      isJumping = true;
      jumpVelocity = JUMP_FORCE;
      playSound('jump');
    }
    wJustPressed = false;
  }

  if (lvl.hasBoost && shiftHeld && boostGauge >= 1 && !isBoosting) {
    isBoosting = true;
    boostTimer = BOOST_DURATION;
    boostGauge = 0;
  }
}

function updateBoost(dt) {
  if (isBoosting) {
    boostTimer -= dt;
    if (boostTimer <= 0) { isBoosting = false; boostTimer = 0; }
  }
  if (isBoosting) {
    currentSpeedMult += (BOOST_SPEED_MULT - currentSpeedMult) * BOOST_ACCEL * dt;
  } else {
    currentSpeedMult += (1 - currentSpeedMult) * BOOST_DECEL * dt;
    if (Math.abs(currentSpeedMult - 1) < 0.01) currentSpeedMult = 1;
  }
  if (boostGauge < 1) {
    boostGauge += dt / BOOST_RECHARGE;
    if (boostGauge > 1) boostGauge = 1;
  }
}

function updateBoostUI() {
  if (!LEVELS[currentLevel].hasBoost) return;
  boostFill.style.width = `${boostGauge * 100}%`;
  boostFill.style.background = boostGauge >= 1 ? '#4a4' : '#888';
}

function moveSnake(dt) {
  if (snake.positions.length === 0) return;

  const lvl = LEVELS[currentLevel];
  const speed = lvl.moveSpeed * currentSpeedMult * speedRampMult;
  const headPos = snake.positions[0];
  headPos.addScaledVector(snake.direction, speed * dt);

  // Wrap mode
  if (lvl.isWrap) {
    const s = lvl.arenaSize;
    if (headPos.x > s) headPos.x = -s;
    if (headPos.x < -s) headPos.x = s;
    if (headPos.z > s) headPos.z = -s;
    if (headPos.z < -s) headPos.z = s;
  }

  if (!lvl.isFlying) {
    if (isJumping) {
      jumpVelocity -= GRAVITY * dt;
      headPos.y += jumpVelocity * dt;
      if (headPos.y <= 0.5 && jumpVelocity < 0) {
        headPos.y = 0.5;
        isJumping = false;
        jumpVelocity = 0;
        playSound('land');
      }
    } else {
      headPos.y = 0.5;
    }
  }

  snake.rotations[0] = snake.targetRotation;
  snake.segments[0].position.copy(headPos);

  if (lvl.isFlying) {
    snake.segments[0].quaternion.copy(flightQuaternion);
  } else {
    snake.segments[0].rotation.y = snake.targetRotation;
    if (isJumping) {
      snake.segments[0].rotation.x = Math.max(-0.5, Math.min(0.5, -jumpVelocity * 0.03));
    } else {
      snake.segments[0].rotation.x = 0;
    }
  }

  for (let i = 1; i < snake.segments.length; i++) {
    const leaderPos = snake.positions[i - 1];
    const currentPos = snake.positions[i];

    if (lvl.isFlying) {
      const dir = new THREE.Vector3().subVectors(leaderPos, currentPos);
      const dist = dir.length();
      if (dist > SEGMENT_SPACING) {
        dir.normalize().multiplyScalar(dist - SEGMENT_SPACING);
        currentPos.add(dir);
      }
    } else {
      const dir = new THREE.Vector3().subVectors(leaderPos, currentPos);
      dir.y = 0;
      const dist = dir.length();
      if (dist > SEGMENT_SPACING) {
        dir.normalize().multiplyScalar(dist - SEGMENT_SPACING);
        currentPos.add(dir);
      }
      if (lvl.hasJump || lvl.hasTsunami) {
        currentPos.y += (leaderPos.y - currentPos.y) * 8 * dt;
      } else {
        currentPos.y = 0.5;
      }
    }

    const dirToLeader = new THREE.Vector3().subVectors(leaderPos, currentPos);
    const flatDir = new THREE.Vector3(dirToLeader.x, 0, dirToLeader.z);
    if (flatDir.length() > 0.01) {
      snake.rotations[i] = Math.atan2(flatDir.x, flatDir.z);
    }

    snake.segments[i].position.copy(currentPos);
    snake.segments[i].rotation.y = snake.rotations[i];

    if (lvl.isFlying || lvl.hasJump || lvl.hasTsunami) {
      const hDiff = leaderPos.y - currentPos.y;
      const hDist = flatDir.length();
      if (hDist > 0.01) {
        snake.segments[i].rotation.x = Math.max(-0.6, Math.min(0.6, -Math.atan2(hDiff, hDist)));
      }
    }
  }
}

function updateFoodBulges(dt) {
  const toRemove = [];
  for (let i = 0; i < foodBulges.length; i++) {
    foodBulges[i] += BULGE_SPEED * dt;
    if (foodBulges[i] >= snake.segments.length) {
      toRemove.push(i);
      if (pendingSegments > 0) { addSegmentAtTail(); pendingSegments--; }
    }
  }
  for (let i = toRemove.length - 1; i >= 0; i--) foodBulges.splice(toRemove[i], 1);

  for (let i = 0; i < snake.segments.length; i++) {
    let bulgeAmount = 0;
    for (const bp of foodBulges) {
      const d = Math.abs(bp - i);
      if (d < 2) bulgeAmount = Math.max(bulgeAmount, Math.cos((d / 2) * Math.PI * 0.5));
    }
    if (i > 0) snake.segments[i].scale.setScalar(1 + (BULGE_SCALE - 1) * bulgeAmount);
  }
}

function addSegmentAtTail() {
  const lastPos = snake.positions[snake.positions.length - 1];
  const secondLast = snake.positions.length > 1 ? snake.positions[snake.positions.length - 2] : lastPos;
  const dir = new THREE.Vector3().subVectors(lastPos, secondLast).normalize();
  if (dir.length() < 0.01) dir.copy(snake.direction).negate();
  const newPos = lastPos.clone().addScaledVector(dir, -SEGMENT_SPACING);
  if (!LEVELS[currentLevel].isFlying) newPos.y = lastPos.y;

  const mesh = createSnakeSegment(false);
  mesh.position.copy(newPos);
  mesh.rotation.y = snake.rotations[snake.rotations.length - 1];
  snakeGroup.add(mesh);
  snake.segments.push(mesh);
  snake.positions.push(newPos);
  snake.rotations.push(snake.rotations[snake.rotations.length - 1]);
}

function updateTail() {
  if (!snake.tail || snake.positions.length < 2) return;
  const lastPos = snake.positions[snake.positions.length - 1];
  const secondLast = snake.positions[snake.positions.length - 2];
  const dir = new THREE.Vector3().subVectors(lastPos, secondLast).normalize();
  if (dir.length() < 0.01) dir.copy(snake.direction).negate();

  const tailPos = lastPos.clone().addScaledVector(dir, 0.6);
  if (!LEVELS[currentLevel].isFlying) tailPos.y = lastPos.y;
  snake.tail.position.copy(tailPos);

  const flatDir = new THREE.Vector3(dir.x, 0, dir.z);
  if (flatDir.length() > 0.01) snake.tail.rotation.y = Math.atan2(flatDir.x, flatDir.z);

  const hDiff = secondLast.y - lastPos.y;
  const hDist = flatDir.length();
  if (hDist > 0.01) {
    snake.tail.rotation.x = Math.max(-0.6, Math.min(0.6, Math.atan2(hDiff, hDist)));
  }
}

function checkCollisions() {
  const headPos = snake.positions[0];
  const lvl = LEVELS[currentLevel];

  // Boundary
  if (lvl.isFlying) {
    if (headPos.length() > lvl.arenaSize) { gameOver(); return; }
  } else if (lvl.isGravity) {
    const dist = Math.sqrt(headPos.x * headPos.x + headPos.z * headPos.z);
    if (dist > lvl.arenaSize) { gameOver(); return; }
  } else if (lvl.isWrap) {
    // No wall death
  } else if (lvl.isShrinking) {
    if (Math.abs(headPos.x) > currentArenaSize || Math.abs(headPos.z) > currentArenaSize) {
      gameOver(); return;
    }
  } else if (lvl.isInfinity) {
    if (Math.abs(headPos.x) > infinityShrinkSize || Math.abs(headPos.z) > infinityShrinkSize) {
      gameOver(); return;
    }
  } else {
    if (Math.abs(headPos.x) > lvl.arenaSize || Math.abs(headPos.z) > lvl.arenaSize) {
      gameOver(); return;
    }
  }

  // Obstacle collision
  if ((lvl.obstacles || lvl.isGauntlet) && !isJumping) {
    for (const ob of obstacles) {
      if (ob.isBar) {
        const dx = headPos.x - ob.x;
        const dz = headPos.z - ob.z;
        const cos = Math.cos(-ob.angle);
        const sin = Math.sin(-ob.angle);
        const lx = dx * cos - dz * sin;
        const lz = dx * sin + dz * cos;
        if (Math.abs(lx) < ob.width / 2 + 0.3 && Math.abs(lz) < 0.6) {
          gameOver(); return;
        }
      } else {
        const dx = headPos.x - ob.x;
        const dz = headPos.z - ob.z;
        if (Math.sqrt(dx * dx + dz * dz) < ob.radius) {
          gameOver(); return;
        }
      }
    }
  }

  // Maze wall collision
  if (lvl.isMaze) {
    const r = 0.4;
    for (const wall of mazeColliders) {
      if (headPos.x + r > wall.minX && headPos.x - r < wall.maxX &&
          headPos.z + r > wall.minZ && headPos.z - r < wall.maxZ) {
        gameOver(); return;
      }
    }
  }

  // Tron trail collision
  if (lvl.isTron && checkTronCollision(headPos)) {
    gameOver(); return;
  }

  // Mine collision
  if (lvl.hasMinefield && checkMineCollision(headPos)) {
    playMineSound();
    gameOver(); return;
  }

  // AI Snake collision
  if (lvl.hasAISnake && checkAISnakeCollision(headPos)) {
    gameOver(); return;
  }

  // Tsunami collision
  if (lvl.hasTsunami && checkTsunamiCollision(headPos)) {
    gameOver(); return;
  }

  // Infinity mine collision
  if (lvl.isInfinity && checkInfinityMineCollision(headPos)) {
    playMineSound();
    gameOver(); return;
  }

  // Self collision
  for (let i = 4; i < snake.positions.length; i++) {
    if (headPos.distanceTo(snake.positions[i]) < 0.6) { gameOver(); return; }
  }

  // Food collision
  for (let i = foods.length - 1; i >= 0; i--) {
    const dist = lvl.isFlying ? 2.0 : 1.3;
    if (headPos.distanceTo(foods[i].position) < dist) {
      eatFood(i);
      break;
    }
  }
}

function eatFood(index) {
  const lvl = LEVELS[currentLevel];
  const food = foods[index];
  foodGroup.remove(food);
  food.traverse(c => { if (c.geometry) c.geometry.dispose(); });
  foods.splice(index, 1);

  if (comboTimer > 0) {
    comboCount++;
  } else {
    comboCount = 1;
  }
  comboTimer = COMBO_WINDOW;
  const multiplier = Math.min(comboCount, 5);
  score += 10 * multiplier;

  if (comboCount >= 2) showCombo(multiplier);

  updateScoreDisplay();

  foodEaten++;
  speedRampMult = Math.min(SPEED_RAMP_MAX, 1 + foodEaten * SPEED_RAMP_PER_FOOD);

  foodBulges.push(0);
  pendingSegments++;
  playSound('eat');

  if (boostGauge < 1) boostGauge = 1;
  if (foods.length === 0) spawnFood();

  // Time Attack: add time
  if (lvl.isTimeAttack) {
    timeAttackTimer += TIME_ATTACK_PER_FOOD;
  }
}

// ── Camera ─────────────────────────────────────────────────────────────
let cameraAngle = Math.PI;
const CAM_SMOOTH = 2.5;
const CAM_TURN_THRESH = 0.35;

function updateCamera(dt) {
  if (snake.positions.length === 0) return;
  const headPos = snake.positions[0];
  const lvl = LEVELS[currentLevel];

  if (lvl.isFlying) {
    const behind = new THREE.Vector3(0, 0, 1).applyQuaternion(flightQuaternion);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(flightQuaternion);
    const camTarget = headPos.clone().addScaledVector(behind, 12).addScaledVector(up, 4);
    camera.position.lerp(camTarget, 4 * dt);
    const lookTarget = headPos.clone().addScaledVector(snake.direction, 5);
    camera.lookAt(lookTarget);
  } else {
    const snakeAngle = snake.targetRotation;
    let angleDiff = snakeAngle - cameraAngle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    if (Math.abs(angleDiff) > CAM_TURN_THRESH) cameraAngle += angleDiff * CAM_SMOOTH * dt;

    const camDist = lvl.camDist;
    const camHeight = lvl.camHeight;

    const forward = new THREE.Vector3(Math.sin(cameraAngle), 0, Math.cos(cameraAngle));
    const camPos = headPos.clone().addScaledVector(forward, -camDist);
    camPos.y = camHeight;
    camera.position.lerp(camPos, 5 * dt);

    const lookTarget = headPos.clone().addScaledVector(forward, 3);
    lookTarget.y = 0.3;
    camera.lookAt(lookTarget);
  }
}

// ── Input ──────────────────────────────────────────────────────────────
function onKeyDown(e) {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') turnLeft = true;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') turnRight = true;
  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
    if (!wHeld) wJustPressed = true;
    wHeld = true;
    moveUp = true;
  }
  if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') moveDown = true;
  if (e.key === 'Shift') shiftHeld = true;

  if (!isPlaying && startScreen.style.display !== 'none') {
    if (e.key === ' ' || e.key === 'Enter') showLevelSelect();
  }
}

function onKeyUp(e) {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') turnLeft = false;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') turnRight = false;
  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { wHeld = false; moveUp = false; }
  if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') moveDown = false;
  if (e.key === 'Shift') shiftHeld = false;
}

function onTouchStart(e) {
  e.preventDefault();
  if (e.touches.length > 0) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchActive = true;
  }
}

function onTouchMove(e) {
  e.preventDefault();
  if (!touchActive || e.touches.length === 0) return;
  const dx = e.touches[0].clientX - touchStartX;
  const dy = e.touches[0].clientY - touchStartY;
  const threshold = 15;
  turnLeft = dx < -threshold;
  turnRight = dx > threshold;
  moveUp = dy < -threshold;
  moveDown = dy > threshold;
}

function onTouchEnd(e) {
  e.preventDefault();
  touchActive = false;
  turnLeft = false;
  turnRight = false;
  moveUp = false;
  moveDown = false;
}

function onResize() {
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

// ── UI ─────────────────────────────────────────────────────────────────
function updateScoreDisplay() {
  scoreEl.textContent = score;
}

function showCombo(mult) {
  comboEl.textContent = `x${mult}`;
  const colors = ['#ff6600', '#ff6600', '#ee4400', '#dd2200', '#cc0000'];
  comboEl.style.color = colors[Math.min(mult - 1, 4)];
  comboEl.style.display = 'block';
  comboEl.style.opacity = '1';
  comboEl.style.fontSize = `${28 + mult * 4}px`;
  comboDisplayTimer = 1.0;
}

// ── Main Loop ──────────────────────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  updateGame(dt);

  if (comboDisplayTimer > 0) {
    comboDisplayTimer -= dt;
    comboEl.style.opacity = String(Math.max(0, comboDisplayTimer));
    if (comboDisplayTimer <= 0) comboEl.style.display = 'none';
  }

  if (shakeIntensity > 0) {
    camera.position.x += (Math.random() - 0.5) * shakeIntensity;
    camera.position.y += (Math.random() - 0.5) * shakeIntensity * 0.5;
    shakeIntensity *= 0.88;
    if (shakeIntensity < 0.01) shakeIntensity = 0;
  }

  if (!isPlaying) {
    const t = clock.elapsedTime * 0.2;
    camera.position.set(Math.sin(t) * 30, 20, Math.cos(t) * 30);
    camera.lookAt(0, 0, 0);
  }

  renderer.render(scene, camera);
}

// ── Start ──────────────────────────────────────────────────────────────
init();
