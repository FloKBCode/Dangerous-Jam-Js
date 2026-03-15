// Obstacle class — defines obstacle types, behaviors, spawn logic and effects per phase

class Obstacle {
  constructor(type, x) {
    this.type = type;
    this.x = x;
    this.width = 18;
    this.height = 18;
    this.y = this.getYPosition();

    // flying enemy animation
    this.frame = 0;
    this.frameTimer = 0;
    this.frameInterval = 10; // change frame every 10 ticks
  }

  // set vertical position based on obstacle type
  getYPosition() {
    if (this.type === "barrier_high") return 260; // player must crouch
    return 302;                                    // ground level for all others
  }

  // move obstacle from right to left
  update(speed) {
    this.x -= speed;

    // animate flying enemy wings
    if (this.type === "barrier_high") {
      this.frameTimer++;
      if (this.frameTimer >= this.frameInterval) {
        this.frame = (this.frame + 1) % 3; // 3 frames : 0, 1, 2
        this.frameTimer = 0;
      }
    }
  }

  // draw obstacle using spritesheet coordinates
  draw(tileSheet, characterSheet, diamondGood, diamondBad) {
    // tilemap step    = 19px (18px tile + 1px spacing)
    // character step  = 25px (24px tile + 1px spacing)

    if (this.type === "coin") {
      // coin — c11 r7 in tilemap.png
      image(tileSheet, this.x, this.y, 18, 18,
        11 * 19, 7 * 19, 18, 18);

    } else if (this.type === "spike") {
      // spike — c8 r3 in tilemap.png
      image(tileSheet, this.x, this.y, 18, 18,
        8 * 19, 3 * 19, 18, 18);

    } else if (this.type === "barrier_low") {
      // low barrier — c6 r5 in tilemap.png
      image(tileSheet, this.x, this.y, 18, 18,
        6 * 19, 5 * 19, 18, 18);

    } else if (this.type === "barrier_high") {
      // flying enemy — animated — c6/c7/c8 r2 in tilemap-characters.png
      // frame 0 = wings up (c6), frame 1 = wings mid (c7), frame 2 = wings down (c8)
      let col = 6 + this.frame;
      image(characterSheet, this.x, this.y, 32, 32,
        col * 25, 2 * 25, 24, 24);

    } else if (this.type === "diamond_good") {
      // good diamond — separate Piskel file
      image(diamondGood, this.x, this.y, 18, 18);

    } else if (this.type === "diamond_bad") {
      // bad diamond — separate Piskel file, phase 3 only
      image(diamondBad, this.x, this.y, 18, 18);
    }
  }

  // return HP and score effect based on active phase
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
      // only appears in phase 3
      return { hp: -6, score: 0 };
    }
    if (this.type === "barrier_low" || this.type === "barrier_high") {
      // barriers always deal damage in every phase
      return { hp: -3, score: 0 };
    }
    return { hp: 0, score: 0 };
  }

  // return true if obstacle has scrolled off screen
  isOffScreen() {
    return this.x + this.width < 0;
  }
}

// randomly spawn an obstacle based on current phase
function spawnObstacle(phase) {
  let types;

  if (phase === 1) {
    types = ["coin", "spike", "diamond_good", "barrier_low", "barrier_high"];
  } else if (phase === 2) {
    types = ["coin", "spike", "diamond_good", "barrier_low", "barrier_high"];
  } else {
    // phase 3 — diamond_bad appears
    types = ["coin", "spike", "diamond_good", "diamond_bad", "barrier_low", "barrier_high"];
  }

  const randomType = types[Math.floor(Math.random() * types.length)];
  return new Obstacle(randomType, 820);
}