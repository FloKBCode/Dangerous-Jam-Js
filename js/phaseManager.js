// PhaseManager class — controls the 3 narrative phases and their rules

class PhaseManager {
  constructor() {
    this.currentPhase = 1;
    this.distance     = 0;

    // phase 2 triggers after 1800 frames (~30 seconds at 60fps)
    this.phase2Distance = 1800;

    // phase 3 triggered by reaching the hut
    this.phase3Triggered = false;

    // cinematic transition state
    // states: "playing" | "cinematic_out" | "cinematic_black" | "cinematic_in"
    this.cinematicState  = "playing";
    this.cinematicTimer  = 0;
    this.pendingPhase    = 0;

    // narrative messages
    this.phase2Message = "Why do you run... but above all, why do you stop?";
    this.phase3Message = "Nothing is safe here... Everything is your enemy.";
  }

  update(player, world, transition, ui) {
    if (player.isDead) return;

    // handle cinematic sequence
    if (this.cinematicState !== "playing") {
      this._updateCinematic(player, world, transition, ui);
      return;
    }

    this.distance++;

    // trigger phase 2 transition
    if (this.currentPhase === 1 && this.distance >= this.phase2Distance) {
      this._startCinematic(2);
    }

    // show hut before phase 3
    if (this.currentPhase === 2 &&
        !world.hutVisible &&
        this.distance >= this.phase2Distance + 900) {
      world.showHut();
    }

    // trigger phase 3 when player reaches the hut
    if (this.currentPhase === 2 &&
        world.isHutReached(player.x) &&
        !this.phase3Triggered) {
      this.phase3Triggered = true;
      this._startCinematic(3);
    }
  }

  // start the cinematic black screen transition
  _startCinematic(toPhase) {
    this.cinematicState = "cinematic_out";
    this.cinematicTimer = 0;
    this.pendingPhase   = toPhase;
  }

  // cinematic sequence :
  // 0-60   : fade to black (player keeps running, world stops)
  // 60-180 : black screen — player stops, voice message shown
  // 180-240: fade back in with new phase
  _updateCinematic(player, world, transition, ui) {
    this.cinematicTimer++;

    if (this.cinematicState === "cinematic_out") {
      // slow down world during fade
      world.scrollSpeed = max(0, world.scrollSpeed - 0.08);
      if (this.cinematicTimer >= 60) {
        // switch phase at the black frame
        this.currentPhase   = this.pendingPhase;
        this.cinematicState = "cinematic_black";
        this.cinematicTimer = 0;
        world.scrollSpeed   = 0;
        if (this.pendingPhase === 2) {
          ui.showMessage(this.phase2Message);
          musicPhase1.stop();
          musicPhase2.setLoop(true);
          musicPhase2.play();
        }
        if (this.pendingPhase === 3) {
          ui.showMessage(this.phase3Message);
          musicPhase2.stop();
          musicPhase3.setLoop(true);
          musicPhase3.play();
        }
      }
    }

    if (this.cinematicState === "cinematic_black") {
      if (this.cinematicTimer >= 150) {
        this.cinematicState = "cinematic_in";
        this.cinematicTimer = 0;
      }
    }

    if (this.cinematicState === "cinematic_in") {
      // speed back up progressively
      let targetSpeed = this.currentPhase === 2 ? 5 : 7;
      world.scrollSpeed = lerp(world.scrollSpeed, targetSpeed, 0.05);
      if (this.cinematicTimer >= 60) {
        world.scrollSpeed   = targetSpeed;
        this.cinematicState = "playing";
      }
    }
  }

  // returns the cinematic overlay alpha (0-255)
  getCinematicAlpha() {
    if (this.cinematicState === "cinematic_out") {
      return map(this.cinematicTimer, 0, 60, 0, 255);
    }
    if (this.cinematicState === "cinematic_black") {
      return 255;
    }
    if (this.cinematicState === "cinematic_in") {
      return map(this.cinematicTimer, 0, 60, 255, 0);
    }
    return 0;
  }

  isCinematic() {
    return this.cinematicState !== "playing";
  }

  // check AABB collision with reduced hitbox when crouching
  checkCollision(player, obstacle) {
    let playerHeight = player.isCrouching ? player.height / 2 : player.height;
    let playerY      = player.isCrouching ? player.y + player.height / 2 : player.y;
    let ow     = obstacle.type === "barrier_high" ? 32 : 18;
    let oh     = obstacle.type === "barrier_high" ? 32 : 18;
    let margin = 6;

    return (
      player.x + margin        < obstacle.x + ow &&
      player.x + player.width - margin > obstacle.x &&
      playerY  + margin        < obstacle.y + oh &&
      playerY  + playerHeight - margin > obstacle.y
    );
  }

  // score per frame based on current phase
  getScoreRate() {
    if (this.currentPhase === 1) return 1;
    if (this.currentPhase === 2) return 2;
    return 3;
  }
}