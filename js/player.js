class Player {
  constructor() {
    this.x = 100;
    this.y = 300;
    this.width = 32;
    this.height = 32;
    this.velocityY = 0;
    this.gravity = 0.6;
    this.groundY = 300;
    this.isOnGround = false;
    this.isCrouching = false;
    this.isDead = false;
    this.health = 100;
    this.runFrame = 0;
    this.frameTimer = 0;
  }

  update() {
    this.velocityY += this.gravity;
    this.y += this.velocityY;

    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.velocityY = 0;
      this.isOnGround = true;
    }

    if ((keyIsDown(UP_ARROW) || keyIsDown(32)) && this.isOnGround && !this.isCrouching) {
      this.velocityY = -13;
      this.isOnGround = false;
    }

    this.isCrouching = (keyIsDown(DOWN_ARROW) || keyIsDown(83)) && this.isOnGround;

    if (this.isOnGround && !this.isCrouching && !this.isDead) {
      this.frameTimer++;
      if (this.frameTimer >= 8) {
        this.runFrame = this.runFrame === 0 ? 2 : 0;
        this.frameTimer = 0;
      }
    }
  }

  display() {
    if (this.isDead) {
      push();
      translate(this.x + 16, this.y + 16);
      rotate(HALF_PI);
      image(deadImg, -16, -16, 32, 32);
      pop();

    } else if (this.isCrouching) {
      image(spritesheet,
        this.x, this.y, 32, 32,
        1 * 25, 0 * 25, 24, 24
      );
    } else if (!this.isOnGround) {
      image(spritesheet,
        this.x, this.y, 32, 32,
        1 * 25, 0 * 25, 24, 24
      );
    } else {
      image(spritesheet,
        this.x, this.y, 32, 32,
        this.runFrame * 25, 0 * 25, 24, 24
      );
    }
  }
}