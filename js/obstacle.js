// Obstacle class + dynamic spawn system using waves and patterns

class Obstacle {
  constructor(type, x) {
    this.type          = type;
    this.x             = x;
    this.width         = 18;
    this.height        = 18;
    this.y             = this.getYPosition();
    this.baseY         = this.y;

    // flying enemy wing animation
    this.frame         = 0;
    this.frameTimer    = 0;
    this.frameInterval = 10;

    // coin rotation — alternates between 2 sprites
    this.coinPhase    = 0;
    this.coinTimer    = 0;
    this.coinInterval = 10;

    // diamond floating effect
    this.floatSeed = Math.random() * Math.PI * 2;
  }

  getYPosition() {
    if (this.type === "barrier_high") return 275;
    if (this.type === "barrier_low")  return 302;
    if (this.type === "spike")        return 302;
    if (this.type === "coin" || this.type === "diamond_good" || this.type === "diamond_bad") {
      let heights = [302, 302, 260];
      return heights[Math.floor(Math.random() * heights.length)];
    }
    return 302;
  }

  update(speed) {
    this.x -= speed;

    if (this.type === "barrier_high") {
      this.frameTimer++;
      if (this.frameTimer >= this.frameInterval) {
        this.frame = (this.frame + 1) % 3;
        this.frameTimer = 0;
      }
    }

    if (this.type === "coin") {
      this.coinTimer++;
      if (this.coinTimer >= this.coinInterval) {
        this.coinPhase = (this.coinPhase + 1) % 4;
        this.coinTimer = 0;
      }
    }

    if (this.type === "diamond_good" || this.type === "diamond_bad") {
      this.y = this.baseY + sin(frameCount * 0.06 + this.floatSeed) * 4;
    }
  }

  draw(tileSheet, characterSheet, diamondGood, diamondBad) {
    if (this.type === "coin") {
      this._drawCoin(tileSheet);
    } else if (this.type === "spike") {
      image(tileSheet, this.x, this.y, 18, 18, 8 * 19, 3 * 19, 18, 18);
    } else if (this.type === "barrier_low") {
      image(tileSheet, this.x, this.y, 18, 18, 6 * 19, 5 * 19, 18, 18);
    } else if (this.type === "barrier_high") {
      let col = 6 + this.frame;
      image(characterSheet, this.x, this.y, 32, 32, col * 25, 2 * 25, 24, 24);
    } else if (this.type === "diamond_good") {
      image(diamondGood, this.x, this.y, 18, 18);
    } else if (this.type === "diamond_bad") {
      image(diamondBad, this.x, this.y, 18, 18);
    }
  }

  // Alternates between front sprite (row7,col11) and side sprite (row7,col12)
  _drawCoin(tileSheet) {
    push();
    if (this.coinPhase === 0 || this.coinPhase === 1) {
      image(tileSheet, this.x, this.y, 18, 18, 11 * 19, 7 * 19, 18, 18);
    } else {
      image(tileSheet, this.x, this.y, 18, 18, 12 * 19, 7 * 19, 18, 18);
    }
    pop();
  }

  getEffect(phase) {
    if (this.type === "coin") {
      if (phase === 1) return { hp:  0, score: 10 };
      if (phase === 2) return { hp: -2, score: 0  };
      if (phase === 3) return { hp: -2, score: 0  };
    }
    if (this.type === "spike") {
      if (phase === 1) return { hp: -2, score: 0 };
      if (phase === 2) return { hp:  2, score: 5 };
      if (phase === 3) return { hp: -2, score: 0 };
    }
    if (this.type === "diamond_good") {
      if (phase === 1) return { hp:  2, score: 0 };
      if (phase === 2) return { hp: -2, score: 0 };
      if (phase === 3) return { hp:  2, score: 5 };
    }
    if (this.type === "diamond_bad") {
      if (phase === 3) return { hp: -3, score: 0 };
      return { hp: 0, score: 0 };
    }
    if (this.type === "barrier_low" || this.type === "barrier_high") {
      return { hp: -2, score: 0 };
    }
    return { hp: 0, score: 0 };
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }
}

// ── Dynamic spawn system using waves and patterns ─────────────────────────────
//
// A "pattern" is a sequence of obstacles spaced with a delay between each.
// A "wave" = 1 to 3 consecutive patterns, then a pause.
//
// Structure: SpawnManager manages a queue of patterns to execute.

class SpawnManager {
  constructor() {
    this.queue      = [];  // queue of { type, delay } to spawn
    this.queueTimer = 0;   // timer between two spawns in the queue
    this.waveTimer  = 0;   // timer between two waves
    this.wavePause  = 0;   // pause duration between waves (frames)
    this.inWave     = false;
    this.lastType   = null; // prevents two of the same type in a row
  }

