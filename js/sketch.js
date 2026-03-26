// sketch.js — boucle principale P5.js

let spritesheet, deadImg, spotlightImg;
let tileSheet, characterSheet, diamondGood, diamondBad;
let bgImg, bgImg2, bgImg3, sunImg, moonImg, hutImg;
let soundJump, soundHurt, soundTransition, soundBreathing;
let musicPhase1, musicPhase2, musicPhase3;

let player, world, ui, phaseManager, transition, spawnManager;
let startScreen, pauseScreen, gameOverScreen;
let obstacles = [];

let gameState = "start";
let score     = 0;

let hitFlash  = 0;
let healFlash = 0;

let screenshakeTimer     = 0;
let screenshakeIntensity = 0;

const SPEED_PHASE1     = 3.5;
const SPEED_PHASE2     = 4.5;
const SPEED_PHASE3_MIN = 5.5;
const SPEED_PHASE3_MAX = 10;
let   phase3AccelTimer = 0;

function preload() {
  spritesheet    = loadImage("assets/sprites/player/tilemap-characters.png");
  deadImg        = loadImage("assets/sprites/player/player_dead.png");
  spotlightImg   = loadImage("assets/backgrounds/spotlight.png");
  characterSheet = loadImage("assets/sprites/player/tilemap-characters.png");
  tileSheet      = loadImage("assets/sprites/obstacles/tilemap.png");
  diamondGood    = loadImage("assets/sprites/obstacles/diamond_good.png");
  diamondBad     = loadImage("assets/sprites/obstacles/diamond_bad.png");
  bgImg          = loadImage("assets/backgrounds/backgroundColorForest.png");
  bgImg2         = loadImage("assets/backgrounds/backgroundColorForest_phase2.png");
  bgImg3         = loadImage("assets/backgrounds/backgroundColorForest_phase3.png");
  sunImg         = loadImage("assets/backgrounds/sun.png");
  moonImg        = loadImage("assets/backgrounds/moonFull.png");
  hutImg         = loadImage("assets/backgrounds/hut.png");
  soundJump       = loadSound("assets/sounds/jump.mp3");
  soundHurt       = loadSound("assets/sounds/hurt.mp3");
  soundTransition = loadSound("assets/sounds/transition.mp3");
  soundBreathing  = loadSound("assets/sounds/phase3_breathing.mp3");
  musicPhase1     = loadSound("assets/sounds/phase1.mp3");
  musicPhase2     = loadSound("assets/sounds/phase2.mp3");
  musicPhase3     = loadSound("assets/sounds/phase3.mp3");
}

function setup() {
  let canvas = createCanvas(800, 400);
  canvas.parent("game-container");

  // Fix focus clavier
  canvas.elt.setAttribute("tabindex", "0");
  canvas.elt.focus();
  document.addEventListener("click", () => canvas.elt.focus());
  canvas.elt.addEventListener("keydown", e => {
    if ([32, 37, 38, 39, 40].includes(e.keyCode)) e.preventDefault();
  });

  startScreen    = new StartScreen();
  pauseScreen    = new PauseScreen();
  gameOverScreen = new GameOverScreen();
  _initGame();
}

function _initGame() {
  player           = new Player();
  world            = new World();
  ui               = new UI();
  phaseManager     = new PhaseManager();
  transition       = new TransitionManager();
  spawnManager     = new SpawnManager();
  obstacles        = [];
  score            = 0;
  hitFlash         = 0;
  healFlash        = 0;
  screenshakeTimer = 0;
  screenshakeIntensity = 0;
  phase3AccelTimer = 0;
  world.scrollSpeed = SPEED_PHASE1;
}

