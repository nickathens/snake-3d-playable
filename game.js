import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// ── Level Configuration ─────────────────────────────────────────────────
const LEVELS = [
  {
    name: 'CLASSIC',
    arenaSize: 20,
    moveSpeed: 8,
    maxFood: 5,
    foodSpawnInterval: 2.5,
    unlockScore: 0,
    hasBoost: false,
    hasJump: false,
    isFlying: false,
    obstacles: false,
    fogDensity: 0.008,
    gridColor: 0x003300,
    accentColor: 0x00ff44,
    wallColor: 0x004400,
    floorColor: 0x000800,
  },
  {
    name: 'SKATEPARK',
    arenaSize: 30,
    moveSpeed: 9,
    maxFood: 10,
    foodSpawnInterval: 1.5,
    unlockScore: 100,
    hasBoost: true,
    hasJump: true,
    isFlying: false,
    obstacles: true,
    fogDensity: 0.006,
    gridColor: 0x330033,
    accentColor: 0xff00ff,
    wallColor: 0x440044,
    floorColor: 0x080008,
  },
  {
    name: 'SPACE FLIGHT',
    arenaSize: 60,
    moveSpeed: 10,
    maxFood: 20,
    foodSpawnInterval: 0.8,
    unlockScore: 200,
    hasBoost: true,
    hasJump: false,
    isFlying: true,
    obstacles: false,
    fogDensity: 0.003,
    gridColor: 0x000033,
    accentColor: 0x00aaff,
    wallColor: 0x000044,
    floorColor: 0x000008,
  },
];

// ── Constants ──────────────────────────────────────────────────────────
const TURN_SPEED = 3;
const SEGMENT_SPACING = 0.8;
const INITIAL_SEGMENTS = 3;
const SNAKE_COLOR = 0x00ff44;
const SNAKE_HEAD_COLOR = 0x44ffaa;
const FOOD_COLORS = [0xff0044, 0xff8800, 0xffff00, 0x00ffff, 0xff00ff];

// Boost constants
const BOOST_DURATION = 1.2;
const BOOST_SPEED_MULT = 2.2;
const BOOST_RECHARGE = 3.5;
const BOOST_ACCEL = 8;
const BOOST_DECEL = 2;

// Jump constants
const JUMP_FORCE = 12;
const GRAVITY = 25;

// Food bulge
const BULGE_SPEED = 8;
const BULGE_SCALE = 1.5;

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

  const eatFiles = ['eat_1','eat_2','eat_3','eat_4','eat_5','eat_6'];
  const jumpFiles = ['jump_1','jump_2'];
  const landFiles = ['land_1','land_2','land_3','land_4'];

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
  // Avoid same sound twice
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
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(300, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.5);
  gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.5);
}

// ── State ──────────────────────────────────────────────────────────────
let scene, camera, renderer, composer, bloomPass;
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
let highScores = [0, 0, 0];
let unlockedLevels = [true, false, false];

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

// Flight state (level 3)
let flightBasis = new THREE.Matrix4().identity();
let flightQuaternion = new THREE.Quaternion();
let pitchAngle = 0;

// Obstacles (level 2)
let obstacles = [];

// Input
let turnLeft = false, turnRight = false;
let moveUp = false, moveDown = false;
let shiftHeld = false;
let wJustPressed = false, wHeld = false;
let touchStartX = 0, touchStartY = 0, touchActive = false;

// UI
const scoreEl = document.getElementById('score');
const highscoreEl = document.getElementById('highscore');
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

// ── Initialization ─────────────────────────────────────────────────────
function init() {
  clock = new THREE.Clock();
  loadProgress();

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 500);

  const canvas = document.getElementById('game');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.8, 0.4, 0.2
  );
  composer.addPass(bloomPass);

  // Lights
  scene.add(new THREE.AmbientLight(0x111111));
  const dirLight = new THREE.DirectionalLight(0x224422, 0.5);
  dirLight.position.set(10, 20, 10);
  scene.add(dirLight);

  // Groups
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

  createTrail();

  // Events
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

  for (let i = 0; i < 3; i++) {
    document.getElementById(`level-${i+1}-btn`).addEventListener('click', () => {
      if (unlockedLevels[i]) startGame(i);
    });
  }

  camera.position.set(0, 25, 25);
  camera.lookAt(0, 0, 0);

  animate();
}

