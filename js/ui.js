// formatScore function — converts numbers to 6-digit zero-padded strings
function formatScore(score) {
  return score.toString().padStart(6, "0");
}

// phase label variables and functions — Mariame
let phaseLabelTimer = 0;
let phaseLabelText  = "";

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

function showPhaseLabel(phase) {
  phaseLabelText  = "— PHASE " + phase + " —";
  phaseLabelTimer = 180;
}

// UI class — renders score, hearts, phase messages and game over screen
class UI {
  constructor() {
    this.score = 0;
    this.maxHP = 9;
    this.phaseMessage = "";
    this.messageTimer = 0;
    this.messageDuration = 180;
    this.messageAlpha = 0;
  }

  update(score) {
    this.score = score;
    if (this.messageTimer > 0) {
      this.messageTimer--;
      this.messageAlpha = this.messageTimer > 60
        ? 255
        : map(this.messageTimer, 0, 60, 0, 255);
    }
  }

  showMessage(msg) {
    this.phaseMessage = msg;
    this.messageTimer = this.messageDuration;
    this.messageAlpha = 255;
  }

  draw(hp, tileSheet) {
    this._drawScore();
    this._drawHearts(hp, tileSheet);
    if (this.messageTimer > 0) {
      this._drawPhaseMessage();
    }
  }

  _drawScore() {
    push();
    textFont("'Press Start 2P'");
    textSize(10);
    fill(255, 255, 100);
    noStroke();
    text("SCORE: " + formatScore(this.score), 20, 25);
    pop();
  }

  _drawHearts(hp, tileSheet) {
    const heartSize = 24;
    const startX = 20;
    const startY = 35;
    const gap = 28;
    for (let i = 0; i < 3; i++) {
      const heartHP = hp - i * 3;
      let col;
      if (heartHP >= 3) {
        col = 4;
      } else if (heartHP >= 1) {
        col = 5;
      } else {
        col = 6;
      }
      image(tileSheet,
        startX + i * gap, startY, heartSize, heartSize,
        col * 19, 2 * 19, 18, 18
      );
    }
  }

  _drawPhaseMessage() {
    push();
    textFont("'Press Start 2P'");
    textSize(9);
    textAlign(CENTER, CENTER);
    fill(0, 0, 0, this.messageAlpha * 0.7);
    noStroke();
    rectMode(CENTER);
    rect(width / 2, height / 2 - 40,
         textWidth(this.phaseMessage) + 40, 30, 4);
    fill(255, 255, 255, this.messageAlpha);
    text(this.phaseMessage, width / 2, height / 2 - 40);
    pop();
  }
}