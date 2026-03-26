// PhaseManager class — controls the 3 narrative phases and their rules

class PhaseManager {
  constructor() {
    this.currentPhase    = 1;
    this.distance        = 0;
    this.phase2Distance  = 1800;
    this.phase3Triggered = false;

    // cinematic states :
    // "playing" | "pre_cinematic" | "cinematic_out" | "cinematic_black" | "cinematic_in" | "post_cinematic"
    this.cinematicState = "playing";
    this.cinematicTimer = 0;
    this.pendingPhase   = 0;

    this.phase2Message = "Why do you run... but above all, why do you stop?";
    this.phase3Message = "Nothing is safe here... Everything is your enemy.";
  }

  update(player, world, transition, ui) {
    if (player.isDead) return;

    if (this.cinematicState !== "playing") {
      this._updateCinematic(player, world, transition, ui);
      return;
    }

    this.distance++;

    // trigger phase 2
    if (this.currentPhase === 1 && this.distance >= this.phase2Distance) {
      this._startCinematic(2);
    }

    // show hut 900 frames before phase 3
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

  _startCinematic(toPhase) {
    this.cinematicState = "pre_cinematic"; // 3 sec no spawn before anything
    this.cinematicTimer = 0;
    this.pendingPhase   = toPhase;
  }

  _updateCinematic(player, world, transition, ui) {
    this.cinematicTimer++;

    // pre_cinematic : wait 180 frames (3 sec) with no spawn, world still runs
    if (this.cinematicState === "pre_cinematic") {
      if (this.cinematicTimer >= 180) {
        this.cinematicState = "cinematic_out";
        this.cinematicTimer = 0;
      }
    }

    // cinematic_out : slow down then stop world
    else if (this.cinematicState === "cinematic_out") {
      world.scrollSpeed = max(0, world.scrollSpeed - 0.12);

      if (this.cinematicTimer >= 60) {
        world.scrollSpeed   = 0;
        this.currentPhase   = this.pendingPhase;
        this.cinematicState = "cinematic_black";
        this.cinematicTimer = 0;

        if (this.pendingPhase === 2) {
          ui.showMessage(this.phase2Message);
          showPhaseLabel(2);
          if (typeof soundTransition !== 'undefined' && soundTransition.isLoaded()) soundTransition.play();
          if (typeof musicPhase1 !== 'undefined') musicPhase1.stop();
          if (typeof musicPhase2 !== 'undefined') { musicPhase2.setLoop(true); musicPhase2.play(); }
        }
        if (this.pendingPhase === 3) {
          ui.showMessage(this.phase3Message);
          showPhaseLabel(3);
          if (typeof soundTransition !== 'undefined' && soundTransition.isLoaded()) soundTransition.play();
          if (typeof musicPhase2 !== 'undefined') musicPhase2.stop();
          if (typeof musicPhase3 !== 'undefined') { musicPhase3.setLoop(true); musicPhase3.play(); }
          if (typeof soundBreathing !== 'undefined') { soundBreathing.setLoop(true); soundBreathing.play(); }
        }
      }
    }

    // cinematic_black : hold black screen 2.5 sec
    else if (this.cinematicState === "cinematic_black") {
      if (this.cinematicTimer >= 150) {
        this.cinematicState = "cinematic_in";
        this.cinematicTimer = 0;
      }
    }

    // cinematic_in : ramp speed back up
    else if (this.cinematicState === "cinematic_in") {
      let targetSpeed = this.currentPhase === 2 ? SPEED_PHASE2 : SPEED_PHASE3_MIN;
      world.scrollSpeed = lerp(world.scrollSpeed, targetSpeed, 0.05);

      if (this.cinematicTimer >= 80) {
        world.scrollSpeed   = targetSpeed;
        this.cinematicState = "post_cinematic"; // 1 sec no spawn after
        this.cinematicTimer = 0;
      }
    }

    // post_cinematic : wait 60 frames (1 sec) before re-enabling spawn
    else if (this.cinematicState === "post_cinematic") {
      if (this.cinematicTimer >= 60) {
        this.cinematicState = "playing";
        this.cinematicTimer = 0;
      }
    }
  }

  // returns true if obstacles should NOT spawn
  isSpawnBlocked() {
    return this.cinematicState === "pre_cinematic"  ||
           this.cinematicState === "cinematic_out"  ||
           this.cinematicState === "cinematic_black"||
           this.cinematicState === "cinematic_in"   ||
           this.cinematicState === "post_cinematic";
  }

  getCinematicAlpha() {
    if (this.cinematicState === "cinematic_out")    return map(this.cinematicTimer, 0, 60, 0, 255);
    if (this.cinematicState === "cinematic_black")  return 255;
    if (this.cinematicState === "cinematic_in")     return map(this.cinematicTimer, 0, 80, 255, 0);
    return 0;
  }

  isCinematic() {
    return this.cinematicState !== "playing" && this.cinematicState !== "post_cinematic";
  }

  checkCollision(player, obstacle) {
    let playerHeight = player.isCrouching ? player.height / 2 : player.height;
    let playerY      = player.isCrouching ? player.y + player.height / 2 : player.y;
    let ow     = obstacle.type === "barrier_high" ? 32 : 18;
    let oh     = obstacle.type === "barrier_high" ? 32 : 18;
    let margin = 6;

    return (
      player.x + margin             < obstacle.x + ow   &&
      player.x + player.width - margin > obstacle.x     &&
      playerY  + margin             < obstacle.y + oh   &&
      playerY  + playerHeight - margin > obstacle.y
    );
  }

  getScoreRate() {
    if (this.currentPhase === 1) return 1;
    if (this.currentPhase === 2) return 2;
    return 3;
  }
}