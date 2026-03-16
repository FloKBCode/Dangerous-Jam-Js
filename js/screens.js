<<<<<<< HEAD
class StartScreen {
  draw() {
    push();
    background(0);

    fill(255, 255, 100);
    textFont("'Press Start 2P'");
    textSize(22);
    textAlign(CENTER, CENTER);
    text("TRUST NO ONE", width / 2, height / 2 - 60);

    fill(255);
    textSize(8);
    text("Press Enter to start", width / 2, height / 2 + 10);

    fill(100);
    textSize(6);
    text("Arrow Up / Space : Jump     Arrow Down / S : Crouch", width / 2, height / 2 + 50);
    pop();
  }
}

class PauseScreen {
  draw() {
    push();
    noStroke();
    fill(0, 0, 0, 160);
    rect(0, 0, width, height);

    fill(255);
    textFont("'Press Start 2P'");
    textSize(18);
    textAlign(CENTER, CENTER);
    text("PAUSED", width / 2, height / 2 - 20);

    textSize(7);
    fill(180);
    text("Press P to resume", width / 2, height / 2 + 20);
    pop();
  }
}

class GameOverScreen {
  constructor() {
    this.score = 0;
    this.distance = 0;
    this.phase = 1;
    this.timer = 0;
    this.spotY = -height;
    this.showCorpse = false;
    this.showStats = false;
  }

  setStats(score, distance, phase) {
    this.score = score;
    this.distance = distance;
    this.phase = phase;
    this.timer = 0;
    this.spotY = -height;
    this.showCorpse = false;
    this.showStats = false;
  }

  update() {
    this.timer++;
    this.spotY = lerp(this.spotY, height / 2 - 60, 0.04);
    if (this.timer > 80) this.showCorpse = true;
    if (this.timer > 140) this.showStats = true;
  }

  draw() {
    this.update();

    push();
    background(0);

    push();
    let grad = drawingContext.createLinearGradient(width / 2, this.spotY - 80, width / 2, this.spotY + 80);
    grad.addColorStop(0, 'rgba(255,255,255,0.9)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    drawingContext.fillStyle = grad;
    drawingContext.fillRect(width / 2 - 4, this.spotY - 80, 8, 160);
    pop();

    if (this.showCorpse) {
      fill(139, 0, 0);
      noStroke();
      rect(width / 2 - 16, height / 2 - 8, 32, 16, 2);
      rect(width / 2 - 8, height / 2 - 20, 16, 14, 8);
    }

    if (this.showStats) {
      textFont("'Press Start 2P'");
      textAlign(CENTER, CENTER);
      noStroke();

      fill(200, 0, 0);
      textSize(14);
      text("GAME OVER", width / 2, height / 2 + 50);

      fill(180);
      textSize(7);
      text("SCORE    " + String(this.score).padStart(6, '0'), width / 2, height / 2 + 80);
      text("DISTANCE " + this.distance + "m", width / 2, height / 2 + 100);
      text("PHASE    " + this.phase, width / 2, height / 2 + 120);

      fill(255);
      textSize(6);
      text("Press R to restart", width / 2, height / 2 + 155);
    }
    pop();
  }
}
=======
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

>>>>>>> f01ba326d9e183f7044ad84358c7e210c3ad2863
