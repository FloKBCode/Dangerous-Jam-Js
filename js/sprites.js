class SpriteManager {
  constructor() {
    this.sprites = {};
    this.animations = {};
    this.loaded = false;
  }

  preload() {
    this.sprites = {
      coin: loadImage('assets/sprites/coin.png'),
      cross: loadImage('assets/sprites/cross.png'),
      crossInverted: loadImage('assets/sprites/cross_inverted.png'),
      spike: loadImage('assets/sprites/spike.png'),
      barrierLow: loadImage('assets/sprites/barrier_low.png'),
      barrierHigh: loadImage('assets/sprites/barrier_high.png'),
      barrierWhite: loadImage('assets/sprites/barrier_white.png'),
      barrierRed: loadImage('assets/sprites/barrier_red.png'),
      mushroom: loadImage('assets/sprites/mushroom.png'),
      playerRun: loadImage('assets/sprites/player_run.png'),
      playerJump: loadImage('assets/sprites/player_jump.png'),
      playerCrouch: loadImage('assets/sprites/player_crouch.png'),
      playerDead: loadImage('assets/sprites/player_dead.png'),
    };
  }

  getSprite(name) {
    return this.sprites[name] || null;
  }
}

class CoinAnimation {
  constructor(x, y, spriteManager) {
    this.x = x;
    this.y = y;
    this.spriteManager = spriteManager;
    this.frame = 0;
    this.frameCount = 4;
    this.frameTimer = 0;
    this.frameInterval = 8;
    this.size = 16;
  }

  update() {
    this.frameTimer++;
    if (this.frameTimer >= this.frameInterval) {
      this.frame = (this.frame + 1) % this.frameCount;
      this.frameTimer = 0;
    }
  }

  draw() {
    const img = this.spriteManager.getSprite('coin');
    if (img) {
      const sx = this.frame * this.size;
      image(img, this.x, this.y, this.size, this.size, sx, 0, this.size, this.size);
    } else {
      fill(255, 255, 100);
      noStroke();
      rect(this.x, this.y, this.size, this.size);
    }
  }
}

class PlayerAnimator {
  constructor(spriteManager) {
    this.spriteManager = spriteManager;
    this.state = 'run';
    this.frame = 0;
    this.frameTimer = 0;
    this.frameInterval = 6;
    this.frameCounts = {
      run: 4,
      jump: 2,
      crouch: 2,
      dead: 1,
    };
    this.spriteWidth = 32;
    this.spriteHeight = 32;
  }

  setState(state) {
    if (this.state !== state) {
      this.state = state;
      this.frame = 0;
      this.frameTimer = 0;
    }
  }

  update() {
    this.frameTimer++;
    if (this.frameTimer >= this.frameInterval) {
      this.frame = (this.frame + 1) % (this.frameCounts[this.state] || 1);
      this.frameTimer = 0;
    }
  }

  draw(x, y) {
    const img = this.spriteManager.getSprite('player' + this.state.charAt(0).toUpperCase() + this.state.slice(1));
    if (img) {
      const sx = this.frame * this.spriteWidth;
      image(img, x, y, this.spriteWidth, this.spriteHeight, sx, 0, this.spriteWidth, this.spriteHeight);
    } else {
      fill(100, 200, 255);
      noStroke();
      if (this.state === 'crouch') {
        rect(x, y + this.spriteHeight / 2, this.spriteWidth, this.spriteHeight / 2);
      } else {
        rect(x, y, this.spriteWidth, this.spriteHeight);
      }
    }
  }
}