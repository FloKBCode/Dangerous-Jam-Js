/* Global styles for the game — layout, background and canvas rendering */

// Main P5.js file — contains setup() and draw(), the core game loop

let tileSheet, characterSheet, diamondGood, diamondBad;

function preload() {
  spritesheet  = loadImage('assets/sprites/player/tilemap-characters.png');
  deadImg      = loadImage('assets/sprites/player/player_dead.png');
  tileSheet    = loadImage('assets/sprites/obstacles/tilemap.png');
  characterSheet = loadImage('assets/sprites/player/tilemap-characters.png');
  diamondGood  = loadImage('assets/sprites/obstacles/diamond_good.png');
  diamondBad   = loadImage('assets/sprites/obstacles/diamond_bad.png');
  bgImg   = loadImage('assets/backgrounds/backgroundColorForest.png');
  sunImg  = loadImage('assets/backgrounds/sun.png');
  moonImg = loadImage('assets/backgrounds/moonFull.png');
  hutImg  = loadImage('assets/backgrounds/hut.png');
}


function setup() {
  createCanvas(800, 400);
  player = new Player();
}

function draw() {
  background(0);
  player.display();
}