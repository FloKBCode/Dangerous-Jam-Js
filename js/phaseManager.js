// PhaseManager — narrative phases, cinematics and game rules

class PhaseManager {
  constructor() {
    this.currentPhase    = 1;
    this.distance        = 0;

    // Phase 1 : 1800 frames
    // Phase 2 : 3600 frames (2x phase 1), hut appears 20 sec (1200f) before the end
    this.phase2Distance  = 1800;
    this.phase2Duration  = 3600;
    this.phase3Triggered = false;

    // ── State machine ──────────────────────────────────────────────────────────
    // "playing"         → normal gameplay
    // "pre_cinematic"   → spawn blocked, player FREE, obstacles scroll out
    //                     Phase 2: 7 sec (420f) | Phase 3: 20 sec (1200f)
    // "slowdown"        → everything slows down progressively (player + world)
    // "wait_landing"    → waits for isOnGround before freezing
    // "frozen"          → everything stopped, 3 sec pause then cinematic
    // "cinematic_black" → narrative animation (5 sec)
    // "cinematic_in"    → progressive resume
    // "post_cinematic"  → 5 sec before respawn
    this.cinematicState = "playing";
    this.cinematicTimer = 0;
    this.pendingPhase   = 0;

    // speed saved before slowdown (used for resume ramp)
    this.speedBeforeSlowdown = 0;

    // ── Typewriter ─────────────────────────────────────────────────────────────
    this.typewriterLines  = [];
    this.typewriterFull   = [];
    this.typewriterIndex  = 0;
    this.typewriterChar   = 0;
    this.typewriterTimer  = 0;
    this.typewriterSpeed  = 3;
    this.typewriterDone   = false;
    this.typewriterDoneAt = 0;

    this.phase2Lines = [
      "The sun has set.",
      "What kept you safe...",
      "...may now destroy you."
    ];
    this.phase3Lines = [
      "NOTHING.",
      "IS.",
      "SAFE."
    ];

    // ── Animations ────────────────────────────────────────────────────────────
    this.moonCinemaY     = 500;
    this.moonCinemaAlpha = 0;
    this.lightningTimer  = 0;
    this.lightningAlpha  = 0;
  }

  update(player, world, transition, ui) {
    if (player.isDead) return;

    if (this.cinematicState !== "playing") {
      this._updateCinematic(player, world);
      return;
    }

    this.distance++;

    // ── Trigger phase 2 ───────────────────────────────────────────────────────
    if (this.currentPhase === 1 && this.distance >= this.phase2Distance) {
      this._startCinematic(2);
      return;
    }

    // ── Phase 2 in progress ───────────────────────────────────────────────────
    // Phase 3 is triggered by distance (phase2Distance + phase2Duration)
    // The hut is spawned at the start of slowdown at the right position — not here
    if (this.currentPhase === 2) {
      let phase2Elapsed = this.distance - this.phase2Distance;
      if (phase2Elapsed >= this.phase2Duration) {
        this._startCinematic(3);
        return;
      }
    }
  }

  _startCinematic(toPhase) {
    this.cinematicState      = "pre_cinematic";
    this.cinematicTimer      = 0;
    this.pendingPhase        = toPhase;
    this.speedBeforeSlowdown = 0; // will be captured at the start of slowdown

    // reset typewriter
    this.typewriterLines  = [];
    this.typewriterFull   = toPhase === 2 ? this.phase2Lines : this.phase3Lines;
    this.typewriterIndex  = 0;
    this.typewriterChar   = 0;
    this.typewriterTimer  = 0;
    this.typewriterDone   = false;
    this.typewriterDoneAt = 0;

    if (toPhase === 2) {
      this.moonCinemaY     = 500;
      this.moonCinemaAlpha = 0;
    }
    if (toPhase === 3) {
      this.lightningTimer = 0;
      this.lightningAlpha = 0;
    }
  }

