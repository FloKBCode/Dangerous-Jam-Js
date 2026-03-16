// Obstacle class — defines obstacle types, behaviors, spawn logic and effects per phase

class Obstacle {
  constructor(type, x) {
    this.type        = type;
    this.x           = x;
    this.width       = 18;
    this.height      = 18;
    this.y           = this.getYPosition();
    this.frame       = 0;
    this.frameTimer  = 0;
    this.frameInterval = 10;
  }

  // set vertical position — collectibles vary in height
  getYPosition() {
    if (this.type === "barrier_high") return 275;

    // collectibles spawn at varied heights for more challenge
    if (this.type === "coin" || this.type === "diamond_good" || this.type === "diamond_bad") {
      let heights = [302, 280, 260]; // ground / mid / high
      return heights[Math.floor(Math.random() * heights.length)];
    }

    return 302; // ground level for spikes and barriers
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
    // tilemap step   = 19px (18px + 1px spacing)
    // character step = 25px (24px + 1px spacing)

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

  getEffect(phase) {
    if (this.type === "coin") {
      if (phase === 1) return { hp: 0,  score: 10 };
      if (phase === 2) return { hp: -3, score: 0  };
      if (phase === 3) return { hp: -3, score: 0  };
    }
    if (this.type === "spike") {
      if (phase === 1) return { hp: -3, score: 0 };
      if (phase === 2) return { hp: 3,  score: 5 };
      if (phase === 3) return { hp: -3, score: 0 };
    }
    if (this.type === "diamond_good") {
      if (phase === 1) return { hp: 3,  score: 0 };
      if (phase === 2) return { hp: -3, score: 0 };
      if (phase === 3) return { hp: 3,  score: 5 };
    }
    if (this.type === "diamond_bad") {
      return { hp: -6, score: 0 };
    }
    if (this.type === "barrier_low" || this.type === "barrier_high") {
      return { hp: -3, score: 0 };
    }
    return { hp: 0, score: 0 };
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }
}

// spawn obstacle based on phase — chains certain obstacles
function spawnObstacle(phase) {
  let types;

  if (phase === 1) {
    types = ["coin", "coin", "spike", "diamond_good", "barrier_low", "barrier_high"];
  } else if (phase === 2) {
    // more spikes and barriers in phase 2
    types = ["coin", "spike", "spike", "diamond_good", "barrier_low", "barrier_high", "barrier_high"];
  } else {
    // phase 3 — more danger, diamond_bad appears more often
    types = ["coin", "spike", "diamond_good", "diamond_bad", "diamond_bad",
             "barrier_low", "barrier_high", "barrier_low"];
  }

  const randomType = types[Math.floor(Math.random() * types.length)];
  return new Obstacle(randomType, 820);
}