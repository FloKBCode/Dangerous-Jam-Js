// screens.js — start screen title, pause overlay and phase label

let phaseLabelTimer = 0;
let phaseLabelText  = "";

// draw the main title on the start screen
function drawTitle() {
  push();
  textFont("'Press Start 2P'");
  textAlign(CENTER, CENTER);
  textSize(26);
  fill(255, 60, 60);
  text("TRUST NO ONE", width / 2, height / 2 - 20);
  textSize(9);
  fill(150, 150, 150);
  text("A survival runner where nothing is safe", width / 2, height / 2 + 20);
  pop();
}

// draw semi-transparent pause overlay
function drawPauseOverlay() {
  push();
  noStroke();
  fill(0, 0, 0, 160);
  rect(0, 0, width, height);
  textFont("'Press Start 2P'");
  textAlign(CENTER, CENTER);
  textSize(20);
  fill(255);
  text("PAUSED", width / 2, height / 2 - 20);
  textSize(8);
  fill(180, 180, 180);
  text("PRESS P TO RESUME", width / 2, height / 2 + 20);
  pop();
}

// draw phase label in top right — called from sketch.js draw()
function drawPhaseLabel() {
  if (phaseLabelTimer > 0) {
    push();
    textFont("'Press Start 2P'");
    textAlign(RIGHT, TOP);
    textSize(8);
    fill(255, 255, 255, map(phaseLabelTimer, 0, 180, 0, 255));
    text(phaseLabelText, width - 20, 20);
    pop();
    phaseLabelTimer--;
  }
}

// trigger a phase label display — call from phaseManager
function showPhaseLabel(phase) {
  phaseLabelText  = "— PHASE " + phase + " —";
  phaseLabelTimer = 180;
}

