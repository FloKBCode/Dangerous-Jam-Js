// World class — manages scrolling background, ground and decorative elements

class World {
  constructor() {
    this.groundY = 320;
    this.scrollSpeed = 3;
    this.tileSize = 18;

    // ground offset for scrolling tiles
    this.groundOffset = 0;

    // parallax offsets — background moves slower than ground
    this.bgOffset = 0;      // very slow — feels far away
    this.midOffset = 0;     // medium speed — mid distance trees

    // clouds
    this.clouds = [
      { x: 80,  y: 40,  w: 90,  h: 30, spd: 0.3 },
      { x: 300, y: 25,  w: 70,  h: 24, spd: 0.2 },
      { x: 520, y: 55,  w: 110, h: 35, spd: 0.4 },
      { x: 700, y: 30,  w: 80,  h: 28, spd: 0.25 },
    ];

    // hut — appears at the end of phase 2 to trigger phase 3
    this.hutX = 900;
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
    // draw sky gradient based on phase
    this._drawSky(phase);

    // draw background forest with parallax + color filter
    this._drawBackground(phase, bgImg);

    // draw sun or moon depending on phase
    this._drawCelestialBody(phase, sunImg, moonImg);

    // draw pixel art clouds
    this.clouds.forEach(c => this._drawCloud(c, phase));

    // draw hut if visible
    if (this.hutVisible) {
      this._drawHut(hutImg);
    }

    // draw scrolling ground
    this._drawGround(phase, tileSheet);
  }

  // sky gradient — changes color per phase
  _drawSky(phase) {
    let topColor, bottomColor;

    if (phase === 1) {
      // phase 1 — bright blue sky
      topColor   = color(30, 100, 200);
      bottomColor = color(120, 190, 255);
    } else if (phase === 2) {
      // phase 2 — dark purple dusk
      topColor   = color(20, 10, 60);
      bottomColor = color(60, 30, 100);
    } else {
      // phase 3 — blood red sky
      topColor   = color(80, 0, 0);
      bottomColor = color(180, 30, 30);
    }

    // draw gradient manually line by line
    for (let y = 0; y < this.groundY; y++) {
      let inter = map(y, 0, this.groundY, 0, 1);
      let c = lerpColor(topColor, bottomColor, inter);
      stroke(c);
      line(0, y, width, y);
    }
    noStroke();
  }

  // background forest image with parallax and phase tint
  _drawBackground(phase, bgImg) {
    // tint based on phase
    if (phase === 1) {
      tint(255);                    // normal colors
    } else if (phase === 2) {
      tint(60, 60, 120);            // dark blue tint
    } else {
      tint(180, 30, 30);            // blood red tint
    }

    // draw image twice side by side for seamless loop
    let x = this.bgOffset % width;
    image(bgImg, x, 0, width, this.groundY);
    image(bgImg, x + width, 0, width, this.groundY);

    // reset tint after drawing
    noTint();
  }

  // sun in phase 1, full moon in phase 2, red moon in phase 3
  _drawCelestialBody(phase, sunImg, moonImg) {
    if (phase === 1) {
      // sun — top right corner
      image(sunImg, width - 90, 20, 60, 60);

    } else if (phase === 2) {
      // moon — normal white
      tint(255);
      image(moonImg, width - 90, 20, 60, 60);
      noTint();

    } else {
      // moon — tinted blood red
      tint(220, 40, 40);
      image(moonImg, width - 90, 20, 60, 60);
      noTint();
    }
  }

  // pixel art cloud — shape drawn in P5.js
  _drawCloud(c, phase) {
    // cloud color shifts with phase
    let alpha = phase === 1 ? 220 : phase === 2 ? 120 : 80;
    fill(255, 255, 255, alpha);
    noStroke();
    rect(c.x + c.w * 0.15, c.y + c.h * 0.35, c.w * 0.7,  c.h * 0.65);
    rect(c.x + c.w * 0.05, c.y + c.h * 0.45, c.w * 0.28, c.h * 0.5);
    rect(c.x + c.w * 0.28, c.y,               c.w * 0.42, c.h * 0.6);
    rect(c.x + c.w * 0.62, c.y + c.h * 0.2,  c.w * 0.33, c.h * 0.55);
  }

  // hut with warm yellow light glow
  _drawHut(hutImg) {
    // yellow glow behind the hut
    noStroke();
    fill(255, 220, 50, 60);
    ellipse(this.hutX + 40, this.groundY - 30, 120, 80);

    // hut image
    image(hutImg, this.hutX, this.groundY - 80, 80, 80);
  }

  // scrolling ground tiles
  // ground tile — find a grass tile in tilemap.png
  _drawGround(phase, tileSheet) {
    // ground color shifts with phase
    if (phase === 1) {
      tint(255);
    } else if (phase === 2) {
      tint(80, 80, 120);
    } else {
      tint(160, 30, 30);
    }

    for (let x = this.groundOffset; x < width + this.tileSize; x += this.tileSize) {
      // grass tile — replace c0 r0 with your actual grass tile coordinates
      image(tileSheet,
        x, this.groundY, this.tileSize, this.tileSize,
        0 * 19, 0 * 19, 18, 18
      );
    }
    noTint();
  }
}