  _updateCinematic(player, world) {
    this.cinematicTimer++;

    // ── PRE_CINEMATIC ─────────────────────────────────────────────────────────
    // Phase 2: 7 sec (420f) | Phase 3: 20 sec (1200f) — already handled in update()
    // During this time: spawn blocked, player free, obstacles scroll out on their own
    if (this.cinematicState === "pre_cinematic") {
      let duration = this.pendingPhase === 2 ? 420 : 1200;
      if (this.cinematicTimer >= duration) {
        // save current speed
        this.speedBeforeSlowdown = world.scrollSpeed;
        this.cinematicState = "slowdown";
        this.cinematicTimer = 0;
      }
    }

    // ── SLOWDOWN: progressive deceleration of everything (~3 sec = 180f) ──────
    // World slows down, player too (run frames slow via scrollSpeed)
    else if (this.cinematicState === "slowdown") {
      // first frame of slowdown: spawn the hut at the right position for phase 3
      // Calculation: over 180f of deceleration from speed V to 0, distance = V/2 * 180
      // The hut must stop at playerX(100) + 60px = 160
      // So hutX initial = 160 + slowdown_distance = 160 + (speedBeforeSlowdown/2)*180
      if (this.pendingPhase === 3 && this.cinematicTimer === 1) {
        let distSlowdown = (this.speedBeforeSlowdown / 2) * 180;
        world.hutX       = 160 + distSlowdown;
        world.hutVisible = true;
      }

      // smooth deceleration over 180 frames
      world.scrollSpeed = max(0, world.scrollSpeed - (this.speedBeforeSlowdown / 180));

      if (this.cinematicTimer >= 180) {
        world.scrollSpeed = 0;
        this.cinematicState = "wait_landing";
        this.cinematicTimer = 0;
      }
    }

    // ── WAIT_LANDING: waits for player to touch the ground ───────────────────
    else if (this.cinematicState === "wait_landing") {
      if (player.isOnGround) {
        player.locked = true;
        if (this.pendingPhase === 3) {
          player.cinematicSprite = { col: 0, row: 0 };
        }
        this.cinematicState = "frozen";
        this.cinematicTimer = 0;
      }
    }

    // ── FROZEN: everything stopped, 3 sec pause (180f) ───────────────────────
    else if (this.cinematicState === "frozen") {
      // nothing moves — wait 3 seconds
      if (this.cinematicTimer >= 180) {
        this.currentPhase = this.pendingPhase;

        // music
        if (this.pendingPhase === 2) {
          if (typeof soundTransition !== "undefined" && soundTransition.isLoaded()) soundTransition.play();
          if (typeof musicPhase1 !== "undefined") musicPhase1.stop();
          if (typeof musicPhase2 !== "undefined") { musicPhase2.setLoop(true); musicPhase2.play(); }
        }
        if (this.pendingPhase === 3) {
          if (typeof soundTransition !== "undefined" && soundTransition.isLoaded()) soundTransition.play();
          if (typeof musicPhase2 !== "undefined") musicPhase2.stop();
          if (typeof musicPhase3 !== "undefined") { musicPhase3.setLoop(true); musicPhase3.play(); }
          if (typeof soundBreathing !== "undefined") { soundBreathing.setLoop(true); soundBreathing.play(); }
        }

        showPhaseLabel(this.pendingPhase);
        this.cinematicState = "cinematic_black";
        this.cinematicTimer = 0;
      }
    }

    // ── CINEMATIC_BLACK: 5 sec of animation (300f) ───────────────────────────
    else if (this.cinematicState === "cinematic_black") {
      this._updateTypewriter();

      if (this.pendingPhase === 3) {
        this._updateLightning();
        if (typeof screenshakeTimer !== "undefined" && this.cinematicTimer % 10 === 0) {
          screenshakeTimer     = 12;
          screenshakeIntensity = 3;
        }
      }

      if (this.pendingPhase === 2) {
        this.moonCinemaY     = lerp(this.moonCinemaY, 40, 0.025);
        this.moonCinemaAlpha = min(255, this.moonCinemaAlpha + 2);
      }

      if (this.cinematicTimer >= 300 && this.typewriterDone) {
        this.cinematicState = "cinematic_in";
        this.cinematicTimer = 0;
      }
    }

    // ── CINEMATIC_IN: progressive resume ─────────────────────────────────────
    else if (this.cinematicState === "cinematic_in") {
      let targetSpeed = this.currentPhase === 2 ? SPEED_PHASE2 : SPEED_PHASE3_MIN;
      world.scrollSpeed = lerp(world.scrollSpeed, targetSpeed, 0.04);

      if (this.cinematicTimer >= 100) {
        world.scrollSpeed      = targetSpeed;
        player.locked          = false;
        player.cinematicSprite = null;
        this.cinematicState    = "post_cinematic";
        this.cinematicTimer    = 0;
      }
    }

    // ── POST_CINEMATIC: 5 sec (300f) before respawn ──────────────────────────
    else if (this.cinematicState === "post_cinematic") {
      if (this.cinematicTimer >= 300) {
        this.cinematicState = "playing";
        this.cinematicTimer = 0;
      }
    }
  }

  _updateTypewriter() {
    if (this.typewriterDone) return;
    this.typewriterTimer++;
    if (this.typewriterTimer < this.typewriterSpeed) return;
    this.typewriterTimer = 0;

    let currentLine = this.typewriterFull[this.typewriterIndex];
    if (this.typewriterLines.length <= this.typewriterIndex) {
      this.typewriterLines.push("");
    }

    if (this.typewriterChar < currentLine.length) {
      this.typewriterLines[this.typewriterIndex] += currentLine[this.typewriterChar];
      this.typewriterChar++;
    } else {
      this.typewriterTimer = -40;
      this.typewriterIndex++;
      this.typewriterChar = 0;
      if (this.typewriterIndex >= this.typewriterFull.length) {
        this.typewriterDone   = true;
        this.typewriterDoneAt = this.cinematicTimer;
      }
    }
  }

