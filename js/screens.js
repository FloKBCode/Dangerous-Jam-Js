// screens.js — Start, Pause and Game Over screens — CRT Arcade style

// Saturated CRT color palette
const CRT_YELLOW  = [255, 240, 0];
const CRT_RED     = [255, 30, 30];
const CRT_GREEN   = [0, 255, 80];
const CRT_CYAN    = [0, 220, 255];
const CRT_WHITE   = [230, 240, 220]; // slightly phosphor-tinted white
const CRT_GRAY    = [120, 140, 110];
const CRT_PURPLE  = [200, 80, 255];
const CRT_ORANGE  = [255, 140, 0];

// Draws text with a CRT phosphor glow halo
function crtText(txt, x, y, sz, r, g, b, glowAlpha) {
  let ga = glowAlpha || 60;
  textSize(sz);
  // glow halo
  fill(r, g, b, ga);
  text(txt, x + 2, y + 2);
  text(txt, x - 2, y - 2);
  text(txt, x + 2, y - 2);
  text(txt, x - 2, y + 2);
  // main text
  fill(r, g, b);
  text(txt, x, y);
}

// Horizontal arcade-style line (with glow)
function crtLine(x1, y1, x2, y2, r, g, b) {
  stroke(r, g, b, 60);
  strokeWeight(3);
  line(x1, y1, x2, y2);
  stroke(r, g, b);
  strokeWeight(1);
  line(x1, y1, x2, y2);
  noStroke();
}

// ── START SCREEN ──────────────────────────────────────────────────────────────
class StartScreen {
  constructor() {
    this.timer = 0;
  }

  draw() {
    this.timer++;
    background(2, 4, 2); // near-black with phosphor tint

    // arcade-style background grid — very subtle horizontal lines
    stroke(0, 40, 0, 40);
    strokeWeight(1);
    for (let y = 0; y < height; y += 16) {
      line(0, y, width, y);
    }
    noStroke();

    // blinking INSERT COIN at the bottom — classic arcade cabinet style
    if (this.timer % 60 < 40) {
      push();
      textFont("'Press Start 2P'");
      textAlign(CENTER, CENTER);
      crtText("INSERT COIN", width / 2, height - 24, 7,
        ...CRT_YELLOW, 80);
      pop();
    }

    // colored side strips — arcade cabinet style
    noStroke();
    fill(...CRT_RED, 30);
    rect(0, 0, 6, height);
    rect(width - 6, 0, 6, height);
    fill(...CRT_YELLOW, 20);
    rect(6, 0, 4, height);
    rect(width - 10, 0, 4, height);

    // title with pulse animation + phosphor glow
    let pulse = 0.96 + sin(this.timer * 0.05) * 0.04;
    push();
    translate(width / 2, height / 2 - 80);
    scale(pulse);
    textFont("'Press Start 2P'");
    textAlign(CENTER, CENTER);

    // red shadow offset
    fill(...CRT_RED, 200);
    textSize(26);
    text("TRUST NO ONE", 3, 3);

    // main yellow phosphor text
    crtText("TRUST NO ONE", 0, 0, 26, ...CRT_YELLOW, 100);
    pop();

    // cyan subtitle
    push();
    textFont("'Press Start 2P'");
    textAlign(CENTER, CENTER);
    crtText("A world where nothing is what it seems",
      width / 2, height / 2 - 30, 6, ...CRT_CYAN, 50);
    pop();

    // separator line
    crtLine(width / 2 - 180, height / 2 - 10,
            width / 2 + 180, height / 2 - 10,
            ...CRT_GREEN);

    // blinking PRESS ENTER — classic arcade style
    if (this.timer % 50 < 35) {
      push();
      textFont("'Press Start 2P'");
      textAlign(CENTER, CENTER);
      crtText("PRESS ENTER TO START", width / 2, height / 2 + 18,
        9, ...CRT_WHITE, 70);
      pop();
    }

    // controls in subtle phosphor green
    push();
    textFont("'Press Start 2P'");
    textAlign(CENTER, CENTER);
    crtText("UP / SPACE : JUMP     DOWN / S : CROUCH",
      width / 2, height / 2 + 55, 6, ...CRT_GREEN, 40);
    crtText("P : PAUSE",
      width / 2, height / 2 + 75, 6, ...CRT_GREEN, 40);
    pop();

    // decorative corners — arcade cabinet style
    this._drawCorners();
  }

  _drawCorners() {
    let s = 16;
    stroke(...CRT_YELLOW, 180);
    strokeWeight(2);
    noFill();
    // top left corner
    line(10, 10, 10 + s, 10);
    line(10, 10, 10, 10 + s);
    // top right corner
    line(width - 10 - s, 10, width - 10, 10);
    line(width - 10, 10, width - 10, 10 + s);
    // bottom left corner
    line(10, height - 10, 10 + s, height - 10);
    line(10, height - 10 - s, 10, height - 10);
    // bottom right corner
    line(width - 10 - s, height - 10, width - 10, height - 10);
    line(width - 10, height - 10 - s, width - 10, height - 10);
    noStroke();
  }
}

