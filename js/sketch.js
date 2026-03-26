// Main P5.js file — contains setup() and draw(), the core game loop

// ── global image variables ──────────────────────────────
let spritesheet, deadImg;
let tileSheet, characterSheet, diamondGood, diamondBad;
let bgImg, bgImg2, bgImg3, sunImg, moonImg, hutImg;
let soundJump, soundHurt, soundTransition, soundBreathing;
let musicPhase1, musicPhase2, musicPhase3;

// ── game objects ────────────────────────────────────────
let player, world, ui, phaseManager, transition;
let startScreen, pauseScreen, gameOverScreen;
let obstacles = [];

// ── game states ─────────────────────────────────────────
// "start" | "playing" | "paused" | "gameover"
let gameState = "start";
let score     = 0;

// ── spawn control ────────────────────────────────────────
let spawnTimer    = 0;
let spawnEnabled  = true; // disabled during cinematic

// ── visual feedback ─────────────────────────────────────
let hitFlash   = 0;
let healFlash  = 0;
let scorePopup = 0;

// ── speed progression ────────────────────────────────────
// phase 1 : starts at 3.5, stays chill
// phase 2 : bumped to 4.5, stays constant
// phase 3 : starts at 5.5, accelerates progressively to 10
const SPEED_PHASE1     = 3.5;
const SPEED_PHASE2     = 4.5;
const SPEED_PHASE3_MIN = 5.5;
const SPEED_PHASE3_MAX = 10;
let   phase3AccelTimer = 0;

function preload() {
  spritesheet    = loadImage('assets/sprites/player/tilemap-characters.png');
  deadImg        = loadImage('assets/sprites/player/player_dead.png');
  characterSheet = loadImage('assets/sprites/player/tilemap-characters.png');
  tileSheet      = loadImage('assets/sprites/obstacles/tilemap.png');
  diamondGood    = loadImage('assets/sprites/obstacles/diamond_good.png');
  diamondBad     = loadImage('assets/sprites/obstacles/diamond_bad.png');
  bgImg          = loadImage('assets/backgrounds/backgroundColorForest.png');
  bgImg2         = loadImage('assets/backgrounds/backgroundColorForest_phase2.png');
  bgImg3         = loadImage('assets/backgrounds/backgroundColorForest_phase3.png');
  sunImg         = loadImage('assets/backgrounds/sun.png');
  moonImg        = loadImage('assets/backgrounds/moonFull.png');
  hutImg         = loadImage('assets/backgrounds/hut.png');
  soundJump       = loadSound('assets/sounds/jump.mp3');
  soundHurt       = loadSound('assets/sounds/hurt.mp3');
  soundTransition = loadSound('assets/sounds/transition.mp3');
  soundBreathing  = loadSound('assets/sounds/phase3_breathing.mp3');
  musicPhase1     = loadSound('assets/sounds/phase1.mp3');
  musicPhase2     = loadSound('assets/sounds/phase2.mp3');
  musicPhase3     = loadSound('assets/sounds/phase3.mp3');
}

function setup() {
  let canvas = createCanvas(800, 400);
  canvas.parent('game-container');
  startScreen    = new StartScreen();
  pauseScreen    = new PauseScreen();
  gameOverScreen = new GameOverScreen();
  _initGame();
}

