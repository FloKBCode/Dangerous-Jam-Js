/* Global styles for the game — layout, background and canvas rendering */

// Main P5.js file — contains setup() and draw(), the core game loop

let spritesheet;
let player;

function preload() {
  spritesheet = loadImage('assets/sprites/player/tilemap-characters.png');
  deadImg     = loadImage('assets/sprites/player/player_dead.png');
}


function setup() {
  createCanvas(800, 400);
  player = new Player();
}

function draw() {
  background(0);
  player.display();
}