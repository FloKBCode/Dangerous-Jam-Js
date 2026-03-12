<<<<<<< Updated upstream
class Obstacle {
  constructor(x, type, phase) {
    this.x = x;
    this.type = type; // "coin", "spike", "cross", "barrier_high", "barrier_low"
    this.phase = phase;
    this.width = 16;
    this.height = 16;
    this.y = this.getYPosition();
  }

  // Set vertical position based on obstacle type
  getYPosition() {
    if (this.type === "barrier_high") return 200; // player must crouch
    if (this.type === "barrier_low") return 320;  // player must jump
    return 320; // ground level for others
  }

  // Move obstacle from right to left
  update(speed) {
    this.x -= speed;
  }

  // Draw obstacle on canvas
  draw() {
    push();
    fill(this.getColor());
    noStroke();
    rect(this.x, this.y, this.width, this.height);
    pop();
  }

  // Get color based on type
  getColor() {
    const colors = {
      coin: "#FFF176",
      spike: "#FF5252",
      cross: "#69F0AE",
      barrier_high: "#8D6E63",
      barrier_low: "#8D6E63"
    };
    return colors[this.type] || "#FFFFFF";
  }

  // Return effect on player depending on active phase
  getEffect(phase) {
    if (phase === 1) {
      // Phase 1 - normal rules
      if (this.type === "coin")         return { hp: 0,   score: 10 };
      if (this.type === "spike")        return { hp: -20, score: 0 };
      if (this.type === "cross")        return { hp: 20,  score: 0 };
      if (this.type === "barrier_high") return { hp: -20, score: 0 };
      if (this.type === "barrier_low")  return { hp: -20, score: 0 };
    }

    if (phase === 2) {
      // Phase 2 - rules are inverted
      if (this.type === "coin")         return { hp: -20, score: 0 };
      if (this.type === "spike")        return { hp: 20,  score: 0 };
      if (this.type === "cross")        return { hp: 0,   score: 0 };
      if (this.type === "barrier_high") return { hp: -20, score: 0 };
      if (this.type === "barrier_low")  return { hp: -20, score: 0 };
    }

    return { hp: 0, score: 0 };
  }

  // Check if obstacle is off screen
  isOffScreen() {
    return this.x + this.width < 0;
  }
}

// Randomly spawn a new obstacle based on current phase
function spawnObstacle(phase) {
  const types = ["coin", "spike", "cross", "barrier_high", "barrier_low"];
  const randomType = types[Math.floor(Math.random() * types.length)];
  return new Obstacle(800, randomType, phase);
}
=======
>>>>>>> Stashed changes
