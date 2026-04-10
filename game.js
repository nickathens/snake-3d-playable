import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// ── Audio ──────────────────────────────────────────────────────────────
let audioCtx = null;

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playEatSound() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.08);
  osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.2);
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

// ── Constants ──────────────────────────────────────────────────────────
const ARENA_SIZE = 20;
const MOVE_SPEED = 8;
const TURN_SPEED = 3;
const SEGMENT_SPACING = 0.8;
const INITIAL_SEGMENTS = 3;
const MAX_FOOD = 5;
const FOOD_SPAWN_INTERVAL = 2.5;
const GRID_COLOR = 0x003300;
const SNAKE_COLOR = 0x00ff44;
const SNAKE_HEAD_COLOR = 0x44ffaa;
const FOOD_COLORS = [0xff0044, 0xff8800, 0xffff00, 0x00ffff, 0xff00ff];
const WALL_COLOR = 0x004400;

// ── State ──────────────────────────────────────────────────────────────
let scene, camera, renderer, composer;
let snake = { segments: [], positions: [], rotations: [], direction: new THREE.Vector3(0, 0, 1), targetRotation: Math.PI, alive: false };
let foods = [];
let foodGroup, snakeGroup, arenaGroup;
let score = 0;
let highScore = 0;
let isPlaying = false;
let foodSpawnTimer = 0;
let clock;

// Food bulge animation
let foodBulges = [];
let pendingSegments = 0;
const BULGE_SPEED = 8;
const BULGE_SCALE = 1.5;

// UI elements
const scoreEl = document.getElementById('score');
const highscoreEl = document.getElementById('highscore');
const startScreen = document.getElementById('start-screen');
const gameoverScreen = document.getElementById('gameover-screen');
const finalScoreEl = document.getElementById('final-score');
const finalHighscoreEl = document.getElementById('final-highscore');
const playBtn = document.getElementById('play-btn');
const restartBtn = document.getElementById('restart-btn');

// Input state
let turnLeft = false;
let turnRight = false;

// Touch state
let touchStartX = 0;
let touchStartY = 0;
let touchActive = false;

// ── Initialization ─────────────────────────────────────────────────────
function init() {
  clock = new THREE.Clock();
  highScore = parseInt(localStorage.getItem('snake3d_highscore') || '0', 10);
  updateHighScoreDisplay();

  // Scene
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.008);

  // Camera
  camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 200);

  // Renderer
  const canvas = document.getElementById('game');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // Post-processing (bloom)
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.8, 0.4, 0.2
  );
  composer.addPass(bloom);

  // Lights
  const ambient = new THREE.AmbientLight(0x111111);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0x224422, 0.5);
  dirLight.position.set(10, 20, 10);
  scene.add(dirLight);

  // Groups
  arenaGroup = new THREE.Group();
  snakeGroup = new THREE.Group();
  foodGroup = new THREE.Group();
  scene.add(arenaGroup);
  scene.add(snakeGroup);
  scene.add(foodGroup);

  buildArena();
  createTrail();

  // Events
  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('touchstart', onTouchStart, { passive: false });
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  canvas.addEventListener('touchend', onTouchEnd, { passive: false });
  playBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', startGame);

  // Position camera for start screen
  camera.position.set(0, 25, 25);
  camera.lookAt(0, 0, 0);

  animate();
}

