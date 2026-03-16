// World class — manages scrolling background, ground and decorative elements

class World {
  constructor() {
    this.groundY    = 320;
    this.scrollSpeed = 5;
    this.tileSize   = 18;

    // ground offset for scrolling tiles
    this.groundOffset = 0;

    // parallax offset — background moves slower than ground
    this.bgOffset = 0;

    // clouds
    this.clouds = [
      { x: 80,  y: 40,  w: 90,  h: 30, spd: 0.3  },
      { x: 300, y: 25,  w: 70,  h: 24, spd: 0.2  },
      { x: 520, y: 55,  w: 110, h: 35, spd: 0.4  },
      { x: 700, y: 30,  w: 80,  h: 28, spd: 0.25 },
    ];

    // hut — appears at the end of phase 2 to trigger phase 3
    this.hutX       = 900;
    this.hutVisible = false;
  }

  update(phase) {
    // scroll ground
    this.groundOffset -= this.scrollSpeed;
    if (this.groundOffset <= -this.tileSize) {
      this.groundOffset = 0;
    }

    // parallax — background moves at 20% of scroll speed
    this.bgOffset -= this.scrollSpeed * 0.2;

    // scroll clouds
    this.clouds.forEach(c => {
      c.x -= c.spd;
      if (c.x + c.w < 0) c.x = width + 10;
    });

    // move hut into view at end of phase 2
    if (this.hutVisible) {
      this.hutX -= this.scrollSpeed;
    }
  }

  // show the hut to trigger phase 3 transition
  showHut() {
    this.hutVisible = true;
    this.hutX = 900;
  }

  // returns true when player reaches the hut
  isHutReached(playerX) {
    return this.hutVisible && this.hutX <= playerX + 40;
  }

  draw(phase, bgImg, sunImg, moonImg, hutImg, tileSheet) {
    this._drawSky(phase);
    this._drawBackground(phase, bgImg);
    this._drawCelestialBody(phase, sunImg, moonImg);
    this.clouds.forEach(c => this._drawCloud(c, phase));
    if (this.hutVisible) this._drawHut(hutImg);
    this._drawGround(phase, tileSheet);
  }

  // sky — two flat rects instead of line-by-line for performance
  _drawSky(phase) {
    let topColor, bottomColor;

    if (phase === 1) {
      topColor    = color(30, 100, 200);
      bottomColor = color(120, 190, 255);
    } else if (phase === 2) {
      topColor    = color(20, 10, 60);
      bottomColor = color(60, 30, 100);
    } else {
      topColor    = color(80, 0, 0);
      bottomColor = color(180, 30, 30);
    }

    noStroke();
    fill(topColor);
    rect(0, 0, width, this.groundY / 2);
    fill(bottomColor);
    rect(0, this.groundY / 2, width, this.groundY / 2);
  }

  // background forest with parallax and phase tint
  _drawBackground(phase, bgImg) {
    if (phase === 1)      tint(255);
    else if (phase === 2) tint(60, 60, 120);
    else                  tint(180, 30, 30);

    let x = this.bgOffset % width;
    image(bgImg, x, 0, width, this.groundY);
    image(bgImg, x + width, 0, width, this.groundY);
    noTint();
  }

  // sun phase 1 — moon phase 2 — red moon phase 3
  _drawCelestialBody(phase, sunImg, moonImg) {
    if (phase === 1) {
      image(sunImg, width - 90, 20, 60, 60);
    } else if (phase === 2) {
      tint(255);
      image(moonImg, width - 90, 20, 60, 60);
      noTint();
    } else {
      tint(220, 40, 40);
      image(moonImg, width - 90, 20, 60, 60);
      noTint();
    }
  }

  // pixel art cloud drawn in P5.js
  _drawCloud(c, phase) {
    let alpha = phase === 1 ? 220 : phase === 2 ? 120 : 80;
    fill(255, 255, 255, alpha);
    noStroke();
    rect(c.x + c.w * 0.15, c.y + c.h * 0.35, c.w * 0.7,  c.h * 0.65);
    rect(c.x + c.w * 0.05, c.y + c.h * 0.45, c.w * 0.28, c.h * 0.5);
    rect(c.x + c.w * 0.28, c.y,               c.w * 0.42, c.h * 0.6);
    rect(c.x + c.w * 0.62, c.y + c.h * 0.2,  c.w * 0.33, c.h * 0.55);
  }

  // hut with warm yellow glow
  _drawHut(hutImg) {
    noStroke();
    fill(255, 220, 50, 60);
    ellipse(this.hutX + 40, this.groundY - 30, 120, 80);
    image(hutImg, this.hutX, this.groundY - 80, 80, 80);
  }

  // two-layer scrolling ground — grass on top, dirt below
  _drawGround(phase, tileSheet) {
    if (phase === 1)      tint(255);
    else if (phase === 2) tint(80, 80, 120);
    else                  tint(160, 30, 30);

    // first row — grass tile c0 r0
    for (let x = this.groundOffset; x < width + this.tileSize; x += this.tileSize) {
      image(tileSheet,
        x, this.groundY, this.tileSize, this.tileSize,
        2 * 19, 1 * 19, 18, 18
      );
    }

    // fill to bottom of canvas — dirt tile c0 r6
    for (let y = this.groundY + this.tileSize; y < height; y += this.tileSize) {
      for (let x = this.groundOffset; x < width + this.tileSize; x += this.tileSize) {
        image(tileSheet,
          x, y, this.tileSize, this.tileSize,
          2 * 19, 6 * 19, 18, 18
        );
      }
    }

    noTint();
  }
}