// ── PAUSE SCREEN ──────────────────────────────────────────────────────────────
class PauseScreen {
  draw(score, bestScore, phase) {
    // dark semi-transparent overlay
    noStroke();
    fill(0, 0, 0, 200);
    rect(0, 0, width, height);

    // main panel — CRT terminal style
    let pw = 620, ph = 270;
    let px = (width - pw) / 2, py = (height - ph) / 2;

    // panel background — very dark green
    fill(0, 8, 0, 240);
    noStroke();
    rect(px, py, pw, ph);

    // double border — CRT style
    stroke(...CRT_GREEN, 200);
    strokeWeight(1);
    noFill();
    rect(px, py, pw, ph);
    stroke(...CRT_GREEN, 60);
    rect(px + 3, py + 3, pw - 6, ph - 6);
    noStroke();

    // title -- PAUSED --
    push();
    textFont("'Press Start 2P'");
    textAlign(CENTER, CENTER);
    crtText("-- PAUSED --", width / 2, py + 28, 14, ...CRT_GREEN, 120);
    pop();

    // separator line
    crtLine(px + 16, py + 50, px + pw - 16, py + 50, ...CRT_GREEN);

    // ── Left column: scores ──────────────────────────────────────────────────
    let c1x = px + 24, c1y = py + 68;
    push();
    textFont("'Press Start 2P'");
    textAlign(LEFT, TOP);

    crtText("SCORE", c1x, c1y, 7, ...CRT_GRAY, 30);
    crtText(String(Math.floor(score)).padStart(6, "0"), c1x, c1y + 18, 11, ...CRT_YELLOW, 90);

    crtText("BEST", c1x, c1y + 52, 7, ...CRT_GRAY, 30);
    crtText(String(bestScore).padStart(6, "0"), c1x, c1y + 70, 11, ...CRT_GREEN, 90);
    pop();

    // ── Center column: phase + rules ──────────────────────────────────────────
    let c2x = width / 2, c2y = py + 68;
    push();
    textFont("'Press Start 2P'");
    textAlign(CENTER, TOP);

    let phaseColor = phase === 1 ? CRT_CYAN : phase === 2 ? CRT_PURPLE : CRT_RED;
    crtText("PHASE " + phase, c2x, c2y, 8, ...phaseColor, 100);

    let rules = _getPauseRules(phase);
    for (let i = 0; i < rules.length; i++) {
      let [r, g, b] = rules[i].crt;
      crtText(rules[i].text, c2x, c2y + 24 + i * 17, 6, r, g, b, 50);
    }
    pop();

    // ── Right column: controls ────────────────────────────────────────────────
    let c3x = px + pw - 24, c3y = py + 68;
    push();
    textFont("'Press Start 2P'");
    textAlign(RIGHT, TOP);
    crtText("CONTROLS", c3x, c3y, 6, ...CRT_GRAY, 30);
    crtText("UP/SPACE  JUMP",    c3x, c3y + 18, 6, ...CRT_WHITE, 50);
    crtText("DOWN/S    CROUCH",  c3x, c3y + 34, 6, ...CRT_WHITE, 50);
    crtText("P         RESUME",  c3x, c3y + 50, 6, ...CRT_WHITE, 50);
    crtText("R         RESTART", c3x, c3y + 66, 6, ...CRT_WHITE, 50);
    pop();

    // ── Panel bottom ──────────────────────────────────────────────────────────
    crtLine(px + 16, py + ph - 44, px + pw - 16, py + ph - 44, ...CRT_GREEN);
    push();
    textFont("'Press Start 2P'");
    textAlign(CENTER, CENTER);
    crtText("[P] RESUME", width / 2 - 90, py + ph - 24, 7, ...CRT_GREEN, 60);
    crtText("[R] RESTART", width / 2 + 90, py + ph - 24, 7, ...CRT_RED, 60);
    pop();
  }
}

// Phase rules with CRT colors — displayed in the pause screen
function _getPauseRules(phase) {
  if (phase === 1) {
    return [
      { text: "COIN  > +10 pts", crt: CRT_YELLOW },
      { text: "SPIKE > -2 HP",   crt: CRT_RED    },
      { text: "CROSS > +2 HP",   crt: CRT_GREEN  },
    ];
  } else if (phase === 2) {
    return [
      { text: "COIN  > -2 HP !", crt: CRT_RED    },
      { text: "SPIKE > +2 HP !", crt: CRT_GREEN  },
      { text: "CROSS > -2 HP !", crt: CRT_RED    },
    ];
  } else {
    return [
      { text: "COIN  > -2 HP",   crt: CRT_RED    },
      { text: "RED   > -3 HP",   crt: CRT_ORANGE },
      { text: "BLUE  > +2 HP",   crt: CRT_CYAN   },
    ];
  }
}

