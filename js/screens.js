// screens.js — écrans Start, Pause et Game Over

// ── ÉCRAN DE DÉMARRAGE ────────────────────────────────────
class StartScreen {
  constructor() {
    this.timer = 0;
  }

  draw() {
    this.timer++;
    background(0);

    // vignette : bords sombres
    noStroke();
    for (let i = 0; i < 6; i++) {
      fill(0, 0, 0, 40 - i * 5);
      rect(i * 14, i * 7, width - i * 28, height - i * 14);
    }

    // légères particules d'ambiance (points qui tombent lentement)
    fill(255, 255, 255, 20);
    noStroke();
    randomSeed(this.timer * 0.2 | 0);
    for (let i = 0; i < 30; i++) {
      let px = random(width);
      let py = (random(height) + this.timer * 0.4) % height;
      ellipse(px, py, 1.5);
    }
    randomSeed();

    // titre principal — pulsation lente
    let pulse = 0.97 + sin(this.timer * 0.04) * 0.03;
    push();
    translate(width / 2, height / 2 - 70);
    scale(pulse);
    textFont("'Press Start 2P'");
    textAlign(CENTER, CENTER);
    textSize(24);
    // ombre
    fill(180, 0, 0, 180);
    text("TRUST NO ONE", 2, 2);
    // texte principal
    fill(255, 220, 50);
    text("TRUST NO ONE", 0, 0);
    pop();

    // sous-titre
    push();
    textFont("'Press Start 2P'");
    textAlign(CENTER, CENTER);
    textSize(7);
    fill(200, 180, 180, 200);
    text("A world where nothing is what it seems", width / 2, height / 2 - 30);
    pop();

    // "PRESS ENTER" clignotant
    push();
    textFont("'Press Start 2P'");
    textAlign(CENTER, CENTER);
    textSize(9);
    let blinkAlpha = (sin(this.timer * 0.08) > 0) ? 255 : 0;
    fill(255, 255, 255, blinkAlpha);
    text("PRESS ENTER TO START", width / 2, height / 2 + 20);
    pop();

    // séparateur
    stroke(80, 80, 80);
    strokeWeight(1);
    line(width / 2 - 160, height / 2 + 48, width / 2 + 160, height / 2 + 48);
    noStroke();

    // contrôles
    push();
    textFont("'Press Start 2P'");
    textAlign(CENTER, CENTER);
    textSize(6);
    fill(120, 120, 120);
    text("JUMP : ARROW UP / SPACE     CROUCH : ARROW DOWN / S", width / 2, height / 2 + 64);
    text("PAUSE : P", width / 2, height / 2 + 82);
    pop();
  }
}

