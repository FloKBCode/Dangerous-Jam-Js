class TransitionManager {
  constructor() {
    this.active = false;
    this.phase = 1;
    this.timer = 0;
    this.duration = 120;
    this.alpha = 0;
    this.onComplete = null;

    this.flashTimer = 0;
    this.flashDuration = 15;
    this.flashActive = false;
  }

  triggerTransition(toPhase, onComplete = null) {
    this.active = true;
    this.phase = toPhase;
    this.timer = 0;
    this.alpha = 0;
    this.onComplete = onComplete;
    this.flashActive = true;
    this.flashTimer = 0;
  }

  update() {
    if (this.flashActive) {
      this.flashTimer++;
      if (this.flashTimer >= this.flashDuration) {
        this.flashActive = false;
      }
    }

    if (!this.active) return;

    this.timer++;

    if (this.timer <= this.duration / 2) {
      this.alpha = map(this.timer, 0, this.duration / 2, 0, 255);
    } else {
      this.alpha = map(this.timer, this.duration / 2, this.duration, 255, 0);
    }

    if (this.timer === Math.floor(this.duration / 2) && this.onComplete) {
      this.onComplete();
    }

    if (this.timer >= this.duration) {
      this.active = false;
      this.alpha = 0;
    }
  }

  draw() {
    if (this.flashActive) {
      const flashAlpha = map(this.flashTimer, 0, this.flashDuration, 220, 0);
      push();
      noStroke();
      fill(255, 255, 255, flashAlpha);
      rect(0, 0, width, height);
      pop();
    }

    if (!this.active) return;

    push();
    noStroke();

    if (this.phase === 2) {
      fill(55, 20, 80, this.alpha);
    } else if (this.phase === 3) {
      fill(120, 0, 0, this.alpha);
    } else {
      fill(0, 0, 0, this.alpha);
    }

    rect(0, 0, width, height);
    pop();
  }

  isActive() {
    return this.active || this.flashActive;
  }
}