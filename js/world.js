// World class — manages scrolling background, ground and decorative elements

class World {
  constructor() {
    this.groundY     = 320;
    this.scrollSpeed = 5;
    this.tileSize    = 18;

    // ground scrolling — synced with scrollSpeed (same speed as obstacles)
    this.groundOffset = 0;

    // background parallax — 25% of ground speed
    this.bgOffset = 0;

    // clouds
    this.clouds = [
      { x: 80,  y: 40,  w: 90,  h: 30, spd: 0.3  },
      { x: 300, y: 25,  w: 70,  h: 24, spd: 0.2  },
      { x: 520, y: 55,  w: 110, h: 35, spd: 0.4  },
      { x: 700, y: 30,  w: 80,  h: 28, spd: 0.25 },
    ];

    // hut — phase 3 trigger
    this.hutX       = 900;
    this.hutVisible = false;
  }

  update(phase) {
    // ground scrolls at the same speed as obstacles
    this.groundOffset -= this.scrollSpeed;
    if (this.groundOffset <= -this.tileSize) {
      this.groundOffset += this.tileSize; // clean wrap
    }

    // background parallax — 25% of ground speed
    this.bgOffset -= this.scrollSpeed * 0.25;

    // clouds adapt their speed to scrollSpeed
    this.clouds.forEach(c => {
      c.x -= c.spd * (this.scrollSpeed / 3.5);
      if (c.x + c.w < 0) c.x = width + 10;
    });

    // hut
    if (this.hutVisible) {
      this.hutX -= this.scrollSpeed;
    }
  }

  showHut() {
    this.hutVisible = true;
    this.hutX = 900;
  }

  isHutReached(playerX) {
    return this.hutVisible && this.hutX <= playerX + 40;
  }

  draw(phase, bgImg, bgImg2, bgImg3, sunImg, moonImg, hutImg, tileSheet) {
    this._drawSky(phase);
    this._drawBackground(phase, bgImg, bgImg2, bgImg3);
    this._drawCelestialBody(phase, sunImg, moonImg);
    this.clouds.forEach(c => this._drawCloud(c, phase));
    if (this.hutVisible) this._drawHut(hutImg);
    this._drawGround(phase, tileSheet);
    this._drawCRTOverlay(phase);
  }

  _drawSky(phase) {
    let topColor, bottomColor;
    if (phase === 1) {
      topColor    = color(10, 20, 80);   // saturated arcade navy blue
      bottomColor = color(30, 80, 180);
    } else if (phase === 2) {
      topColor    = color(10, 0, 40);
      bottomColor = color(40, 10, 80);
    } else {
      topColor    = color(60, 0, 0);
      bottomColor = color(140, 10, 10);
    }
    noStroke();
    fill(topColor);
    rect(0, 0, width, this.groundY / 2);
    fill(bottomColor);
    rect(0, this.groundY / 2, width, this.groundY / 2);
  }

  _drawBackground(phase, bgImg, bgImg2, bgImg3) {
    noTint();
    let img = phase === 1 ? bgImg : phase === 2 ? bgImg2 : bgImg3;
    let x = this.bgOffset % width;
    image(img, x, 0, width, this.groundY);
    image(img, x + width, 0, width, this.groundY);
  }

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

  _drawCloud(c, phase) {
    let alpha = phase === 1 ? 200 : phase === 2 ? 100 : 60;
    fill(255, 255, 255, alpha);
    noStroke();
    rect(c.x + c.w * 0.15, c.y + c.h * 0.35, c.w * 0.7,  c.h * 0.65);
    rect(c.x + c.w * 0.05, c.y + c.h * 0.45, c.w * 0.28, c.h * 0.5);
    rect(c.x + c.w * 0.28, c.y,               c.w * 0.42, c.h * 0.6);
    rect(c.x + c.w * 0.62, c.y + c.h * 0.2,  c.w * 0.33, c.h * 0.55);
  }

  _drawHut(hutImg) {
    noStroke();
    fill(255, 220, 50, 60);
    ellipse(this.hutX + 40, this.groundY - 30, 120, 80);
    image(hutImg, this.hutX, this.groundY - 80, 80, 80);
  }

  _drawGround(phase, tileSheet) {
    noTint();
    // grass row — scrolls with groundOffset
    for (let x = this.groundOffset; x < width + this.tileSize; x += this.tileSize) {
      image(tileSheet, x, this.groundY, this.tileSize, this.tileSize,
        2 * 19, 1 * 19, 18, 18);
    }
    // dirt rows below
    for (let y = this.groundY + this.tileSize; y < height; y += this.tileSize) {
      for (let x = this.groundOffset; x < width + this.tileSize; x += this.tileSize) {
        image(tileSheet, x, y, this.tileSize, this.tileSize,
          2 * 19, 6 * 19, 18, 18);
      }
    }
  }

  // CRT effect: scanlines + vignette + slight chromatic aberration on edges
  _drawCRTOverlay(phase) {
    // scanlines — one dark line every two pixels
    noStroke();
    for (let y = 0; y < height; y += 2) {
      fill(0, 0, 0, 35);
      rect(0, y, width, 1);
    }

    // rounded vignette — more intense with each phase
    let vigIntensity = phase === 1 ? 120 : phase === 2 ? 160 : 200;
    for (let i = 0; i < 5; i++) {
      let margin = i * 18;
      fill(0, 0, 0, vigIntensity / 5);
      noStroke();
      rect(margin, margin, width - margin * 2, height - margin * 2, 8);
    }

    // slight pixel noise in phase 3
    if (phase === 3) {
      randomSeed(frameCount * 7);
      for (let i = 0; i < 12; i++) {
        let nx = random(width);
        let ny = random(height);
        fill(255, 60, 60, random(40, 100));
        noStroke();
        rect(nx, ny, random(1, 3), 1);
      }
      randomSeed();
    }
  }
}