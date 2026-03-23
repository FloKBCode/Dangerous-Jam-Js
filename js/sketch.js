// Main P5.js file — contains setup() and draw(), the core game loop

// ── global image variables ──────────────────────────────
let spritesheet, deadImg;
let tileSheet, characterSheet, diamondGood, diamondBad;
let bgImg, sunImg, moonImg, hutImg;
let soundJump, soundHurt, soundTransition, soundBreathing;
let musicPhase1, musicPhase2, musicPhase3;

// ── game objects ────────────────────────────────────────
let player, world, ui, phaseManager, transition;
let obstacles = [];

// ── game states ─────────────────────────────────────────
// "start" | "playing" | "paused" | "gameover"
let gameState   = "start";
let score       = 0;
let spawnTimer  = 0;
let spawnInterval = 90;

// ── visual feedback ─────────────────────────────────────
let hitFlash   = 0;
let healFlash  = 0;
let scorePopup = 0;

function preload() {
  spritesheet    = loadImage('assets/sprites/player/tilemap-characters.png');
  deadImg        = loadImage('assets/sprites/player/player_dead.png');
  characterSheet = loadImage('assets/sprites/player/tilemap-characters.png');
  tileSheet      = loadImage('assets/sprites/obstacles/tilemap.png');
  diamondGood    = loadImage('assets/sprites/obstacles/diamond_good.png');
  diamondBad     = loadImage('assets/sprites/obstacles/diamond_bad.png');
  bgImg          = loadImage('assets/backgrounds/backgroundColorForest.png');
  sunImg         = loadImage('assets/backgrounds/sun.png');
  moonImg        = loadImage('assets/backgrounds/moonFull.png');
  hutImg         = loadImage('assets/backgrounds/hut.png');
  soundJump      = loadSound('assets/sounds/jump.mp3');
  soundHurt      = loadSound('assets/sounds/hurt.mp3');
  soundTransition = loadSound('assets/sounds/transition.mp3');
  soundBreathing  = loadSound('assets/sounds/phase3_breathing.mp3');
  musicPhase1    = loadSound('assets/sounds/phase1.mp3');
  musicPhase2    = loadSound('assets/sounds/phase2.mp3');
  musicPhase3    = loadSound('assets/sounds/phase3.mp3');
}

function setup() {
  let canvas = createCanvas(800, 400);
  canvas.parent('game-container');
  _initGame();
}

// initialise or reset all game objects
function _initGame() {
  player       = new Player();
  world        = new World();
  ui           = new UI();
  phaseManager = new PhaseManager();
  transition   = new TransitionManager();
  obstacles    = [];
  score        = 0;
  spawnTimer   = 0;
  hitFlash     = 0;
  healFlash    = 0;
  scorePopup   = 0;
  if (musicPhase1 && !musicPhase1.isPlaying()) {
    musicPhase1.setLoop(true);
    musicPhase1.play();
  }
}