function _initGame() {
  player        = new Player();
  world         = new World();
  ui            = new UI();
  phaseManager  = new PhaseManager();
  transition    = new TransitionManager();
  obstacles     = [];
  score         = 0;
  spawnTimer    = 0;
  spawnEnabled  = true;
  hitFlash      = 0;
  healFlash     = 0;
  scorePopup    = 0;
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
    ui.draw(player.health, tileSheet);
    pauseScreen.draw();
    return;
  }

  if (gameState === "gameover") {
    gameOverScreen.draw();
    ui.drawLeaderboard(width / 2, height * 0.65 + 110);
    return;
  }

  // ── STATE : PLAYING ───────────────────────────────────
  let phase       = phaseManager.currentPhase;
  let isCinematic = phaseManager.isCinematic();

  // disable spawn during cinematic and clear existing obstacles
  if (isCinematic && spawnEnabled) {
    spawnEnabled = false;
    obstacles    = []; // clear all obstacles during transition
  }
  if (!isCinematic && !spawnEnabled) {
    spawnEnabled = true; // re-enable spawn after cinematic
    spawnTimer   = 0;
  }

  // progressive speed in phase 3
  if (phase === 3 && !isCinematic) {
    phase3AccelTimer++;
    // accelerate every 120 frames until max speed
    if (phase3AccelTimer % 120 === 0) {
      world.scrollSpeed = min(world.scrollSpeed + 0.3, SPEED_PHASE3_MAX);
    }
  }

  // update and draw world
  world.update(phase);
  world.draw(phase, bgImg, bgImg2, bgImg3, sunImg, moonImg, hutImg, tileSheet);

  // spawn obstacles — only when not in cinematic
  if (!phaseManager.isSpawnBlocked()) {
  spawnTimer++;
  let interval = phase === 1 ? 100 : phase === 2 ? 75 : 55;
  if (spawnTimer >= interval) {
    obstacles.push(spawnObstacle(phase));
    spawnTimer = 0;
  }
  }

  // clear all obstacles when spawn becomes blocked
  if (phaseManager.isSpawnBlocked() && obstacles.length > 0) {
    obstacles = [];
  }

  // update and draw obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].update(world.scrollSpeed);
    obstacles[i].draw(tileSheet, characterSheet, diamondGood, diamondBad);

    // check collision
    if (!player.isDead && phaseManager.checkCollision(player, obstacles[i])) {
      let effect = obstacles[i].getEffect(phase);
      player.health = constrain(player.health + effect.hp, 0, 9);
      score        += effect.score;
      if (effect.hp    < 0) { hitFlash = 20; if (soundHurt.isLoaded()) soundHurt.play(); }
      if (effect.hp    > 0) healFlash  = 20;
      if (effect.score > 0) scorePopup = 40;
      obstacles.splice(i, 1);
      continue;
    }

    if (obstacles[i].isOffScreen()) obstacles.splice(i, 1);
  }

  // update and draw player
  if (!player.isDead && !isCinematic) {
    player.update();
    score += phaseManager.getScoreRate();
  }
  player.display();

  // check game over
  if (player.health <= 0 && !player.isDead) {
    player.isDead = true;
    // use a flag instead of setTimeout to avoid multiple triggers
    if (!player.deathHandled) {
      player.deathHandled = true;
      let finalScore = Math.floor(score);
      ui.saveScore(finalScore);
      gameOverScreen.setStats(finalScore, phaseManager.distance, phaseManager.currentPhase);
      // delay game over screen by 90 frames using a counter
    }
  }

  // delayed game over — count 90 frames after death
  if (player.isDead && player.deathHandled) {
    player.deathTimer = (player.deathTimer || 0) + 1;
    if (player.deathTimer >= 90) {
      gameState = "gameover";
    }
  }

  // update phase manager
  phaseManager.update(player, world, transition, ui);

  // draw cinematic black overlay
  let alpha = phaseManager.getCinematicAlpha();
  if (alpha > 0) {
    noStroke();
    fill(0, alpha);
    rect(0, 0, width, height);
  }

  // red flash on damage
  if (hitFlash > 0) {
    noStroke();
    fill(255, 0, 0, map(hitFlash, 0, 20, 0, 100));
    rect(0, 0, width, height);
    hitFlash--;
  }

  // green flash on heal
  if (healFlash > 0) {
    noStroke();
    fill(0, 255, 100, map(healFlash, 0, 20, 0, 80));
    rect(0, 0, width, height);
    healFlash--;
  }

  // score popup on points gain
  if (scorePopup > 0) {
    push();
    textFont("'Press Start 2P'");
    textSize(14);
    fill(255, 255, 0, map(scorePopup, 0, 40, 0, 255));
    textAlign(CENTER);
    text("+PTS", width / 2, height / 2 - scorePopup);
    pop();
    scorePopup--;
  }

  // draw UI on top
  ui.update(Math.floor(score));
  ui.draw(player.health, tileSheet);

  // draw transition overlay
  transition.update();
  transition.draw();

  // draw phase label
  drawPhaseLabel();
}

function keyPressed() {
  // start screen — ENTER starts the game and music
  if (gameState === "start" && keyCode === ENTER) {
    gameState = "playing";
    if (musicPhase1 && !musicPhase1.isPlaying()) {
      musicPhase1.setLoop(true);
      musicPhase1.play();
    }
  }

  // playing — P pauses and stops music
  if (gameState === "playing" && (key === "p" || key === "P")) {
    gameState = "paused";
    if (musicPhase1.isPlaying()) musicPhase1.pause();
    if (musicPhase2.isPlaying()) musicPhase2.pause();
    if (musicPhase3.isPlaying()) musicPhase3.pause();
  }

  // paused — P resumes music
  if (gameState === "paused" && (key === "p" || key === "P")) {
    gameState = "playing";
    let phase = phaseManager.currentPhase;
    if (phase === 1 && !musicPhase1.isPlaying()) musicPhase1.play();
    if (phase === 2 && !musicPhase2.isPlaying()) musicPhase2.play();
    if (phase === 3 && !musicPhase3.isPlaying()) musicPhase3.play();
  }

  // game over — R restarts
  if (gameState === "gameover" && (key === "r" || key === "R")) {
    if (musicPhase1) musicPhase1.stop();
    if (musicPhase2) musicPhase2.stop();
    if (musicPhase3) musicPhase3.stop();
    if (soundBreathing && soundBreathing.isPlaying()) soundBreathing.stop();
    _initGame();
    gameState = "playing";
    musicPhase1.setLoop(true);
    musicPhase1.play();
  }
}