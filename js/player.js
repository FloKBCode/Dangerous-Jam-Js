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
<<<<<<< HEAD
    this.isDead = false;
    this.health = 100;
    this.runFrame = 0;
    this.frameTimer = 0;
=======
    this.isDead  = false;
    this.health  = 9;

    // run animation
    this.runFrame = 0;
    this.runTimer = 0;
>>>>>>> f01ba326d9e183f7044ad84358c7e210c3ad2863
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
      this.velocityY = -7;
      this.isOnGround = false;
      soundJump.play();
    }

    this.isCrouching = (keyIsDown(DOWN_ARROW) || keyIsDown(83)) && this.isOnGround;

<<<<<<< HEAD
    if (this.isOnGround && !this.isCrouching && !this.isDead) {
      this.frameTimer++;
      if (this.frameTimer >= 8) {
        this.runFrame = this.runFrame === 0 ? 2 : 0;
        this.frameTimer = 0;
=======
    // animate run — alternate between frame 0 and 2 every 8 ticks
    if (this.isOnGround && !this.isCrouching) {
      this.runTimer++;
      if (this.runTimer >= 8) {
        this.runFrame = this.runFrame === 0 ? 1 : 0;
        this.runTimer = 0;
>>>>>>> f01ba326d9e183f7044ad84358c7e210c3ad2863
      }
    }
  }

  display() {
<<<<<<< HEAD
    if (this.isDead) {
=======
    push();
    // flip sprite horizontally — character faces right
    scale(-1, 1);
    translate(-this.x * 2 - this.width, 0);

    if (this.isDead) {
      // rotate 90° to lay the player on the ground
>>>>>>> f01ba326d9e183f7044ad84358c7e210c3ad2863
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
<<<<<<< HEAD
=======
      // on the ground — alternates between run frame 0 and 2
>>>>>>> f01ba326d9e183f7044ad84358c7e210c3ad2863
      image(spritesheet,
        this.x, this.y, 32, 32,
        this.runFrame * 25, 0 * 25, 24, 24
      );
    }

    pop();
  }
}