// ── ÉCRAN DE PAUSE ────────────────────────────────────────
class PauseScreen {
  // score      : score actuel
  // bestScore  : meilleur score (localStorage)
  // phase      : phase en cours (1, 2 ou 3)
  draw(score, bestScore, phase) {
    // overlay semi-transparent sur le jeu
    noStroke();
    fill(0, 0, 0, 175);
    rect(0, 0, width, height);

    // panneau central
    let panelW = 600;
    let panelH = 260;
    let panelX = (width - panelW) / 2;
    let panelY = (height - panelH) / 2;

    fill(15, 15, 25, 230);
    stroke(60, 60, 80);
    strokeWeight(1);
    rect(panelX, panelY, panelW, panelH, 6);
    noStroke();

    // titre PAUSED
    push();
    textFont("'Press Start 2P'");
    textAlign(CENTER, CENTER);
    textSize(16);
    fill(255, 255, 255);
    text("PAUSED", width / 2, panelY + 30);
    pop();

    // ligne de séparation
    stroke(50, 50, 70);
    strokeWeight(1);
    line(panelX + 20, panelY + 50, panelX + panelW - 20, panelY + 50);
    noStroke();

    // ── colonne gauche : scores ──
    let col1X = panelX + 30;
    let col1Y = panelY + 70;
    push();
    textFont("'Press Start 2P'");
    textAlign(LEFT, TOP);
    textSize(7);

    fill(160, 160, 160);
    text("SCORE", col1X, col1Y);
    textSize(10);
    fill(255, 255, 100);
    text(String(Math.floor(score)).padStart(6, "0"), col1X, col1Y + 18);

    textSize(7);
    fill(160, 160, 160);
    text("BEST", col1X, col1Y + 50);
    textSize(10);
    fill(100, 220, 100);
    text(String(bestScore).padStart(6, "0"), col1X, col1Y + 68);
    pop();

    // ── colonne centre : phase + règles actives ──
    let col2X = width / 2;
    let col2Y = panelY + 70;
    push();
    textFont("'Press Start 2P'");
    textAlign(CENTER, TOP);
    textSize(7);

    // couleur de phase
    let phaseColors = [color(100,200,255), color(180,100,255), color(255,80,80)];
    fill(phaseColors[phase - 1]);
    text("PHASE " + phase, col2X, col2Y);

    // règles actives selon la phase
    textSize(6);
    fill(200, 200, 200);
    let rules = _getPauseRules(phase);
    for (let i = 0; i < rules.length; i++) {
      fill(rules[i].col);
      text(rules[i].text, col2X, col2Y + 20 + i * 16);
    }
    pop();

    // ── colonne droite : contrôles ──
    let col3X = panelX + panelW - 30;
    let col3Y = panelY + 70;
    push();
    textFont("'Press Start 2P'");
    textAlign(RIGHT, TOP);
    textSize(6);
    fill(160, 160, 160);
    text("CONTROLS", col3X, col3Y);
    fill(220, 220, 220);
    text("JUMP   UP / SPACE", col3X, col3Y + 18);
    text("CROUCH  DOWN / S", col3X, col3Y + 34);
    text("PAUSE         P", col3X, col3Y + 50);
    text("RESTART       R", col3X, col3Y + 66);
    pop();

    // ── bas du panneau : boutons ──
    push();
    textFont("'Press Start 2P'");
    textAlign(CENTER, CENTER);
    textSize(7);
    fill(180, 180, 180);
    text("P  RESUME", width / 2 - 70, panelY + panelH - 22);
    text("R  RESTART", width / 2 + 70, panelY + panelH - 22);
    pop();
  }
}

// Retourne les règles actives à afficher dans la page de pause
function _getPauseRules(phase) {
  if (phase === 1) {
    return [
      { text: "COIN  > +10 pts",   col: color(255, 220, 50)  },
      { text: "SPIKE > -2 HP",     col: color(255, 80, 80)   },
      { text: "CROSS > +2 HP",     col: color(80, 255, 120)  }
    ];
  } else if (phase === 2) {
    return [
      { text: "COIN  > -2 HP !",   col: color(255, 80, 80)   },
      { text: "SPIKE > +2 HP !",   col: color(80, 255, 120)  },
      { text: "CROSS > -2 HP !",   col: color(255, 80, 80)   }
    ];
  } else {
    return [
      { text: "COIN  > -2 HP",     col: color(255, 80, 80)   },
      { text: "RED   > -3 HP",     col: color(255, 40, 40)   },
      { text: "BLUE  > +2 HP",     col: color(80, 200, 255)  }
    ];
  }
}

// ── ÉCRAN GAME OVER ───────────────────────────────────────
class GameOverScreen {
  constructor() {
    this.score    = 0;
    this.distance = 0;
    this.phase    = 1;
    this.timer    = 0;
    this.spotY    = -height;

    // états d'apparition progressive
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
    this.spotY = lerp(this.spotY, height / 2 - 60, 0.05);
    if (this.timer > 60)  this.showCorpse = true;
    if (this.timer > 110) this.showStats  = true;
    if (this.timer > 170) this.showPrompt = true;
  }

