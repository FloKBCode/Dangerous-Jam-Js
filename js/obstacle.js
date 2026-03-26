// Obstacle class — defines obstacle types, behaviors, spawn logic and effects per phase

class Obstacle {
  constructor(type, x) {
    this.type          = type;
    this.x             = x;
    this.width         = 18;
    this.height        = 18;
    this.y             = this.getYPosition();
    this.frame         = 0;
    this.frameTimer    = 0;
    this.frameInterval = 10;
  }

  // three strict heights matching player states :
  // 302 = ground  → player does nothing
  // 270 = mid     → player must jump
  // 240 = high    → player must jump higher OR crouch (barrier_high only)
  getYPosition() {
  // barrier_high — flying enemy — player must crouch
  if (this.type === "barrier_high") return 275;

  // barrier_low — ground level — player must jump
  if (this.type === "barrier_low") return 302;

  // spike — always on the ground
  if (this.type === "spike") return 302;

  // collectibles — 3 heights :
  // 302 = ground  → player does nothing
  // 260 = mid     → player must jump to collect
  if (this.type === "coin" || this.type === "diamond_good" || this.type === "diamond_bad") {
    let heights = [302, 302, 260]; // ground twice as likely
    return heights[Math.floor(Math.random() * heights.length)];
  }

  return 302;
}

  update(speed) {
    this.x -= speed;

    // animate flying enemy wings
    if (this.type === "barrier_high") {
      this.frameTimer++;
      if (this.frameTimer >= this.frameInterval) {
        this.frame = (this.frame + 1) % 3;
        this.frameTimer = 0;
      }
    }
  }

  draw(tileSheet, characterSheet, diamondGood, diamondBad) {
    // tilemap step   = 19px (18px tile + 1px spacing)
    // character step = 25px (24px tile + 1px spacing)

    if (this.type === "coin") {
      image(tileSheet, this.x, this.y, 18, 18, 11 * 19, 7 * 19, 18, 18);

    } else if (this.type === "spike") {
      image(tileSheet, this.x, this.y, 18, 18, 8 * 19, 3 * 19, 18, 18);

    } else if (this.type === "barrier_low") {
      image(tileSheet, this.x, this.y, 18, 18, 6 * 19, 5 * 19, 18, 18);

    } else if (this.type === "barrier_high") {
      // animated flying enemy — c6/c7/c8 r2 in tilemap-characters.png
      let col = 6 + this.frame;
      image(characterSheet, this.x, this.y, 32, 32, col * 25, 2 * 25, 24, 24);

    } else if (this.type === "diamond_good") {
      image(diamondGood, this.x, this.y, 18, 18);

    } else if (this.type === "diamond_bad") {
      image(diamondBad, this.x, this.y, 18, 18);
    }
  }

  // HP and score effects — clearly balanced per phase
  getEffect(phase) {
    if (this.type === "coin") {
      // phase 1 : reward | phase 2-3 : danger
      if (phase === 1) return { hp: 0,  score: 10 };
      if (phase === 2) return { hp: -3, score: 0  };
      if (phase === 3) return { hp: -3, score: 0  };
    }
    if (this.type === "spike") {
      // phase 1 : danger | phase 2 : heals (rule inversion) | phase 3 : danger
      if (phase === 1) return { hp: -3, score: 0 };
      if (phase === 2) return { hp: 3,  score: 5 };
      if (phase === 3) return { hp: -3, score: 0 };
    }
    if (this.type === "diamond_good") {
      // phase 1 : heals | phase 2 : danger | phase 3 : heals + bonus
      if (phase === 1) return { hp: 3,  score: 0 };
      if (phase === 2) return { hp: -3, score: 0 };
      if (phase === 3) return { hp: 3,  score: 5 };
    }
    if (this.type === "diamond_bad") {
      // phase 3 only — heavy damage
      return { hp: -6, score: 0 };
    }
    if (this.type === "barrier_low" || this.type === "barrier_high") {
      // barriers always deal damage — same in every phase
      return { hp: -3, score: 0 };
    }
    return { hp: 0, score: 0 };
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }
}

// spawn obstacle based on phase with balanced weights
function spawnObstacle(phase) {
  let types;

  if (phase === 1) {
    // phase 1 — chill introduction, lots of coins
    types = [
      "coin", "coin", "coin",
      "spike",
      "diamond_good", "diamond_good",
      "barrier_low",
      "barrier_high"
    ];
  } else if (phase === 2) {
    // phase 2 — more spikes (they heal now), fewer coins (they hurt)
    // player should learn to chase spikes and avoid coins
    types = [
      "coin",
      "spike", "spike", "spike",
      "diamond_good",
      "barrier_low", "barrier_low",
      "barrier_high"
    ];
  } else {
    // phase 3 — chaos, diamond_bad introduced, high density
    types = [
      "coin",
      "spike", "spike",
      "diamond_good",
      "diamond_bad", "diamond_bad",
      "barrier_low", "barrier_low",
      "barrier_high"
    ];
  }

  return new Obstacle(types[Math.floor(Math.random() * types.length)], 820);
}