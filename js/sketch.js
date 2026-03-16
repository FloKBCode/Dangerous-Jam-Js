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

  // draw UI on top of everything
  ui.update(score);
  ui.draw(player.health, tileSheet);

  // draw transition overlay
  transition.update();
  transition.draw();
}