  // Called every frame — returns an array of obstacles to spawn (usually empty)
  update(phase, scrollSpeed) {
    let toSpawn = [];

    // if queue is active: execute it
    if (this.queue.length > 0) {
      this.queueTimer++;
      if (this.queueTimer >= this.queue[0].delay) {
        let entry = this.queue.shift();
        this.queueTimer = 0;
        toSpawn.push(new Obstacle(entry.type, 820));
        this.lastType = entry.type;
      }
      return toSpawn;
    }

    // queue empty: wait for the inter-wave pause to end
    this.waveTimer++;
    // pause adapts to phase and speed (faster = shorter pause)
    let basePause = phase === 1 ? 110 : phase === 2 ? 85 : 65;
    basePause = Math.round(basePause * (3.5 / scrollSpeed)); // adaptive
    basePause = Math.max(40, basePause); // minimum 40 frames

    if (this.waveTimer >= basePause) {
      this.waveTimer = 0;
      this._buildWave(phase);
    }

    return toSpawn;
  }

  // Builds a wave of patterns based on the current phase
  _buildWave(phase) {
    // picks a random pattern from those available for this phase
    let patterns = this._getPatternsForPhase(phase);
    let pattern  = patterns[Math.floor(Math.random() * patterns.length)];
    this.queue   = pattern;
  }

  // Patterns by phase — each entry: { type, delay }
  // delay = frames before spawning THIS type after the previous one
  _getPatternsForPhase(phase) {
    if (phase === 1) {
      return [
        // single coin on the ground
        [{ type: "coin",         delay: 0 }],
        // ground + air close together
        [{ type: "coin",         delay: 0 }, { type: "diamond_good", delay: 45 }],
        // two ground obstacles side by side
        [{ type: "spike",        delay: 0 }, { type: "barrier_low",  delay: 30 }],
        // one on the ground (player must jump)
        [{ type: "barrier_low",  delay: 0 }],
        // one up high (player must crouch)
        [{ type: "barrier_high", delay: 0 }],
        // collectible followed by a trap
        [{ type: "diamond_good", delay: 0 }, { type: "spike",        delay: 55 }],
        // triple coins spaced out
        [{ type: "coin",         delay: 0 }, { type: "coin",         delay: 40 }, { type: "coin", delay: 40 }],
        // ground then air
        [{ type: "barrier_low",  delay: 0 }, { type: "barrier_high", delay: 60 }],
      ];
    } else if (phase === 2) {
      return [
        // spike burst (they heal now!)
        [{ type: "spike",        delay: 0 }, { type: "spike",        delay: 35 }],
        // trap: coin (danger) followed by spike (heal)
        [{ type: "coin",         delay: 0 }, { type: "spike",        delay: 50 }],
        // barriers + spike
        [{ type: "barrier_low",  delay: 0 }, { type: "spike",        delay: 45 }],
        // double barrier
        [{ type: "barrier_low",  delay: 0 }, { type: "barrier_high", delay: 55 }],
        // triple spike
        [{ type: "spike",        delay: 0 }, { type: "spike",        delay: 40 }, { type: "spike", delay: 40 }],
        // diamond trap (hurts in phase 2)
        [{ type: "diamond_good", delay: 0 }, { type: "barrier_low",  delay: 50 }],
        // isolated coin trap
        [{ type: "coin",         delay: 0 }],
        // ground/air alternation
        [{ type: "barrier_high", delay: 0 }, { type: "spike",        delay: 50 }],
      ];
    } else {
      // phase 3 — maximum chaos
      return [
        // ambush diamond_bad
        [{ type: "diamond_bad",  delay: 0 }],
        // double diamond_bad
        [{ type: "diamond_bad",  delay: 0 }, { type: "diamond_bad",  delay: 40 }],
        // diamond_bad + barrier
        [{ type: "diamond_bad",  delay: 0 }, { type: "barrier_low",  delay: 45 }],
        // triple close obstacles
        [{ type: "barrier_low",  delay: 0 }, { type: "spike",        delay: 35 }, { type: "barrier_high", delay: 40 }],
        // spike rain
        [{ type: "spike",        delay: 0 }, { type: "spike",        delay: 30 }, { type: "spike", delay: 30 }],
        // coin trap + diamond_bad
        [{ type: "coin",         delay: 0 }, { type: "diamond_bad",  delay: 50 }],
        // barrier burst
        [{ type: "barrier_high", delay: 0 }, { type: "barrier_low",  delay: 45 }, { type: "barrier_high", delay: 45 }],
        // diamond_good heal + immediate trap
        [{ type: "diamond_good", delay: 0 }, { type: "diamond_bad",  delay: 40 }],
      ];
    }
  }

  reset() {
    this.queue      = [];
    this.queueTimer = 0;
    this.waveTimer  = 0;
    this.lastType   = null;
  }
}