// ── GAME OVER SCREEN ──────────────────────────────────────────────────────────
class GameOverScreen {
  constructor() {
    this.score      = 0;
    this.distance   = 0;
    this.phase      = 1;
    this.timer      = 0;
    this.spotY      = -height;
    this.showCorpse = false;
    this.showStats  = false;
    this.showPrompt = false;
  }

  setStats(score, distance, phase) {
    this.score    = score;
    this.distance = distance;
    this.phase    = phase;
    this.timer    = 0;
    this.spotY    = -height;
    this.showCorpse = false;
    this.showStats  = false;
    this.showPrompt = false;
  }

  update() {
    this.timer++;
    this.spotY = lerp(this.spotY, height / 2 - 50, 0.06);
    if (this.timer > 50)  this.showCorpse = true;
    if (this.timer > 100) this.showStats  = true;
    if (this.timer > 160) this.showPrompt = true;
  }

  draw() {
    this.update();
    push();
    background(0, 2, 0); // phosphor black

    // scanlines on game over screen too
    noStroke();
    for (let y = 0; y < height; y += 2) {
      fill(0, 0, 0, 30);
      rect(0, y, width, 1);
    }

    // red tint if phase 3
    if (this.phase >= 3) {
      fill(40, 0, 0, 120);
      rect(0, 0, width, height);
    }

    // spotlight image or fallback
    if (typeof spotlightImg !== "undefined" && spotlightImg) {
      let sw = 240, sh = 320;
      let sx = width / 2 - sw / 2;
      let sy = this.spotY - sh + 50;
      tint(255, 180);
      image(spotlightImg, sx, sy, sw, sh);
      noTint();
    } else {
      // fallback: CRT-style light beam
      push();
      let grad = drawingContext.createLinearGradient(
        width / 2, this.spotY - 140, width / 2, this.spotY + 60);
      grad.addColorStop(0, "rgba(200,255,200,0.6)");
      grad.addColorStop(1, "rgba(0,255,60,0)");
      drawingContext.fillStyle = grad;
      drawingContext.fillRect(width / 2 - 50, this.spotY - 140, 100, 200);
      pop();
    }

    // dead player sprite under the spotlight
    if (this.showCorpse) {
      if (typeof deadImg !== "undefined" && deadImg) {
        push();
        imageMode(CENTER);
        // slight green phosphor tint on the corpse
        tint(200, 255, 200, 220);
        image(deadImg, width / 2, height / 2 - 8, 48, 48);
        noTint();
        imageMode(CORNER);
        pop();
      }
    }

    // stats
    if (this.showStats) {
      push();
      textFont("'Press Start 2P'");
      textAlign(CENTER, CENTER);
      noStroke();

      // GAME OVER — red phosphor arcade style
      crtText("GAME  OVER", width / 2, height / 2 + 34, 20, ...CRT_RED, 120);

      // separator
      crtLine(width / 2 - 130, height / 2 + 58, width / 2 + 130, height / 2 + 58, ...CRT_RED);

      // stats in terminal style
      crtText("SCORE    " + String(this.score).padStart(6, "0"),
        width / 2, height / 2 + 74, 7, ...CRT_YELLOW, 60);
      crtText("DISTANCE " + this.distance + "m",
        width / 2, height / 2 + 92, 7, ...CRT_WHITE, 40);

      let phaseColor = this.phase === 1 ? CRT_CYAN : this.phase === 2 ? CRT_PURPLE : CRT_RED;
      crtText("PHASE    " + this.phase,
        width / 2, height / 2 + 110, 7, ...phaseColor, 60);

      pop();
    }

    // blinking restart prompt
    if (this.showPrompt) {
      push();
      textFont("'Press Start 2P'");
      textAlign(CENTER, CENTER);
      if (this.timer % 50 < 35) {
        crtText("PRESS R TO CONTINUE", width / 2, height / 2 + 136, 8, ...CRT_GREEN, 80);
      }
      pop();
    }

    pop();
  }
}

// ── Phase label ────────────────────────────────────────────────────────────────
let phaseLabelTimer = 0;
let phaseLabelText  = "";

function drawPhaseLabel() {
  if (phaseLabelTimer <= 0) return;

  push();
  textFont("'Press Start 2P'");
  textAlign(RIGHT, TOP);
  noStroke();
  let alpha = map(phaseLabelTimer, 0, 180, 0, 255);
  crtText(phaseLabelText, width - 20, 20, 8, ...CRT_GREEN, alpha * 0.4);
  pop();
  phaseLabelTimer--;
}

function showPhaseLabel(phase) {
  phaseLabelText  = "-- PHASE " + phase + " --";
  phaseLabelTimer = 180;
}