// World.js - Manages the game world, background and ground

class World {
  constructor() {
    this.groundY = 320;
    this.scrollSpeed = 3;
    this.tileSize = 16;
    this.groundOffset = 0;
    this.treeOffset = 0;

    this.clouds = [
      { x: 80,  y: 55, w: 90,  h: 32, spd: 0.4  },
      { x: 310, y: 38, w: 65,  h: 24, spd: 0.25 },
      { x: 530, y: 72, w: 110, h: 38, spd: 0.55 },
      { x: 700, y: 48, w: 75,  h: 28, spd: 0.35 },
    ];

    this.trees = [
      { ox: 60,  h: 64 },
      { ox: 190, h: 80 },
      { ox: 370, h: 56 },
      { ox: 540, h: 72 },
      { ox: 680, h: 60 },
    ];
  }

  update() {
    // Scroll the ground to the left
    this.groundOffset -= this.scrollSpeed;
    if (this.groundOffset <= -this.tileSize) {
      this.groundOffset = 0;
    }

    // Scroll trees slower (parallax effect)
    this.treeOffset -= this.scrollSpeed * 0.5;

    // Scroll clouds
    this.clouds.forEach(c => {
      c.x -= c.spd;
      if (c.x + c.w < 0) c.x = width + 10;
    });
  }

  draw() {
    // Draw blue sky gradient (phase 1 palette)
    let sky = drawingContext.createLinearGradient(0, 0, 0, this.groundY);
    sky.addColorStop(0, '#1E88E5');
    sky.addColorStop(1, '#81D4FA');
    drawingContext.fillStyle = sky;
    drawingContext.fillRect(0, 0, width, this.groundY);

    // Draw sun
    fill(255, 245, 157, 180);
    noStroke();
    circle(width - 70, 55, 60);
    fill(255, 241, 118);
    circle(width - 70, 55, 44);

    // Draw clouds
    this.clouds.forEach(c => this.drawCloud(c));

    // Draw trees (parallax)
    this.trees.forEach(t => {
      let tx = ((t.ox + this.treeOffset) % (width + 80) + width + 80) % (width + 80) - 40;
      this.drawTree(tx, t.h);
    });

    // Draw green grass
    fill(102, 187, 106);
    noStroke();
    rect(0, this.groundY - this.tileSize, width, this.tileSize);

    // Draw brown dirt
    fill(121, 85, 72);
    rect(0, this.groundY, width, height - this.groundY);

    // Draw tile grid on ground (retro effect)
    stroke(93, 64, 55);
    strokeWeight(0.5);
    for (let x = this.groundOffset % this.tileSize; x < width; x += this.tileSize) {
      line(x, this.groundY, x, height);
    }
    for (let y = this.groundY; y < height; y += this.tileSize) {
      line(0, y, width, y);
    }

    // Draw grass tufts
    noStroke();
    fill(129, 199, 132);
    for (let x = this.groundOffset % (this.tileSize * 3); x < width; x += this.tileSize * 3) {
      rect(x + 2,  this.groundY - this.tileSize - 5, 3, 5);
      rect(x + 7,  this.groundY - this.tileSize - 7, 3, 7);
      rect(x + 14, this.groundY - this.tileSize - 4, 3, 4);
    }
  }

  drawCloud(c) {
    // Draw pixel art cloud
    fill(255, 255, 255, 224);
    noStroke();
    rect(c.x + c.w * 0.15, c.y + c.h * 0.35, c.w * 0.7,  c.h * 0.65);
    rect(c.x + c.w * 0.05, c.y + c.h * 0.45, c.w * 0.28, c.h * 0.5);
    rect(c.x + c.w * 0.28, c.y,               c.w * 0.42, c.h * 0.6);
    rect(c.x + c.w * 0.62, c.y + c.h * 0.2,  c.w * 0.33, c.h * 0.55);
  }

  drawTree(x, th) {
    // Draw trunk
    fill(93, 64, 55);
    noStroke();
    rect(x + 7, this.groundY - this.tileSize - th * 0.38, 10, th * 0.38);
    // Draw leaves (3 pixel art levels)
    fill(46, 125, 50);
    rect(x,     this.groundY - this.tileSize - th,        28, th * 0.48);
    fill(56, 142, 60);
    rect(x + 4, this.groundY - this.tileSize - th * 1.28, 20, th * 0.42);
    fill(67, 160, 71);
    rect(x + 9, this.groundY - this.tileSize - th * 1.55, 10, th * 0.35);
  }
}

