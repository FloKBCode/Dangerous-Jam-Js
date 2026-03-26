// Player class — mouvement, saut, accroupissement, santé et affichage

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

    // contrôle de mort — initialisés ici pour éviter les bugs au restart
    this.deathHandled = false;
    this.deathTimer   = 0;

    // verrou cinématique — quand true, le joueur ne peut plus sauter/s'accroupir
    // mais la gravité continue de s'appliquer jusqu'à l'atterrissage
    this.locked = false;

    // sprite cinématique — si non null, affiche ce sprite au lieu de l'animation normale
    // format : { col, row } dans tilemap-characters.png
    this.cinematicSprite = null;
  }

  // Met à jour la physique et les inputs
  // lockInputs : si true, ignore les touches mais applique encore la gravité
  update(lockInputs) {
    // gravité toujours active (permet l'atterrissage naturel avant le freeze)
    this.velocityY += this.gravity;
    this.y += this.velocityY;

    if (this.y >= this.groundY) {
      this.y         = this.groundY;
      this.velocityY = 0;
      this.isOnGround = true;
    }

    if (lockInputs) {
      // inputs bloqués : pas de saut ni d'accroupissement
      this.isCrouching = false;
      return;
    }

    // saut — uniquement au sol, pas accroupi
    if ((keyIsDown(UP_ARROW) || keyIsDown(32)) && this.isOnGround && !this.isCrouching) {
      this.velocityY  = -7;
      this.isOnGround = false;
      if (typeof soundJump !== "undefined" && soundJump.isLoaded()) soundJump.play();
    }

    // accroupissement — uniquement au sol
    this.isCrouching = (keyIsDown(DOWN_ARROW) || keyIsDown(83)) && this.isOnGround;

    // animation de course
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
    // miroir horizontal — le personnage fait face à droite
    scale(-1, 1);
    translate(-this.x * 2 - this.width, 0);

    if (this.isDead) {
      // sprite mort couché (rotation 90°)
      push();
      translate(this.x + 16, this.y + 16);
      rotate(HALF_PI);
      image(deadImg, -16, -16, 32, 32);
      pop();

    } else if (this.cinematicSprite !== null) {
      // sprite cinématique fixe (ex : debout devant la cabane)
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
      // animation de course (2 frames alternées)
      image(spritesheet, this.x, this.y, 32, 32,
        this.runFrame * 25, 0 * 25, 24, 24);
    }

    pop();
  }
}