// ── Arena ──────────────────────────────────────────────────────────────
function buildArena() {
  // Grid floor
  const gridSize = ARENA_SIZE * 2;
  const divisions = 40;
  const grid = new THREE.GridHelper(gridSize, divisions, GRID_COLOR, GRID_COLOR);
  grid.material.opacity = 0.5;
  grid.material.transparent = true;
  arenaGroup.add(grid);

  // Floor plane (very dark, subtle)
  const floorGeo = new THREE.PlaneGeometry(gridSize, gridSize);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x000800, roughness: 0.9, metalness: 0.1
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.01;
  arenaGroup.add(floor);

  // Boundary walls (glowing wireframe boxes)
  const wallMat = new THREE.MeshBasicMaterial({
    color: WALL_COLOR, wireframe: true, transparent: true, opacity: 0.4
  });
  const wallHeight = 2;
  const wallThickness = 0.2;
  const wallPositions = [
    { s: [wallThickness, wallHeight, gridSize], p: [ARENA_SIZE, wallHeight / 2, 0] },
    { s: [wallThickness, wallHeight, gridSize], p: [-ARENA_SIZE, wallHeight / 2, 0] },
    { s: [gridSize, wallHeight, wallThickness], p: [0, wallHeight / 2, ARENA_SIZE] },
    { s: [gridSize, wallHeight, wallThickness], p: [0, wallHeight / 2, -ARENA_SIZE] },
  ];
  for (const w of wallPositions) {
    const geo = new THREE.BoxGeometry(...w.s);
    const mesh = new THREE.Mesh(geo, wallMat);
    mesh.position.set(...w.p);
    arenaGroup.add(mesh);
  }

  // Corner posts (glowing pillars)
  const postMat = new THREE.MeshBasicMaterial({ color: 0x00ff44 });
  const postGeo = new THREE.CylinderGeometry(0.15, 0.15, wallHeight + 1, 6);
  for (const cx of [-1, 1]) {
    for (const cz of [-1, 1]) {
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(cx * ARENA_SIZE, (wallHeight + 1) / 2, cz * ARENA_SIZE);
      arenaGroup.add(post);
    }
  }
}

