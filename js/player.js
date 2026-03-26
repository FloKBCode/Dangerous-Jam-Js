// Player class — handles movement, jump, crouch, health and display

class Player {
  constructor() {
    this.x          = 100;
    this.y          = 302;
    this.width      = 32;
    this.height     = 32;
    this.velocityY  = 0;
    this.gravity    = 0.6;
    this.groundY    = 290;
    this.isOnGround = false;
    this.isCrouching = false;
    this.isDead      = false;
    this.health      = 9;
    this.runFrame    = 0;
    this.frameTimer  = 0;

    // death control — initialized here to avoid bugs on restart
    this.deathHandled = false;
    this.deathTimer   = 0;

    // cinematic lock — when true, player cannot jump or crouch
    // but gravity still applies until landing
    this.locked = false;

    // cinematic sprite — if not null, displays this sprite instead of the normal animation
    // format: { col, row } in tilemap-characters.png
    this.cinematicSprite = null;
  }

  // Updates physics and inputs
  // lockInputs: if true, ignores key input but still applies gravity
  update(lockInputs) {
    // gravity always active (allows natural landing before freeze)
    this.velocityY += this.gravity;
    this.y += this.velocityY;

    if (this.y >= this.groundY) {
      this.y         = this.groundY;
      this.velocityY = 0;
      this.isOnGround = true;
    }

    if (lockInputs) {
      // inputs locked: no jump or crouch
      this.isCrouching = false;
      return;
    }

    // jump — only when on ground and not crouching
    if ((keyIsDown(UP_ARROW) || keyIsDown(32)) && this.isOnGround && !this.isCrouching) {
      this.velocityY  = -7;
      this.isOnGround = false;
      if (typeof soundJump !== "undefined" && soundJump.isLoaded()) soundJump.play();
    }

    // crouch — only when on ground
    this.isCrouching = (keyIsDown(DOWN_ARROW) || keyIsDown(83)) && this.isOnGround;

    // run animation
    if (this.isOnGround && !this.isCrouching && !this.isDead) {
      this.frameTimer++;
      if (this.frameTimer >= 8) {
        this.runFrame   = this.runFrame === 0 ? 1 : 0;
        this.frameTimer = 0;
      }
    }
  }

  display() {
    push();
    // flip sprite horizontally — character faces right
    scale(-1, 1);
    translate(-this.x * 2 - this.width, 0);

    if (this.isDead) {
      // dead sprite lying down (90° rotation)
      push();
      translate(this.x + 16, this.y + 16);
      rotate(HALF_PI);
      image(deadImg, -16, -16, 32, 32);
      pop();

    } else if (this.cinematicSprite !== null) {
      // fixed cinematic sprite (e.g. standing in front of the hut)
      let c = this.cinematicSprite.col;
      let r = this.cinematicSprite.row;
      image(characterSheet, this.x, this.y, 32, 32,
        c * 25, r * 25, 24, 24);

    } else if (this.isCrouching) {
      image(spritesheet, this.x, this.y, 32, 32,
        1 * 25, 0 * 25, 24, 24);

    } else if (!this.isOnGround) {
      image(spritesheet, this.x, this.y, 32, 32,
        1 * 25, 0 * 25, 24, 24);

    } else {
      // run animation (2 alternating frames)
      image(spritesheet, this.x, this.y, 32, 32,
        this.runFrame * 25, 0 * 25, 24, 24);
    }

    pop();
  }
}