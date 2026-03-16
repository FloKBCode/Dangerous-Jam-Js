// Main P5.js file — contains setup() and draw(), the core game loop

// ── global image variables ──────────────────────────────
let spritesheet, deadImg;
let tileSheet, characterSheet, diamondGood, diamondBad;
let bgImg, sunImg, moonImg, hutImg;

// ── game objects ────────────────────────────────────────
let player, world, ui, phaseManager, transition;
let obstacles = [];

// ── game state ──────────────────────────────────────────
let score = 0;
let spawnTimer = 0;
let spawnInterval = 90;

// ── visual feedback ─────────────────────────────────────
let hitFlash = 0;
let healFlash = 0;
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
}

function setup() {
  let canvas = createCanvas(800, 400);
  canvas.parent('game-container');
  player       = new Player();
  world        = new World();
  ui           = new UI();
  phaseManager = new PhaseManager();
  transition   = new TransitionManager();
}

function draw() {
  let phase = phaseManager.currentPhase;

  // update and draw world
  world.update(phase);
  world.draw(phase, bgImg, sunImg, moonImg, hutImg, tileSheet);

  // spawn obstacles
  spawnTimer++;
  if (spawnTimer >= spawnInterval) {
    obstacles.push(spawnObstacle(phase));
    spawnTimer = 0;
  }

  // update and draw obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].update(world.scrollSpeed);
    obstacles[i].draw(tileSheet, characterSheet, diamondGood, diamondBad);

    // check collision with player
    if (!player.isDead && phaseManager.checkCollision(player, obstacles[i])) {
      let effect = obstacles[i].getEffect(phase);
      player.health += effect.hp;
      score += effect.score;
      if (effect.hp < 0)     hitFlash   = 20;
      if (effect.hp > 0)     healFlash  = 20;
      if (effect.score > 0)  scorePopup = 40;
      obstacles.splice(i, 1);
      continue;
    }

    // remove off-screen obstacles
    if (obstacles[i].isOffScreen()) {
      obstacles.splice(i, 1);
    }
  }

  // update and draw player
  if (!player.isDead) {
    player.update();
    score += phaseManager.getScoreRate();
  }
  player.display();

  // check game over
  if (player.health <= 0 && !player.isDead) {
    player.isDead = true;
  }

  // update phase
  phaseManager.update(player, world, transition, ui);

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

  // score popup
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

  // draw UI on top of everything
  ui.update(score);
  ui.draw(player.health, tileSheet);

  // draw transition overlay
  transition.update();
  transition.draw();
}