function draw() {
  if (gameState === "start") {
    _drawStartScreen();
    return;
  }

  if (gameState === "paused") {
    world.draw(phaseManager.currentPhase, bgImg, sunImg, moonImg, hutImg, tileSheet);
    player.display();
    ui.draw(player.health, tileSheet);
    drawPauseOverlay();
    return;
  }

  if (gameState === "gameover") {
    _drawGameOverScreen();
    return;
  }

  // ── STATE : PLAYING ──────────────────────────────────
  let phase = phaseManager.currentPhase;
  let isCinematic = phaseManager.isCinematic();

  world.update(phase);
  world.draw(phase, bgImg, sunImg, moonImg, hutImg, tileSheet);

  if (!isCinematic) {
    spawnTimer++;
    let interval = phase === 1 ? 90 : phase === 2 ? 70 : 50;
    if (spawnTimer >= interval) {
      obstacles.push(spawnObstacle(phase));
      spawnTimer = 0;
    }
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    if (!isCinematic) obstacles[i].update(world.scrollSpeed);
    obstacles[i].draw(tileSheet, characterSheet, diamondGood, diamondBad);

    if (!isCinematic && !player.isDead &&
        phaseManager.checkCollision(player, obstacles[i])) {
      let effect = obstacles[i].getEffect(phase);
      player.health += effect.hp;
      score         += effect.score;
      if (effect.hp < 0) { hitFlash = 20; soundHurt.play(); }
      if (effect.hp    > 0) healFlash  = 20;
      if (effect.score > 0) scorePopup = 40;
      obstacles.splice(i, 1);
      continue;
    }

    if (obstacles[i].isOffScreen()) obstacles.splice(i, 1);
  }

  if (!player.isDead && !isCinematic) {
    player.update();
    score += phaseManager.getScoreRate();
  }
  player.display();

  if (player.health <= 0 && !player.isDead) {
    player.isDead = true;
    setTimeout(() => { gameState = "gameover"; }, 1500);
  }

  phaseManager.update(player, world, transition, ui);

  let alpha = phaseManager.getCinematicAlpha();
  if (alpha > 0) {
    noStroke();
    fill(0, alpha);
    rect(0, 0, width, height);
  }

  if (hitFlash > 0) {
    noStroke();
    fill(255, 0, 0, map(hitFlash, 0, 20, 0, 100));
    rect(0, 0, width, height);
    hitFlash--;
  }

  if (healFlash > 0) {
    noStroke();
    fill(0, 255, 100, map(healFlash, 0, 20, 0, 80));
    rect(0, 0, width, height);
    healFlash--;
  }

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

  ui.update(score);
  ui.draw(player.health, tileSheet);

  transition.update();
  transition.draw();

  drawPhaseLabel();
}

function _drawStartScreen() {
  background(0);
  drawTitle();
  push();
  textFont("'Press Start 2P'");
  textSize(9);
  textAlign(CENTER);
  fill(200, 200, 200);
  text("PRESS ENTER TO START", width / 2, height / 2 + 60);
  fill(100, 100, 100);
  text("JUMP: UP / SPACE   CROUCH: DOWN / S   PAUSE: P", width / 2, height - 30);
  pop();
}

function _drawGameOverScreen() {
  background(0);
  push();
  textFont("'Press Start 2P'");
  textAlign(CENTER, CENTER);

  noStroke();
  fill(255, 255, 255, 30);
  triangle(width/2 - 40, 0, width/2 + 40, 0, width/2, height * 0.55);
  fill(255, 255, 255, 60);
  triangle(width/2 - 15, 0, width/2 + 15, 0, width/2, height * 0.55);

  if (deadImg) {
    push();
    translate(width / 2 + 16, height * 0.52 + 16);
    rotate(HALF_PI);
    image(deadImg, -16, -16, 32, 32);
    pop();
  }

  textSize(18);
  fill(255, 60, 60);
  text("GAME OVER", width / 2, 60);

  textSize(8);
  fill(180, 180, 180);
  text("SCORE      : " + formatScore(Math.floor(score)), width / 2, height * 0.65);
  text("PHASE      : " + phaseManager.currentPhase + " / 3",  width / 2, height * 0.65 + 24);
  text("DISTANCE   : " + phaseManager.distance,               width / 2, height * 0.65 + 48);

  fill(255, 255, 100);
  textSize(7);
  text("PRESS R TO RESTART", width / 2, height - 30);
  pop();
}

function keyPressed() {
  if (gameState === "start" && keyCode === ENTER) {
    gameState = "playing";
  }

  if (gameState === "playing" && key === "p" || key === "P") {
    gameState = "paused";
  }

  if (gameState === "paused" && (key === "p" || key === "P")) {
    gameState = "playing";
  }

  if (gameState === "gameover" && (key === "r" || key === "R")) {
    _initGame();
    gameState = "playing";
  }
}