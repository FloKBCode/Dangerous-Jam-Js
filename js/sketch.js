let tileSheet, characterSheet, diamondGood, diamondBad;
let vignetteSize = 0;
let currentPhase = 1;

function preload() {
  spritesheet    = loadImage('assets/sprites/player/tilemap-characters.png');
  deadImg        = loadImage('assets/sprites/player/player_dead.png');
  tileSheet      = loadImage('assets/sprites/obstacles/tilemap.png');
  characterSheet = loadImage('assets/sprites/player/tilemap-characters.png');
  diamondGood    = loadImage('assets/sprites/obstacles/diamond_good.png');
  diamondBad     = loadImage('assets/sprites/obstacles/diamond_bad.png');
  bgImg          = loadImage('assets/backgrounds/backgroundColorForest.png');
  sunImg         = loadImage('assets/backgrounds/sun.png');
  moonImg        = loadImage('assets/backgrounds/moonFull.png');
  hutImg         = loadImage('assets/backgrounds/hut.png');
}

function setup() {
  createCanvas(800, 400);
  player = new Player();
}

function draw() {
  background(0);
  player.display();

  if (currentPhase === 3) {
    updateVignette();
    drawVignette();
    triggerGlitch();
  }
}

function updateVignette() {
  vignetteSize = lerp(vignetteSize, 220, 0.02);
}

function drawVignette() {
  let grad = drawingContext.createRadialGradient(
    width / 2, height / 2, height * 0.2,
    width / 2, height / 2, height * 0.85
  );
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,' + (vignetteSize / 255) + ')');
  drawingContext.fillStyle = grad;
  drawingContext.fillRect(0, 0, width, height);
}

function triggerGlitch() {
  if (frameCount % 90 === 0) {
    let canvas = document.querySelector('canvas');
    canvas.classList.add('glitch');
    setTimeout(() => canvas.classList.remove('glitch'), 300);
  }
}

function setPhase(phase) {
  currentPhase = phase;
  if (phase !== 3) {
    vignetteSize = 0;
    let canvas = document.querySelector('canvas');
    canvas.classList.remove('glitch');
  }
}