// ── Snake ──────────────────────────────────────────────────────────────
function createSnakeSegment(isHead) {
  const size = isHead ? 0.55 : 0.4;
  const geo = isHead
    ? new THREE.SphereGeometry(size, 12, 8)
    : new THREE.SphereGeometry(size, 8, 6);
  const mat = new THREE.MeshStandardMaterial({
    color: isHead ? SNAKE_HEAD_COLOR : SNAKE_COLOR,
    emissive: isHead ? SNAKE_HEAD_COLOR : SNAKE_COLOR,
    emissiveIntensity: isHead ? 0.6 : 0.4,
    roughness: 0.3,
    metalness: 0.7,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;

  if (isHead) {
    // Eyes
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
  const geo = new THREE.ConeGeometry(0.3, 1.0, 6);
  const mat = new THREE.MeshStandardMaterial({
    color: SNAKE_COLOR,
    emissive: SNAKE_COLOR,
    emissiveIntensity: 0.4,
    roughness: 0.3,
    metalness: 0.7,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = Math.PI / 2;
  const wrapper = new THREE.Group();
  wrapper.add(mesh);
  return wrapper;
}

function resetSnake() {
  // Clear existing
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

  // Create segments
  for (let i = 0; i < INITIAL_SEGMENTS; i++) {
    const mesh = createSnakeSegment(i === 0);
    const pos = new THREE.Vector3(0, 0.5, -i * SEGMENT_SPACING);
    mesh.position.copy(pos);
    mesh.rotation.y = Math.PI;
    snakeGroup.add(mesh);
    snake.segments.push(mesh);
    snake.positions.push(pos.clone());
    snake.rotations.push(Math.PI);
  }

  // Tail
  snake.tail = createTail();
  snakeGroup.add(snake.tail);
  updateTail();
}

// ── Food ───────────────────────────────────────────────────────────────
function spawnFood() {
  const color = FOOD_COLORS[Math.floor(Math.random() * FOOD_COLORS.length)];

  const group = new THREE.Group();

  // Main orb
  const geo = new THREE.OctahedronGeometry(0.4, 1);
  const mat = new THREE.MeshStandardMaterial({
    color, emissive: color, emissiveIntensity: 0.8,
    roughness: 0.2, metalness: 0.8,
  });
  const mesh = new THREE.Mesh(geo, mat);
  group.add(mesh);

  // Point light halo
  const light = new THREE.PointLight(color, 0.5, 4);
  group.add(light);

  // Find valid position
  let attempts = 0;
  let pos;
  do {
    const x = (Math.random() * 2 - 1) * (ARENA_SIZE - 1.5);
    const z = (Math.random() * 2 - 1) * (ARENA_SIZE - 1.5);
    pos = new THREE.Vector3(x, 0.5, z);
    attempts++;
  } while (isOnSnake(pos, 2.0) && attempts < 50);

  group.position.copy(pos);
  group.userData = { time: Math.random() * Math.PI * 2, baseY: 0.5 };
  foodGroup.add(group);
  foods.push(group);
}

function isOnSnake(pos, threshold) {
  for (const sp of snake.positions) {
    if (pos.distanceTo(sp) < threshold) return true;
  }
  return false;
}

function updateFoods(dt) {
  for (const food of foods) {
    food.userData.time += dt;
    // Bob
    food.position.y = food.userData.baseY + Math.sin(food.userData.time * 3) * 0.25;
    // Rotate
    food.children[0].rotation.y += dt * 2;
    food.children[0].rotation.x += dt * 0.5;
  }
}

// ── Game Logic ─────────────────────────────────────────────────────────
function startGame() {
  startScreen.style.display = 'none';
  gameoverScreen.style.display = 'none';
  score = 0;
  updateScoreDisplay();
  resetSnake();

  // Clear food
  while (foodGroup.children.length) {
    const child = foodGroup.children[0];
    foodGroup.remove(child);
    child.traverse(c => { if (c.geometry) c.geometry.dispose(); });
  }
  foods = [];

  // Spawn initial food
  for (let i = 0; i < 3; i++) spawnFood();

  isPlaying = true;
  foodSpawnTimer = 0;
  initAudio();
}

function gameOver() {
  snake.alive = false;
  isPlaying = false;
  playDeathSound();

  // Flash snake red
  for (const seg of snake.segments) {
    seg.material.emissive.setHex(0xff0000);
    seg.material.color.setHex(0xff0000);
  }

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snake3d_highscore', String(highScore));
  }

  updateHighScoreDisplay();
  finalScoreEl.textContent = score;
  finalHighscoreEl.textContent = (score > 0 && score >= highScore) ? 'NEW HIGH SCORE!' : `BEST: ${highScore}`;

  setTimeout(() => {
    gameoverScreen.style.display = 'flex';
  }, 600);
}

function updateGame(dt) {
  if (!isPlaying || !snake.alive) return;

  // Input
  handleInput(dt);

  // Move snake
  moveSnake(dt);

  // Update food bulges
  updateFoodBulges(dt);

  // Update tail
  updateTail();

  // Check collisions
  checkCollisions();

  // Spawn food
  foodSpawnTimer += dt;
  if (foodSpawnTimer >= FOOD_SPAWN_INTERVAL && foods.length < MAX_FOOD) {
    foodSpawnTimer = 0;
    spawnFood();
  }

  // Update food animations
  updateFoods(dt);

  // Camera follow
  updateCamera(dt);
}

function handleInput(dt) {
  if (turnLeft) snake.targetRotation += TURN_SPEED * dt;
  if (turnRight) snake.targetRotation -= TURN_SPEED * dt;
  snake.direction.set(
    Math.sin(snake.targetRotation), 0, Math.cos(snake.targetRotation)
  ).normalize();
}

function moveSnake(dt) {
  if (snake.positions.length === 0) return;

  // Move head
  const headPos = snake.positions[0];
  const moveDistance = MOVE_SPEED * dt;
  headPos.addScaledVector(snake.direction, moveDistance);
  headPos.y = 0.5;

  snake.rotations[0] = snake.targetRotation;
  snake.segments[0].position.copy(headPos);
  snake.segments[0].rotation.y = snake.targetRotation;

  // Move body
  for (let i = 1; i < snake.segments.length; i++) {
    const leaderPos = snake.positions[i - 1];
    const currentPos = snake.positions[i];
    const dir = new THREE.Vector3().subVectors(leaderPos, currentPos);
    dir.y = 0;
    const dist = dir.length();

    if (dist > SEGMENT_SPACING) {
      const moveAmount = dist - SEGMENT_SPACING;
      dir.normalize().multiplyScalar(moveAmount);
      currentPos.add(dir);
    }
    currentPos.y = 0.5;

    // Update rotation
    const dirToLeader = new THREE.Vector3().subVectors(leaderPos, currentPos);
    dirToLeader.y = 0;
    if (dirToLeader.length() > 0.01) {
      snake.rotations[i] = Math.atan2(dirToLeader.x, dirToLeader.z);
    }

    snake.segments[i].position.copy(currentPos);
    snake.segments[i].rotation.y = snake.rotations[i];
  }
}

function updateFoodBulges(dt) {
  const toRemove = [];

  for (let i = 0; i < foodBulges.length; i++) {
    foodBulges[i] += BULGE_SPEED * dt;
    if (foodBulges[i] >= snake.segments.length) {
      toRemove.push(i);
      if (pendingSegments > 0) {
        addSegmentAtTail();
        pendingSegments--;
      }
    }
  }

  // Remove completed bulges (reverse order)
  for (let i = toRemove.length - 1; i >= 0; i--) {
    foodBulges.splice(toRemove[i], 1);
  }

  // Apply bulge scale to segments
  for (let i = 0; i < snake.segments.length; i++) {
    let bulgeAmount = 0;
    for (const bulgePos of foodBulges) {
      const distance = Math.abs(bulgePos - i);
      if (distance < 2.0) {
        const influence = Math.cos((distance / 2.0) * Math.PI * 0.5);
        bulgeAmount = Math.max(bulgeAmount, influence);
      }
    }
    if (i > 0) {
      const targetScale = 1.0 + (BULGE_SCALE - 1.0) * bulgeAmount;
      snake.segments[i].scale.setScalar(targetScale);
    }
  }
}

function addSegmentAtTail() {
  const lastPos = snake.positions[snake.positions.length - 1];
  const secondLast = snake.positions.length > 1 ? snake.positions[snake.positions.length - 2] : lastPos;

  const dir = new THREE.Vector3().subVectors(lastPos, secondLast).normalize();
  if (dir.length() < 0.01) dir.copy(snake.direction).negate();
  const newPos = lastPos.clone().addScaledVector(dir, -SEGMENT_SPACING);
  newPos.y = 0.5;

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
  tailPos.y = 0.5;
  snake.tail.position.copy(tailPos);

  if (dir.lengthSq() > 0.0001) {
    snake.tail.rotation.y = Math.atan2(dir.x, dir.z);
  }
}

function checkCollisions() {
  const headPos = snake.positions[0];

  // Boundary
  if (Math.abs(headPos.x) > ARENA_SIZE || Math.abs(headPos.z) > ARENA_SIZE) {
    gameOver();
    return;
  }

  // Self collision (skip first 4 segments)
  for (let i = 4; i < snake.positions.length; i++) {
    if (headPos.distanceTo(snake.positions[i]) < 0.6) {
      gameOver();
      return;
    }
  }

  // Food collision
  for (let i = foods.length - 1; i >= 0; i--) {
    if (headPos.distanceTo(foods[i].position) < 1.3) {
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

  // Start bulge animation
  foodBulges.push(0);
  pendingSegments++;
  playEatSound();

  // Ensure at least 1 food exists
  if (foods.length === 0) spawnFood();
}

// ── Camera ─────────────────────────────────────────────────────────────
let cameraAngle = Math.PI;
const CAMERA_ANGLE_SMOOTHING = 2.5;
const CAMERA_TURN_THRESHOLD = 0.35; // ~20 degrees
const CAMERA_DISTANCE = 12;
const CAMERA_HEIGHT = 6;

function updateCamera(dt) {
  if (snake.positions.length === 0) return;

  const headPos = snake.positions[0];
  const snakeAngle = snake.targetRotation;

  // Smooth camera angle (only rotate when snake turns enough)
  let angleDiff = snakeAngle - cameraAngle;
  // Normalize to [-PI, PI]
  while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
  while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

  if (Math.abs(angleDiff) > CAMERA_TURN_THRESHOLD) {
    // Lerp angle
    cameraAngle += angleDiff * CAMERA_ANGLE_SMOOTHING * dt;
  }

  const forward = new THREE.Vector3(Math.sin(cameraAngle), 0, Math.cos(cameraAngle));
  const camPos = headPos.clone().addScaledVector(forward, -CAMERA_DISTANCE);
  camPos.y = CAMERA_HEIGHT;

  camera.position.lerp(camPos, 5 * dt);

  const lookTarget = headPos.clone().addScaledVector(forward, 3);
  lookTarget.y = 0.3;
  camera.lookAt(lookTarget);
}

// ── Input Handlers ─────────────────────────────────────────────────────
function onKeyDown(e) {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') turnLeft = true;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') turnRight = true;

  // Quick start with any key
  if (!isPlaying && startScreen.style.display !== 'none') {
    if (e.key === ' ' || e.key === 'Enter') startGame();
  }
}

function onKeyUp(e) {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') turnLeft = false;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') turnRight = false;
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
  const threshold = 15;

  turnLeft = dx < -threshold;
  turnRight = dx > threshold;
}

function onTouchEnd(e) {
  e.preventDefault();
  touchActive = false;
  turnLeft = false;
  turnRight = false;
}

function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
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
  highscoreEl.textContent = highScore > 0 ? `BEST: ${highScore}` : '';
}

// ── Particle Trail ─────────────────────────────────────────────────────
let trailParticles;
const TRAIL_COUNT = 80;

function createTrail() {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(TRAIL_COUNT * 3);
  const sizes = new Float32Array(TRAIL_COUNT);
  const alphas = new Float32Array(TRAIL_COUNT);

  for (let i = 0; i < TRAIL_COUNT; i++) {
    positions[i * 3] = 0;
    positions[i * 3 + 1] = -10; // hidden
    positions[i * 3 + 2] = 0;
    sizes[i] = 0;
    alphas[i] = 0;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

  const mat = new THREE.PointsMaterial({
    color: SNAKE_COLOR,
    size: 0.15,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  trailParticles = new THREE.Points(geo, mat);
  scene.add(trailParticles);
}

let trailIndex = 0;
let trailTimer = 0;

function updateTrail(dt) {
  if (!trailParticles || !isPlaying || !snake.alive) return;

  trailTimer += dt;
  if (trailTimer < 0.03) return; // emit every 30ms
  trailTimer = 0;

  const positions = trailParticles.geometry.attributes.position.array;

  // Place particle at tail position with slight random offset
  if (snake.positions.length > 0) {
    const tailPos = snake.positions[snake.positions.length - 1];
    const idx = trailIndex * 3;
    positions[idx] = tailPos.x + (Math.random() - 0.5) * 0.3;
    positions[idx + 1] = 0.1 + Math.random() * 0.2;
    positions[idx + 2] = tailPos.z + (Math.random() - 0.5) * 0.3;

    trailIndex = (trailIndex + 1) % TRAIL_COUNT;
  }

  // Fade out particles (move them down slowly)
  for (let i = 0; i < TRAIL_COUNT; i++) {
    positions[i * 3 + 1] -= dt * 0.3;
    if (positions[i * 3 + 1] < -1) positions[i * 3 + 1] = -10;
  }

  trailParticles.geometry.attributes.position.needsUpdate = true;
}

// ── Main Loop ──────────────────────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05); // Cap delta to prevent huge jumps

  updateGame(dt);
  updateTrail(dt);

  // Idle camera rotation when not playing
  if (!isPlaying) {
    const t = clock.elapsedTime * 0.2;
    camera.position.set(Math.sin(t) * 30, 20, Math.cos(t) * 30);
    camera.lookAt(0, 0, 0);
  }

  composer.render();
}

// ── Start ──────────────────────────────────────────────────────────────
init();