function draw() {
  if (gameState === "start") {
    startScreen.draw();
    return;
  }

  if (gameState === "paused") {
    world.draw(phaseManager.currentPhase, bgImg, bgImg2, bgImg3, sunImg, moonImg, hutImg, tileSheet);
    player.display();
    ui.draw(player.health, tileSheet, phaseManager.currentPhase);
    pauseScreen.draw(score, ui.getBestScore(), phaseManager.currentPhase);
    return;
  }

  if (gameState === "gameover") {
    gameOverScreen.draw();
    ui.drawLeaderboard(width / 2, height * 0.65 + 110);
    return;
  }

  // ── PLAYING ─────────────────────────────────────────────────────────────────
  let phase       = phaseManager.currentPhase;
  let isCinematic = phaseManager.isCinematic();
  let isLocked    = player.locked;

  // accélération phase 3
  if (phase === 3 && !isCinematic && !isLocked) {
    phase3AccelTimer++;
    if (phase3AccelTimer % 120 === 0) {
      world.scrollSpeed = min(world.scrollSpeed + 0.3, SPEED_PHASE3_MAX);
      spawnManager.reset(); // remet à zéro pour adapter les pauses à la nouvelle vitesse
    }
  }

  // screenshake
  let shakeX = 0, shakeY = 0;
  if (screenshakeTimer > 0) {
    shakeX = random(-screenshakeIntensity, screenshakeIntensity);
    shakeY = random(-screenshakeIntensity, screenshakeIntensity);
    screenshakeTimer--;
    screenshakeIntensity = max(0, screenshakeIntensity - 0.08);
  }

  push();
  translate(shakeX, shakeY);

  world.update(phase);
  world.draw(phase, bgImg, bgImg2, bgImg3, sunImg, moonImg, hutImg, tileSheet);

  // ── Spawn via SpawnManager ────────────────────────────────────────────────
  if (!phaseManager.isSpawnBlocked()) {
    let newObstacles = spawnManager.update(phase, world.scrollSpeed);
    for (let o of newObstacles) obstacles.push(o);
  } else {
    spawnManager.reset();
  }

  // vider pendant cinematic_black
  if (phaseManager.cinematicState === "cinematic_black" && obstacles.length > 0) {
    obstacles = [];
  }

  // ── Obstacles ───────────────────────────────────────────────────────────────
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].update(world.scrollSpeed);
    obstacles[i].draw(tileSheet, characterSheet, diamondGood, diamondBad);

    if (!player.isDead && !isLocked && phaseManager.checkCollision(player, obstacles[i])) {
      let effect = obstacles[i].getEffect(phase);
      player.health = constrain(player.health + effect.hp, 0, 9);

      let mult = phase;
      score += effect.score * mult;

      let ox = obstacles[i].x;
      let oy = obstacles[i].y;
      if (effect.hp < 0) {
        hitFlash = 15;
        if (soundHurt.isLoaded()) soundHurt.play();
        ui.addPopup(ox, oy, effect.hp + " HP", "damage");
      }
      if (effect.hp > 0) {
        healFlash = 15;
        ui.addPopup(ox, oy, "+" + effect.hp + " HP", "heal");
      }
      if (effect.score > 0) {
        ui.addPopup(ox, oy, "+" + (effect.score * mult), "score");
      }

      obstacles.splice(i, 1);
      continue;
    }

    if (obstacles[i].isOffScreen()) obstacles.splice(i, 1);
  }

  // ── Joueur ──────────────────────────────────────────────────────────────────
  if (!player.isDead) {
    player.update(isCinematic || isLocked);
    if (!isCinematic && !isLocked) {
      score += phaseManager.getScoreRate() * phase;
    }
  }
  player.display();

  // ── Mort ────────────────────────────────────────────────────────────────────
  if (player.health <= 0 && !player.isDead) {
    player.isDead = true;
    if (!player.deathHandled) {
      player.deathHandled  = true;
      player.deathTimer    = 0;
      screenshakeTimer     = 40;
      screenshakeIntensity = 5;
      let finalScore = Math.floor(score);
      ui.saveScore(finalScore);
      gameOverScreen.setStats(finalScore, phaseManager.distance, phaseManager.currentPhase);
    }
  }

  if (player.isDead && player.deathHandled) {
    player.deathTimer++;
    if (player.deathTimer >= 90) gameState = "gameover";
  }

  phaseManager.update(player, world, transition, ui);

  // overlay cinématique
  let alpha = phaseManager.getCinematicAlpha();
  if (alpha > 0) {
    noStroke();
    fill(0, alpha);
    rect(0, 0, width, height);
  }

  phaseManager.drawCinematic();

  if (hitFlash > 0) {
    noStroke();
    fill(255, 0, 0, map(hitFlash, 0, 15, 0, 90));
    rect(0, 0, width, height);
    hitFlash--;
  }
  if (healFlash > 0) {
    noStroke();
    fill(0, 255, 100, map(healFlash, 0, 15, 0, 70));
    rect(0, 0, width, height);
    healFlash--;
  }

  ui.update(Math.floor(score));
  ui.draw(player.health, tileSheet, phase);

  transition.update();
  transition.draw();

  drawPhaseLabel();

  pop();
}

function keyPressed() {
  if (gameState === "start" && keyCode === ENTER) {
    gameState = "playing";
    if (musicPhase1 && musicPhase1.isLoaded() && !musicPhase1.isPlaying()) {
      musicPhase1.setLoop(true);
      musicPhase1.play();
    }
    return false;
  }

  if (gameState === "playing" && (key === "p" || key === "P")) {
    if (!player.isDead) {
      gameState = "paused";
      if (musicPhase1.isLoaded() && musicPhase1.isPlaying()) musicPhase1.pause();
      if (musicPhase2.isLoaded() && musicPhase2.isPlaying()) musicPhase2.pause();
      if (musicPhase3.isLoaded() && musicPhase3.isPlaying()) musicPhase3.pause();
    }
    return false;
  }

  if (gameState === "paused" && (key === "p" || key === "P")) {
    gameState = "playing";
    let ph = phaseManager.currentPhase;
    if (ph === 1 && musicPhase1.isLoaded() && !musicPhase1.isPlaying()) musicPhase1.play();
    if (ph === 2 && musicPhase2.isLoaded() && !musicPhase2.isPlaying()) musicPhase2.play();
    if (ph === 3 && musicPhase3.isLoaded() && !musicPhase3.isPlaying()) musicPhase3.play();
    return false;
  }

  if (gameState === "paused" && (key === "r" || key === "R")) {
    _stopAllMusic();
    _initGame();
    gameState = "playing";
    _startMusic();
    return false;
  }

  if (gameState === "gameover" && (key === "r" || key === "R")) {
    _stopAllMusic();
    _initGame();
    gameState = "playing";
    _startMusic();
    return false;
  }

  if ([32, 37, 38, 39, 40].includes(keyCode)) return false;
}

function _stopAllMusic() {
  if (musicPhase1 && musicPhase1.isLoaded()) musicPhase1.stop();
  if (musicPhase2 && musicPhase2.isLoaded()) musicPhase2.stop();
  if (musicPhase3 && musicPhase3.isLoaded()) musicPhase3.stop();
  if (soundBreathing && soundBreathing.isLoaded() && soundBreathing.isPlaying()) soundBreathing.stop();
}

function _startMusic() {
  if (musicPhase1 && musicPhase1.isLoaded()) {
    musicPhase1.setLoop(true);
    musicPhase1.play();
  }
}
