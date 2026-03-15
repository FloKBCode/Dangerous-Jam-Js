class UI {
  constructor() {
    this.score = 0;
    this.maxHealth = 100;
    this.health = 100;

    this.barX = 20;
    this.barY = 50;
    this.barWidth = 150;
    this.barHeight = 14;
    this.pixelSize = 2;

    this.scoreX = 20;
    this.scoreY = 30;

    this.phaseMessage = "";
    this.messageAlpha = 0;
    this.messageDuration = 180;
    this.messageTimer = 0;
  }

  update(score, health) {
    this.score = score;
    this.health = constrain(health, 0, this.maxHealth);

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

  draw() {
    this._drawScore();
    this._drawHealthLabel();
    this._drawHealthBar();
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
    text("SCORE: " + nf(this.score, 6), this.scoreX, this.scoreY);
    pop();
  }

  _drawHealthLabel() {
    push();
    textFont("'Press Start 2P'");
    textSize(7);
    fill(255);
    noStroke();
    text("HP", this.barX, this.barY - 4);
    pop();
  }

  _drawHealthBar() {
    const p = this.pixelSize;
    const totalBlocks = Math.floor(this.barWidth / (p * 2 + p));
    const healthRatio = this.health / this.maxHealth;
    const filledBlocks = Math.round(totalBlocks * healthRatio);

    push();
    noStroke();

    fill(50, 20, 20);
    rect(this.barX, this.barY, this.barWidth, this.barHeight, 2);

    for (let i = 0; i < totalBlocks; i++) {
      const bx = this.barX + 2 + i * (p * 3);
      const by = this.barY + 2;
      const bw = p * 2;
      const bh = this.barHeight - 4;

      if (i < filledBlocks) {
        if (healthRatio > 0.6) {
          fill(50, 220, 80);
        } else if (healthRatio > 0.3) {
          fill(255, 200, 0);
        } else {
          fill(220, 40, 40);
        }
      } else {
        fill(30, 30, 30);
      }
      rect(bx, by, bw, bh, 1);
    }

    noFill();
    stroke(180);
    strokeWeight(1);
    rect(this.barX, this.barY, this.barWidth, this.barHeight, 2);
    pop();
  }

  _drawPhaseMessage() {
    push();
    textFont("'Press Start 2P'");
    textSize(9);
    textAlign(CENTER, CENTER);

    fill(0, 0, 0, this.messageAlpha * 0.6);
    noStroke();
    rectMode(CENTER);
    rect(width / 2, height / 2 - 40, textWidth(this.phaseMessage) + 30, 28, 4);

    fill(255, 255, 255, this.messageAlpha);
    text(this.phaseMessage, width / 2, height / 2 - 40);
    pop();
  }
}