  draw() {
    this.update();
    push();
    background(0);

    // fond avec légère teinte rouge selon la phase atteinte
    if (this.phase >= 3) {
      noStroke();
      fill(40, 0, 0, 180);
      rect(0, 0, width, height);
    }

    // spotlight — image PNG centrée, descend depuis le haut
    if (typeof spotlightImg !== "undefined" && spotlightImg) {
      let sw = 220;   // largeur du spotlight
      let sh = 300;   // hauteur du spotlight
      let sx = width / 2 - sw / 2;
      let sy = this.spotY - sh + 40; // le bas du spotlight pointe vers le sol
      tint(255, 200); // légèrement transparent
      image(spotlightImg, sx, sy, sw, sh);
      noTint();
    } else {
      // fallback si image pas chargée : trait lumineux
      push();
      let grad = drawingContext.createLinearGradient(width / 2, this.spotY - 120, width / 2, this.spotY + 60);
      grad.addColorStop(0, "rgba(255,255,255,0.7)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      drawingContext.fillStyle = grad;
      drawingContext.fillRect(width / 2 - 40, this.spotY - 120, 80, 180);
      pop();
    }

    // personnage mort — sprite player_dead.png
    if (this.showCorpse) {
      if (typeof deadImg !== "undefined" && deadImg) {
        push();
        // le sprite est couché — on le place au centre légèrement au-dessus du sol
        let dw = 48;
        let dh = 48;
        imageMode(CENTER);
        image(deadImg, width / 2, height / 2 - 10, dw, dh);
        imageMode(CORNER);
        pop();
      } else {
        // fallback dessiné en P5
        noStroke();
        fill(100, 0, 0);
        rect(width / 2 - 18, height / 2 - 6, 36, 14, 3);
        fill(120, 60, 60);
        ellipse(width / 2, height / 2 - 18, 22, 20);
      }
    }

    // stats avec apparition décalée
    if (this.showStats) {
      push();
      textFont("'Press Start 2P'");
      textAlign(CENTER, CENTER);
      noStroke();

      // "YOU DIED" en rouge sang
      textSize(20);
      fill(140, 0, 0);
      text("YOU DIED", width / 2 + 2, height / 2 + 38 + 2); // ombre
      fill(220, 30, 30);
      text("YOU DIED", width / 2, height / 2 + 38);

      // séparateur
      stroke(60, 0, 0);
      strokeWeight(1);
      line(width / 2 - 120, height / 2 + 60, width / 2 + 120, height / 2 + 60);
      noStroke();

      // stats
      textSize(7);
      fill(180, 180, 180);
      text("SCORE    " + String(this.score).padStart(6, "0"), width / 2, height / 2 + 76);
      text("DISTANCE " + this.distance + "m",               width / 2, height / 2 + 94);

      // phase avec couleur
      let phaseColors = [color(100,200,255), color(180,100,255), color(255,80,80)];
      fill(phaseColors[this.phase - 1]);
      text("PHASE    " + this.phase,                        width / 2, height / 2 + 112);

      pop();
    }

    // "Press R to restart" clignotant
    if (this.showPrompt) {
      push();
      textFont("'Press Start 2P'");
      textAlign(CENTER, CENTER);
      textSize(8);
      let blinkAlpha = (sin(this.timer * 0.08) > 0) ? 220 : 0;
      fill(255, 255, 255, blinkAlpha);
      text("PRESS R TO RESTART", width / 2, height / 2 + 136);
      pop();
    }

    pop();
  }
}

// ── Label de phase (haut droite) ─────────────────────────
let phaseLabelTimer = 0;
let phaseLabelText  = "";

function drawPhaseLabel() {
  if (phaseLabelTimer <= 0) return;

  push();
  textFont("'Press Start 2P'");
  textAlign(RIGHT, TOP);
  textSize(8);
  fill(255, 255, 255, map(phaseLabelTimer, 0, 180, 0, 255));
  text(phaseLabelText, width - 20, 20);
  pop();
  phaseLabelTimer--;
}

function showPhaseLabel(phase) {
  phaseLabelText  = "— PHASE " + phase + " —";
  phaseLabelTimer = 180;
}
