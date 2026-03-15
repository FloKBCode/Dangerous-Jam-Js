// Player class — handles movement, jump, crouch, health and display

// Player class — handles movement, jump, crouch, health and display

class Player {
  constructor() {
    this.x = 100;
    this.y = 300;
    this.width = 32;
    this.height = 32;
  }

  display() {
    fill(255);
    rect(this.x, this.y, this.width, this.height);
  }
}