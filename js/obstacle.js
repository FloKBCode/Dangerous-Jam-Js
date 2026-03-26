// formatScore — converts a number to a 6-digit zero-padded string
function formatScore(score) {
  return score.toString().padStart(6, "0");
}

// UI class — score, hearts, multiplier, collision popups, phase messages
class UI {
  constructor() {
    this.score           = 0;
    this.maxHP           = 9;
    this.phaseMessage    = "";
    this.messageTimer    = 0;
    this.messageDuration = 180;
    this.messageAlpha    = 0;

    // collision popups positioned on the touched obstacle
    // each popup: { x, y, text, color, timer, maxTimer }
    this.popups = [];
  }

  update(score) {
    this.score = score;

    // phase message countdown
    if (this.messageTimer > 0) {
      this.messageTimer--;
      this.messageAlpha = this.messageTimer > 60
        ? 255
        : map(this.messageTimer, 0, 60, 0, 255);
    }

    // popup update: rises and fades out
    for (let i = this.popups.length - 1; i >= 0; i--) {
      this.popups[i].timer--;
      this.popups[i].y -= 0.6; // floats upward slowly
      if (this.popups[i].timer <= 0) this.popups.splice(i, 1);
    }
  }

  showMessage(msg) {
    this.phaseMessage = msg;
    this.messageTimer = this.messageDuration;
    this.messageAlpha = 255;
  }

  // Adds a feedback popup at the position of the touched obstacle
  // type: "damage" | "heal" | "score"
  addPopup(x, y, text, type) {
    let col;
    if (type === "damage") col = color(255, 60, 60);
    else if (type === "heal") col = color(80, 255, 120);
    else col = color(255, 220, 0); // score

    this.popups.push({
      x:        x + 9,  // centered on obstacle (18px wide)
      y:        y - 4,  // slightly above
      text:     text,
      col:      col,
      timer:    45,
      maxTimer: 45
    });
  }

  draw(hp, tileSheet, phase) {
    this._drawScore(phase);
    this._drawHearts(hp, tileSheet);
    this._drawPopups();
    if (this.messageTimer > 0) this._drawPhaseMessage();
    this._drawSoundButton();
  }

  // Sound/mute icon in bottom right — press M to toggle
  _drawSoundButton() {
    push();
    textFont("'Press Start 2P'");
    textAlign(RIGHT, BOTTOM);
    textSize(7);
    noStroke();

    // reads isMuted from the global variable in sketch.js
    let muted = (typeof isMuted !== "undefined") ? isMuted : false;

    if (muted) {
      // mute icon: red strikethrough
      fill(255, 60, 60, 200);
      text("M MUTED", width - 12, height - 10);
      // red strikethrough line
      stroke(255, 60, 60, 200);
      strokeWeight(1);
      line(width - 58, height - 18, width - 48, height - 10);
    } else {
      // sound icon: subtle green
      fill(80, 200, 80, 140);
      text("M  SOUND", width - 12, height - 10);
    }
    pop();
  }

  // Score display in top left
  _drawScore(phase) {
    push();
    textFont("'Press Start 2P'");
    textSize(10);
    fill(255, 255, 100);
    noStroke();
    text("SCORE: " + formatScore(this.score), 20, 25);
    pop();
  }

  // 3 hearts (each worth 3 HP) drawn from the tilemap
  _drawHearts(hp, tileSheet) {
    const heartSize = 24;
    const startX    = 20;
    const startY    = 35;
    const gap       = 28;

    for (let i = 0; i < 3; i++) {
      const heartHP = hp - i * 3;
      let col;
      if (heartHP >= 3)      col = 4; // full heart
      else if (heartHP >= 1) col = 5; // half heart
      else                   col = 6; // empty heart

      image(tileSheet,
        startX + i * gap, startY, heartSize, heartSize,
        col * 19, 2 * 19, 18, 18
      );
    }
  }

  // Floating feedback popups above touched objects
  _drawPopups() {
    push();
    textFont("'Press Start 2P'");
    textSize(8);
    textAlign(CENTER);
    noStroke();

    for (let p of this.popups) {
      // fade out in the last third of lifetime
      let alpha = p.timer > p.maxTimer * 0.4
        ? 255
        : map(p.timer, 0, p.maxTimer * 0.4, 0, 255);

      let c = p.col;
      fill(red(c), green(c), blue(c), alpha);
      text(p.text, p.x, p.y);
    }

    pop();
  }

  // Narrative phase transition message (centered, semi-transparent background)
  _drawPhaseMessage() {
    push();
    textFont("'Press Start 2P'");
    textSize(9);
    textAlign(CENTER, CENTER);
    let msgWidth = textWidth(this.phaseMessage) + 40;

    fill(0, 0, 0, this.messageAlpha * 0.7);
    noStroke();
    rectMode(CENTER);
    rect(width / 2, height / 2 - 40, msgWidth, 30, 4);

    fill(255, 255, 255, this.messageAlpha);
    text(this.phaseMessage, width / 2, height / 2 - 40);
    pop();
  }

  // ── Leaderboard ───────────────────────────────────────

  saveScore(score) {
    let scores = JSON.parse(localStorage.getItem("tno_scores") || "[]");
    scores.push(score);
    scores.sort((a, b) => b - a);
    scores = scores.slice(0, 5);
    localStorage.setItem("tno_scores", JSON.stringify(scores));
  }

  getTopScores() {
    return JSON.parse(localStorage.getItem("tno_scores") || "[]");
  }

  getBestScore() {
    let scores = this.getTopScores();
    return scores.length > 0 ? scores[0] : 0;
  }

  drawLeaderboard(x, y) {
    let scores = this.getTopScores();
    push();
    textFont("'Press Start 2P'");
    textAlign(CENTER);
    textSize(11);
    fill(255, 255, 100);
    text("— TOP 5 —", x, y);
    fill(180, 180, 180);
    for (let i = 0; i < scores.length; i++) {
      text((i + 1) + ".  " + formatScore(scores[i]), x, y + 24 + i * 22);
    }
    pop();
  }
}