// ── Save/Load ──────────────────────────────────────────────────────────
function loadProgress() {
  for (let i = 0; i < 3; i++) {
    highScores[i] = parseInt(localStorage.getItem(`snake3d_hs_${i}`) || '0', 10);
  }
  // Check unlocks based on high scores
  unlockedLevels[0] = true;
  unlockedLevels[1] = highScores[0] >= LEVELS[1].unlockScore;
  unlockedLevels[2] = highScores[1] >= LEVELS[2].unlockScore;
}

function saveProgress() {
  for (let i = 0; i < 3; i++) {
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
  for (let i = 0; i < 3; i++) {
    const btn = document.getElementById(`level-${i+1}-btn`);
    const scoreSpan = document.getElementById(`level-${i+1}-score`);

    if (unlockedLevels[i]) {
      btn.disabled = false;
      const nameSpan = btn.querySelector('.level-name');
      nameSpan.innerHTML = LEVELS[i].name;
      scoreSpan.textContent = highScores[i] > 0 ? `BEST: ${highScores[i]}` : '';
    } else {
      btn.disabled = true;
      const nameSpan = btn.querySelector('.level-name');
      nameSpan.innerHTML = `<span class="lock-icon">&#x25A0;</span>${LEVELS[i].name}`;
      scoreSpan.textContent = `UNLOCK: ${LEVELS[i].unlockScore} PTS`;
    }
  }
}

// ── Arena Building ────────────────────────────────────────────────────
function clearArena() {
  while (arenaGroup.children.length) {
    const c = arenaGroup.children[0];
    arenaGroup.remove(c);
    c.traverse(ch => { if (ch.geometry) ch.geometry.dispose(); if (ch.material) ch.material.dispose(); });
  }
  while (obstacleGroup.children.length) {
    const c = obstacleGroup.children[0];
    obstacleGroup.remove(c);
    c.traverse(ch => { if (ch.geometry) ch.geometry.dispose(); if (ch.material) ch.material.dispose(); });
  }
  while (starGroup.children.length) {
    const c = starGroup.children[0];
    starGroup.remove(c);
    c.traverse(ch => { if (ch.geometry) ch.geometry.dispose(); if (ch.material) ch.material.dispose(); });
  }
  obstacles = [];
}

function buildArena(levelIdx) {
  clearArena();
  const lvl = LEVELS[levelIdx];
  scene.fog = new THREE.FogExp2(0x000000, lvl.fogDensity);

  if (lvl.isFlying) {
    buildSpaceArena(lvl);
  } else {
    buildGroundArena(lvl);
    if (lvl.obstacles) buildObstacles(lvl);
  }
}

function buildGroundArena(lvl) {
  const gridSize = lvl.arenaSize * 2;
  const divisions = Math.min(60, Math.floor(gridSize / 1));

  const grid = new THREE.GridHelper(gridSize, divisions, lvl.gridColor, lvl.gridColor);
  grid.material.opacity = 0.5;
  grid.material.transparent = true;
  arenaGroup.add(grid);

  const floorGeo = new THREE.PlaneGeometry(gridSize, gridSize);
  const floorMat = new THREE.MeshStandardMaterial({ color: lvl.floorColor, roughness: 0.9, metalness: 0.1 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.01;
  arenaGroup.add(floor);

  // Walls
  const wallMat = new THREE.MeshBasicMaterial({ color: lvl.wallColor, wireframe: true, transparent: true, opacity: 0.4 });
  const wallHeight = 2;
  const wt = 0.2;
  const walls = [
    { s: [wt, wallHeight, gridSize], p: [lvl.arenaSize, wallHeight / 2, 0] },
    { s: [wt, wallHeight, gridSize], p: [-lvl.arenaSize, wallHeight / 2, 0] },
    { s: [gridSize, wallHeight, wt], p: [0, wallHeight / 2, lvl.arenaSize] },
    { s: [gridSize, wallHeight, wt], p: [0, wallHeight / 2, -lvl.arenaSize] },
  ];
  for (const w of walls) {
    const geo = new THREE.BoxGeometry(...w.s);
    const mesh = new THREE.Mesh(geo, wallMat);
    mesh.position.set(...w.p);
    arenaGroup.add(mesh);
  }

  // Corner posts
  const postMat = new THREE.MeshBasicMaterial({ color: lvl.accentColor });
  const postGeo = new THREE.CylinderGeometry(0.15, 0.15, wallHeight + 1, 6);
  for (const cx of [-1, 1]) {
    for (const cz of [-1, 1]) {
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(cx * lvl.arenaSize, (wallHeight + 1) / 2, cz * lvl.arenaSize);
      arenaGroup.add(post);
    }
  }
}

function buildObstacles(lvl) {
  const obstacleMat = new THREE.MeshStandardMaterial({
    color: lvl.accentColor, emissive: lvl.accentColor, emissiveIntensity: 0.5,
    roughness: 0.3, metalness: 0.7, transparent: true, opacity: 0.7,
  });

  // Scatter pillars
  const pillarCount = 12;
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
      tooClose = Math.abs(x) < 5 && Math.abs(z) < 5; // Keep center clear
      for (const ob of obstacles) {
        if (new THREE.Vector2(x - ob.x, z - ob.z).length() < 4) tooClose = true;
      }
      attempts++;
    } while (tooClose && attempts < 50);

    mesh.position.set(x, height / 2, z);
    obstacleGroup.add(mesh);
    obstacles.push({ x, z, radius: radius + 0.5, height, mesh });

    // Glow ring at base
    const ringGeo = new THREE.RingGeometry(radius + 0.1, radius + 0.4, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: lvl.accentColor, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, 0.02, z);
    obstacleGroup.add(ring);
  }

  // Floating horizontal bars
  const barCount = 6;
  for (let i = 0; i < barCount; i++) {
    const width = 3 + Math.random() * 5;
    const geo = new THREE.BoxGeometry(width, 0.3, 0.3);
    const mesh = new THREE.Mesh(geo, obstacleMat);

    const x = (Math.random() * 2 - 1) * (lvl.arenaSize - 5);
    const z = (Math.random() * 2 - 1) * (lvl.arenaSize - 5);
    const y = 0.5; // At snake height
    const angle = Math.random() * Math.PI;

    mesh.position.set(x, y, z);
    mesh.rotation.y = angle;
    obstacleGroup.add(mesh);

    // Store as obstacle for collision (approximate with center point + radius)
    obstacles.push({ x, z, radius: width / 2, height: 0.3, mesh, isBar: true, angle, width });
  }
}

function buildSpaceArena(lvl) {
  // Starfield
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
  const stars = new THREE.Points(starGeo, starMat);
  starGroup.add(stars);

  // Spherical boundary wireframe
  const boundGeo = new THREE.SphereGeometry(lvl.arenaSize, 24, 16);
  const boundMat = new THREE.MeshBasicMaterial({
    color: lvl.accentColor, wireframe: true, transparent: true, opacity: 0.08,
  });
  const bound = new THREE.Mesh(boundGeo, boundMat);
  arenaGroup.add(bound);

  // Central beacon
  const beaconGeo = new THREE.OctahedronGeometry(1.5, 0);
  const beaconMat = new THREE.MeshStandardMaterial({
    color: lvl.accentColor, emissive: lvl.accentColor, emissiveIntensity: 1,
  });
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  arenaGroup.add(beacon);
  const beaconLight = new THREE.PointLight(lvl.accentColor, 2, 30);
  arenaGroup.add(beaconLight);
}

// ── Snake ──────────────────────────────────────────────────────────────
function createSnakeSegment(isHead) {
  const lvl = LEVELS[currentLevel];
  const snakeColor = lvl.isFlying ? lvl.accentColor : SNAKE_COLOR;
  const headColor = lvl.isFlying ? 0xaaddff : SNAKE_HEAD_COLOR;

  const size = isHead ? 0.55 : 0.4;
  const geo = isHead ? new THREE.SphereGeometry(size, 12, 8) : new THREE.SphereGeometry(size, 8, 6);
  const mat = new THREE.MeshStandardMaterial({
    color: isHead ? headColor : snakeColor,
    emissive: isHead ? headColor : snakeColor,
    emissiveIntensity: isHead ? 0.6 : 0.4,
    roughness: 0.3, metalness: 0.7,
  });
  const mesh = new THREE.Mesh(geo, mat);

  if (isHead) {
    const eyeGeo = new THREE.SphereGeometry(0.1, 6, 4);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilGeo = new THREE.SphereGeometry(0.06, 6, 4);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
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
  const snakeColor = lvl.isFlying ? lvl.accentColor : SNAKE_COLOR;
  const geo = new THREE.ConeGeometry(0.3, 1.0, 6);
  const mat = new THREE.MeshStandardMaterial({
    color: snakeColor, emissive: snakeColor, emissiveIntensity: 0.4,
    roughness: 0.3, metalness: 0.7,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = Math.PI / 2;
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

  // Reset boost
  boostGauge = 1;
  isBoosting = false;
  boostTimer = 0;
  currentSpeedMult = 1;

  // Reset jump
  isJumping = false;
  jumpVelocity = 0;

  // Reset flight
  flightQuaternion.identity();
  flightQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
  pitchAngle = 0;

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

  const geo = new THREE.OctahedronGeometry(0.4, 1);
  const mat = new THREE.MeshStandardMaterial({
    color, emissive: color, emissiveIntensity: 0.8,
    roughness: 0.2, metalness: 0.8,
  });
  group.add(new THREE.Mesh(geo, mat));
  group.add(new THREE.PointLight(color, 0.5, 4));

  let pos, attempts = 0;
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
  } else {
    do {
      const x = (Math.random() * 2 - 1) * (lvl.arenaSize - 1.5);
      const z = (Math.random() * 2 - 1) * (lvl.arenaSize - 1.5);
      pos = new THREE.Vector3(x, 0.5, z);
      attempts++;
    } while ((isOnSnake(pos, 2) || isInObstacle(pos)) && attempts < 50);
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

function updateFoods(dt) {
  for (const food of foods) {
    food.userData.time += dt;
    food.position.y = food.userData.baseY + Math.sin(food.userData.time * 3) * 0.25;
    food.children[0].rotation.y += dt * 2;
    food.children[0].rotation.x += dt * 0.5;
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

  // Level indicator
  levelIndicator.textContent = `LEVEL ${levelIdx + 1}: ${lvl.name}`;
  levelIndicator.style.display = 'block';
  levelIndicator.style.color = `#${lvl.accentColor.toString(16).padStart(6, '0')}`;

  // Boost UI
  const showBoost = lvl.hasBoost;
  boostBar.style.display = showBoost ? 'block' : 'none';
  boostLabel.style.display = showBoost ? 'block' : 'none';

  // Controls hint
  if (lvl.isFlying) {
    controlsHint.textContent = 'ARROWS: STEER / W/S: PITCH / SHIFT: BOOST';
  } else if (lvl.hasJump) {
    controlsHint.textContent = 'ARROWS: STEER / W: JUMP / SHIFT: BOOST';
  } else {
    controlsHint.textContent = 'ARROWS / SWIPE';
  }

  // Update trail color
  if (trailParticles) {
    trailParticles.material.color.setHex(lvl.isFlying ? lvl.accentColor : SNAKE_COLOR);
  }

  buildArena(levelIdx);
  resetSnake();

  // Clear food
  while (foodGroup.children.length) {
    const child = foodGroup.children[0];
    foodGroup.remove(child);
    child.traverse(c => { if (c.geometry) c.geometry.dispose(); });
  }
  foods = [];

  // Spawn initial food
  const initialCount = lvl.isFlying ? 15 : (lvl.obstacles ? 8 : 3);
  for (let i = 0; i < initialCount; i++) spawnFood();

  isPlaying = true;
  foodSpawnTimer = 0;
  cameraAngle = Math.PI;
  initAudio();
}

function gameOver() {
  snake.alive = false;
  isPlaying = false;
  playDeathSound();

  // Flash snake red
  for (const seg of snake.segments) {
    if (seg.material) {
      seg.material.emissive.setHex(0xff0000);
      seg.material.color.setHex(0xff0000);
    }
  }

  let newUnlock = false;
  let unlockMsg = '';

  if (score > highScores[currentLevel]) {
    highScores[currentLevel] = score;
    saveProgress();
  }

  // Check for new level unlocks
  if (currentLevel === 0 && score >= LEVELS[1].unlockScore && !unlockedLevels[1]) {
    unlockedLevels[1] = true;
    newUnlock = true;
    unlockMsg = 'SKATEPARK UNLOCKED!';
  }
  if (currentLevel === 1 && score >= LEVELS[2].unlockScore && !unlockedLevels[2]) {
    unlockedLevels[2] = true;
    newUnlock = true;
    unlockMsg = 'SPACE FLIGHT UNLOCKED!';
  }

  loadProgress(); // Refresh unlock state

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
  checkCollisions();

  // Food spawning
  foodSpawnTimer += dt;
  if (foodSpawnTimer >= lvl.foodSpawnInterval && foods.length < lvl.maxFood) {
    foodSpawnTimer = 0;
    spawnFood();
  }

  updateFoods(dt);
  updateCamera(dt);
  updateBoostUI();

  // Rotate space beacon
  if (lvl.isFlying) {
    const beacon = arenaGroup.children.find(c => c.geometry && c.geometry.type === 'OctahedronGeometry');
    if (beacon) {
      beacon.rotation.y += dt * 0.5;
      beacon.rotation.x += dt * 0.3;
    }
  }
}

function handleInput(dt) {
  const lvl = LEVELS[currentLevel];

  if (lvl.isFlying) {
    // 3D flight controls using quaternion
    const turnQ = new THREE.Quaternion();
    const pitchQ = new THREE.Quaternion();

    // Get local axes from current orientation
    const localUp = new THREE.Vector3(0, 1, 0).applyQuaternion(flightQuaternion);
    const localRight = new THREE.Vector3(1, 0, 0).applyQuaternion(flightQuaternion);

    if (turnLeft) {
      turnQ.setFromAxisAngle(localUp, TURN_SPEED * dt);
      flightQuaternion.premultiply(turnQ);
    }
    if (turnRight) {
      turnQ.setFromAxisAngle(localUp, -TURN_SPEED * dt);
      flightQuaternion.premultiply(turnQ);
    }
    if (moveUp) {
      pitchQ.setFromAxisAngle(localRight, TURN_SPEED * dt);
      flightQuaternion.premultiply(pitchQ);
    }
    if (moveDown) {
      pitchQ.setFromAxisAngle(localRight, -TURN_SPEED * dt);
      flightQuaternion.premultiply(pitchQ);
    }

    flightQuaternion.normalize();

    // Forward direction is negative Z in local space
    snake.direction.set(0, 0, -1).applyQuaternion(flightQuaternion);

    // Extract yaw for camera
    snake.targetRotation = Math.atan2(-snake.direction.x, -snake.direction.z);
    pitchAngle = Math.asin(Math.max(-1, Math.min(1, -snake.direction.y)));
  } else {
    // Ground controls
    if (turnLeft) snake.targetRotation += TURN_SPEED * dt;
    if (turnRight) snake.targetRotation -= TURN_SPEED * dt;

    snake.direction.set(
      Math.sin(snake.targetRotation), 0, Math.cos(snake.targetRotation)
    ).normalize();

    // Jump (level 2 only)
    if (lvl.hasJump && wJustPressed && !isJumping) {
      isJumping = true;
      jumpVelocity = JUMP_FORCE;
      playSound('jump');
    }
    wJustPressed = false;
  }

  // Boost activation
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
  boostFill.style.background = boostGauge >= 1 ? '#0f0' : '#0aa';
}

function moveSnake(dt) {
  if (snake.positions.length === 0) return;

  const lvl = LEVELS[currentLevel];
  const speed = lvl.moveSpeed * currentSpeedMult;
  const headPos = snake.positions[0];
  headPos.addScaledVector(snake.direction, speed * dt);

  if (lvl.isFlying) {
    // Clamp to spherical bounds (handled in collision)
  } else {
    // Jump physics
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

  // Body follows
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
      // Follow head Y with smoothing for jump
      if (lvl.hasJump) {
        const targetY = leaderPos.y;
        currentPos.y += (targetY - currentPos.y) * 8 * dt;
      } else {
        currentPos.y = 0.5;
      }
    }

    // Update rotation
    const dirToLeader = new THREE.Vector3().subVectors(leaderPos, currentPos);
    const flatDir = new THREE.Vector3(dirToLeader.x, 0, dirToLeader.z);
    if (flatDir.length() > 0.01) {
      snake.rotations[i] = Math.atan2(flatDir.x, flatDir.z);
    }

    snake.segments[i].position.copy(currentPos);
    snake.segments[i].rotation.y = snake.rotations[i];

    // Tilt body based on height difference
    if (lvl.isFlying || lvl.hasJump) {
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

  // Tilt
  const hDiff = secondLast.y - lastPos.y;
  const hDist = flatDir.length();
  if (hDist > 0.01) {
    snake.tail.rotation.x = Math.max(-0.6, Math.min(0.6, Math.atan2(hDiff, hDist)));
  }
}

function checkCollisions() {
  const headPos = snake.positions[0];
  const lvl = LEVELS[currentLevel];

  if (lvl.isFlying) {
    // Spherical boundary
    if (headPos.length() > lvl.arenaSize) { gameOver(); return; }
  } else {
    // Rectangle boundary
    if (Math.abs(headPos.x) > lvl.arenaSize || Math.abs(headPos.z) > lvl.arenaSize) {
      gameOver(); return;
    }
  }

  // Obstacle collision (level 2)
  if (lvl.obstacles && !isJumping) {
    for (const ob of obstacles) {
      if (ob.isBar) {
        // Simple distance check for bars
        const dx = headPos.x - ob.x;
        const dz = headPos.z - ob.z;
        // Rotate point into bar's local space
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
  const food = foods[index];
  foodGroup.remove(food);
  food.traverse(c => { if (c.geometry) c.geometry.dispose(); });
  foods.splice(index, 1);

  score += 10;
  updateScoreDisplay();

  foodBulges.push(0);
  pendingSegments++;
  playSound('eat');

  // Eating refills boost
  if (boostGauge < 1) boostGauge = 1;

  if (foods.length === 0) spawnFood();
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
    // Camera behind snake in flight direction
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

    const camDist = lvl.obstacles ? 14 : 12;
    const camHeight = lvl.obstacles ? 8 : 6;

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
  composer.setSize(w, h);
}

// ── UI ─────────────────────────────────────────────────────────────────
function updateScoreDisplay() {
  scoreEl.textContent = score;
}

function updateHighScoreDisplay() {
  const hs = highScores[currentLevel];
  highscoreEl.textContent = hs > 0 ? `BEST: ${hs}` : '';
}

// ── Trail ──────────────────────────────────────────────────────────────
let trailParticles;
const TRAIL_COUNT = 120;
let trailIndex = 0, trailTimer = 0;

function createTrail() {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(TRAIL_COUNT * 3);
  for (let i = 0; i < TRAIL_COUNT; i++) {
    positions[i * 3 + 1] = -10;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: SNAKE_COLOR, size: 0.2, transparent: true, opacity: 0.6,
    sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false,
  });

  trailParticles = new THREE.Points(geo, mat);
  scene.add(trailParticles);
}

function updateTrail(dt) {
  if (!trailParticles || !isPlaying || !snake.alive) return;
  trailTimer += dt;
  if (trailTimer < 0.03) return;
  trailTimer = 0;

  const positions = trailParticles.geometry.attributes.position.array;
  if (snake.positions.length > 0) {
    const tailPos = snake.positions[snake.positions.length - 1];
    const idx = trailIndex * 3;
    positions[idx] = tailPos.x + (Math.random() - 0.5) * 0.3;
    positions[idx + 1] = LEVELS[currentLevel].isFlying ? tailPos.y : 0.15;
    positions[idx + 2] = tailPos.z + (Math.random() - 0.5) * 0.3;
    trailIndex = (trailIndex + 1) % TRAIL_COUNT;
  }
  trailParticles.geometry.attributes.position.needsUpdate = true;
}

// ── Main Loop ──────────────────────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  updateGame(dt);
  updateTrail(dt);

  if (!isPlaying) {
    const t = clock.elapsedTime * 0.2;
    camera.position.set(Math.sin(t) * 30, 20, Math.cos(t) * 30);
    camera.lookAt(0, 0, 0);
  }

  composer.render();
}

// ── Start ──────────────────────────────────────────────────────────────
init();
