// Player class — handles movement, jump, crouch, health and display

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
  }

  update() {
    // apply gravity
    this.velocityY += this.gravity;
    this.y += this.velocityY;

    // prevent player from falling below the ground
    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.velocityY = 0;
      this.isOnGround = true;
    }

    // jump — arrow up or space bar
    if ((keyIsDown(UP_ARROW) || keyIsDown(32)) && this.isOnGround && !this.isCrouching) {
      this.velocityY = -13;
      this.isOnGround = false;
    }

    // crouch — arrow down or S key, only when on the ground
    this.isCrouching = (keyIsDown(DOWN_ARROW) || keyIsDown(83)) && this.isOnGround;
  }

  display() {
    // tile size 24px + 1px spacing = step of 25px
    // col 0 = run | col 1 = jump (reused for crouch) | deadImg = separate file

    if (this.isDead) {
      // dead sprite — separate PNG created on Piskel (24x24px)
      image(deadImg, this.x, this.y, 32, 32);

    } else if (this.isCrouching) {
      // reuse jump sprite (col 1) — player stays on the ground
      image(spritesheet,
        this.x, this.y, 32, 32,
        1 * 25, 0 * 25, 24, 24
      );
    } else if (!this.isOnGround) {
      // in the air — jump sprite (col 1)
      image(spritesheet,
        this.x, this.y, 32, 32,
        1 * 25, 0 * 25, 24, 24
      );
    } else {
      // on the ground — run sprite (col 0)
      image(spritesheet,
        this.x, this.y, 32, 32,
        0 * 25, 0 * 25, 24, 24
      );
    }
  }
}