  _updateLightning() {
    this.lightningTimer++;
    if (this.lightningAlpha > 0) this.lightningAlpha -= 12;
    if (this.lightningTimer % 45 === 0 && random() < 0.65) {
      this.lightningAlpha = 220;
    }
  }

  // ── Rendering ─────────────────────────────────────────────────────────────

  drawCinematic() {
    if (this.cinematicState !== "cinematic_black") return;
    if (this.pendingPhase === 2) this._drawCinematic2();
    else if (this.pendingPhase === 3) this._drawCinematic3();
  }

  _drawCinematic2() {
    noStroke();
    fill(10, 5, 40);
    rect(0, 0, width, height);

    randomSeed(42);
    fill(255, 255, 255, 180);
    noStroke();
    for (let i = 0; i < 60; i++) {
      ellipse(random(width), random(height * 0.7), random(1, 3));
    }
    randomSeed();

    if (typeof moonImg !== "undefined") {
      tint(255, this.moonCinemaAlpha);
      image(moonImg, width / 2 - 40, this.moonCinemaY, 80, 80);
      noTint();
    }

    this._drawTypewriterText(color(200, 200, 255), color(150, 130, 220));
  }

  _drawCinematic3() {
    noStroke();
    fill(30, 0, 0);
    rect(0, 0, width, height);

    for (let r = 0; r < 8; r++) {
      fill(120, 0, 0, 20 + r * 8);
      noStroke();
      rect(r * 10, r * 5, width - r * 20, height - r * 10, 4);
    }

    if (this.lightningAlpha > 0) {
      noStroke();
      fill(255, 200, 200, this.lightningAlpha);
      rect(0, 0, width, height);
    }

    this._drawTypewriterText(color(255, 60, 60), color(255, 120, 120));
  }

  _drawTypewriterText(mainColor, cursorColor) {
    push();
    textFont("'Press Start 2P'");
    textAlign(CENTER, CENTER);
    noStroke();

    let sz         = this.pendingPhase === 3 ? 22 : 12;
    let lineHeight = this.pendingPhase === 3 ? 44 : 30;
    let startY     = height / 2 - (this.typewriterFull.length * lineHeight) / 2;

    textSize(sz);

    for (let i = 0; i < this.typewriterLines.length; i++) {
      let line = this.typewriterLines[i];

      fill(0, 0, 0, 130);
      text(line, width / 2 + 2, startY + i * lineHeight + 2);

      fill(mainColor);
      text(line, width / 2, startY + i * lineHeight);

      if (i === this.typewriterIndex && !this.typewriterDone && frameCount % 30 < 15) {
        fill(cursorColor);
        text("_", width / 2 + textWidth(line) / 2 + 8, startY + i * lineHeight);
      }
    }
    pop();
  }

  // ── Getters ───────────────────────────────────────────────────────────────

  isSpawnBlocked() {
    return this.cinematicState !== "playing";
  }

  getCinematicAlpha() {
    // progressive fade during slowdown
    if (this.cinematicState === "slowdown")        return map(this.cinematicTimer, 0, 180, 0, 180);
    if (this.cinematicState === "wait_landing")    return 180;
    if (this.cinematicState === "frozen")          return map(this.cinematicTimer, 0, 180, 180, 255);
    if (this.cinematicState === "cinematic_black") return 255;
    if (this.cinematicState === "cinematic_in")    return map(this.cinematicTimer, 0, 100, 255, 0);
    return 0;
  }

  isCinematic() {
    // inputs blocked during these states
    return this.cinematicState === "frozen"          ||
           this.cinematicState === "cinematic_black" ||
           this.cinematicState === "cinematic_in";
  }

  checkCollision(player, obstacle) {
    let playerHeight = player.isCrouching ? player.height / 2 : player.height;
    let playerY      = player.isCrouching ? player.y + player.height / 2 : player.y;
    let ow     = obstacle.type === "barrier_high" ? 32 : 18;
    let oh     = obstacle.type === "barrier_high" ? 32 : 18;
    let margin = 6;

    return (
      player.x + margin               < obstacle.x + ow  &&
      player.x + player.width - margin > obstacle.x      &&
      playerY  + margin               < obstacle.y + oh  &&
      playerY  + playerHeight - margin > obstacle.y
    );
  }

  getScoreRate() {
    return 1;
  }
}