// PhaseManager class — controls the 3 narrative phases and their rules

class PhaseManager {
  constructor() {
    this.currentPhase = 1;

    // distance counter
    this.distance = 0;

    // phase 2 triggers after 500 frames
    this.phase2Distance = 500;

    // phase 3 triggered by reaching the hut
    this.phase3Triggered = false;

    // narrative messages
    this.phase2Message = "Why do you run... but above all, why do you stop?";
    this.phase3Message = "Nothing is safe here... Everything is your enemy.";
  }

  update(player, world, transition, ui) {
    if (player.isDead) return;

    // increment distance
    this.distance++;

    // trigger phase 2
    if (this.currentPhase === 1 && this.distance >= this.phase2Distance) {
      this.currentPhase = 2;
      transition.triggerTransition(2);
      ui.showMessage(this.phase2Message);
    }

    // show hut before phase 3
    if (this.currentPhase === 2 && !world.hutVisible &&
        this.distance >= this.phase2Distance + 300) {
      world.showHut();
    }

    // trigger phase 3 when player reaches the hut
    if (this.currentPhase === 2 && world.isHutReached(player.x)
        && !this.phase3Triggered) {
      this.phase3Triggered = true;
      this.currentPhase = 3;
      transition.triggerTransition(3);
      ui.showMessage(this.phase3Message);
    }
  }

  // check AABB collision between player and obstacle
  checkCollision(player, obstacle) {
  // reduced hitbox — more forgiving collision detection
  let margin = 8;
  return (
    player.x + margin < obstacle.x + obstacle.width  &&
    player.x + player.width - margin > obstacle.x    &&
    player.y + margin < obstacle.y + obstacle.height  &&
    player.y + player.height - margin > obstacle.y
  );
}

  // score earned per frame based on current phase
  getScoreRate() {
    if (this.currentPhase === 1) return 1;
    if (this.currentPhase === 2) return 2;
    return 3;
  }
}