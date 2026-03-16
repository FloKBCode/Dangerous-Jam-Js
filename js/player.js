// Player class — handles movement, jump, crouch, health and display

class Player {
  constructor() {
    this.x       = 100;
    this.y       = 302;
    this.width   = 32;
    this.height  = 32;
    this.velocityY  = 0;
    this.gravity    = 0.6;
    this.groundY    = 290;
    this.isOnGround = false;
    this.isCrouching = false;
    this.isDead  = false;
    this.health  = 9;

    // run animation
    this.runFrame = 0;
    this.runTimer = 0;
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
      this.velocityY = -7;
      this.isOnGround = false;
      soundJump.play();
    }

    // crouch — arrow down or S key, only when on the ground
    this.isCrouching = (keyIsDown(DOWN_ARROW) || keyIsDown(83)) && this.isOnGround;

    // animate run — alternate between frame 0 and 2 every 8 ticks
    if (this.isOnGround && !this.isCrouching) {
      this.runTimer++;
      if (this.runTimer >= 8) {
        this.runFrame = this.runFrame === 0 ? 1 : 0;
        this.runTimer = 0;
      }
    }
  }

  display() {
    push();
    // flip sprite horizontally — character faces right
    scale(-1, 1);
    translate(-this.x * 2 - this.width, 0);

    if (this.isDead) {
      // rotate 90° to lay the player on the ground
      push();
      translate(this.x + 16, this.y + 16);
      rotate(HALF_PI);
      image(deadImg, -16, -16, 32, 32);
      pop();

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
      // on the ground — alternates between run frame 0 and 2
      image(spritesheet,
        this.x, this.y, 32, 32,
        this.runFrame * 25, 0 * 25, 24, 24
      );
    }

    pop();
  }
}