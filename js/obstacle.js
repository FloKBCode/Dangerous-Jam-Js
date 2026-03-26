// Obstacle class — defines obstacle types, behaviors, spawn logic and effects per phase

class Obstacle {
  constructor(type, x) {
    this.type          = type;
    this.x             = x;
    this.width         = 18;
    this.height        = 18;
    this.y             = this.getYPosition();
    this.baseY         = this.y; // position Y de référence pour la lévitation

    // animation — ennemi volant
    this.frame         = 0;
    this.frameTimer    = 0;
    this.frameInterval = 10;

    // animation — rotation pièce avec 2 sprites vrais + écrasement pour la transition
    // phases : face → squeeze → profil → squeeze → face (cycle de 5 étapes)
    // coinPhase : 0=face, 1=squeeze vers profil, 2=profil, 3=squeeze vers face, 4=face (=0)
    this.coinPhase    = 0;  // étape de rotation actuelle (0-3)
    this.coinTimer    = 0;
    this.coinInterval = 8;  // frames par étape

    // animation — lévitation diamonds (déphasage aléatoire pour qu'ils ne bougent pas tous en sync)
    this.floatSeed = Math.random() * Math.PI * 2;
  }

  // three strict heights matching player states :
  // 302 = ground  — player does nothing
  // 260 = mid     — player must jump
  // 275 = high    — player must crouch (barrier_high only)
  getYPosition() {
    if (this.type === "barrier_high") return 275;
    if (this.type === "barrier_low")  return 302;
    if (this.type === "spike")        return 302;

    // collectibles — sol deux fois plus probable que en l'air
    if (this.type === "coin" || this.type === "diamond_good" || this.type === "diamond_bad") {
      let heights = [302, 302, 260];
      return heights[Math.floor(Math.random() * heights.length)];
    }

    return 302;
  }

  update(speed) {
    // déplacement horizontal
    this.x -= speed;

    // animation — ennemi volant (battement d'ailes)
    if (this.type === "barrier_high") {
      this.frameTimer++;
      if (this.frameTimer >= this.frameInterval) {
        this.frame = (this.frame + 1) % 3;
        this.frameTimer = 0;
      }
    }

    // animation — rotation pièce : 4 phases avec 2 vrais sprites + squeeze
    // phase 0=face pleine, 1=squeeze->profil, 2=profil, 3=squeeze->face
    if (this.type === "coin") {
      this.coinTimer++;
      if (this.coinTimer >= this.coinInterval) {
        this.coinPhase = (this.coinPhase + 1) % 4;
        this.coinTimer = 0;
      }
    }

    // animation — lévitation diamonds : oscillation verticale sinusoïdale
    // amplitude 4px, déphasage unique par instance via floatSeed
    if (this.type === "diamond_good" || this.type === "diamond_bad") {
      this.y = this.baseY + sin(frameCount * 0.06 + this.floatSeed) * 4;
    }
  }

  draw(tileSheet, characterSheet, diamondGood, diamondBad) {
    // tilemap step   = 19px (18px tile + 1px spacing)
    // character step = 25px (24px tile + 1px spacing)

    if (this.type === "coin") {
      this._drawCoin(tileSheet);

    } else if (this.type === "spike") {
      image(tileSheet, this.x, this.y, 18, 18, 8 * 19, 3 * 19, 18, 18);

    } else if (this.type === "barrier_low") {
      image(tileSheet, this.x, this.y, 18, 18, 6 * 19, 5 * 19, 18, 18);

    } else if (this.type === "barrier_high") {
      // ennemi volant animé — colonnes 6/7/8 rangée 2 du tilemap-characters.png
      let col = 6 + this.frame;
      image(characterSheet, this.x, this.y, 32, 32, col * 25, 2 * 25, 24, 24);

    } else if (this.type === "diamond_good") {
      image(diamondGood, this.x, this.y, 18, 18);

    } else if (this.type === "diamond_bad") {
      image(diamondBad, this.x, this.y, 18, 18);
    }
  }

  // Rotation pièce : simple alternance entre sprite face et sprite profil
  // Sprite face    : row 10, col 7  → srcX = 7*19,  srcY = 10*19
  // Sprite profil  : row 7,  col 11 → srcX = 11*19, srcY = 7*19
  _drawCoin(tileSheet) {
    push();
    if (this.coinPhase === 0 || this.coinPhase === 1) {
      // face
      image(tileSheet, this.x, this.y, 18, 18,
        7 * 19, 10 * 19, 18, 18);
    } else {
      // profil
      image(tileSheet, this.x, this.y, 18, 18,
        11 * 19, 7 * 19, 18, 18);
    }
    pop();
  }

  // Effets HP et score selon la phase — rééquilibrés pour une progression lisible
  getEffect(phase) {
    if (this.type === "coin") {
      // phase 1 : récompense | phases 2-3 : danger (inversion)
      if (phase === 1) return { hp:  0, score: 10 };
      if (phase === 2) return { hp: -2, score: 0  };
      if (phase === 3) return { hp: -2, score: 0  };
    }
    if (this.type === "spike") {
      // phase 1 : danger | phase 2 : soigne (inversion) | phase 3 : danger à nouveau
      if (phase === 1) return { hp: -2, score: 0 };
      if (phase === 2) return { hp:  2, score: 5 };
      if (phase === 3) return { hp: -2, score: 0 };
    }
    if (this.type === "diamond_good") {
      // phase 1 : soigne | phase 2 : danger | phase 3 : soigne + bonus score
      if (phase === 1) return { hp:  2, score: 0 };
      if (phase === 2) return { hp: -2, score: 0 };
      if (phase === 3) return { hp:  2, score: 5 };
    }
    if (this.type === "diamond_bad") {
      // ne spawn qu'en phase 3 — dégâts sérieux mais pas one-shot
      if (phase === 3) return { hp: -3, score: 0 };
      return { hp: 0, score: 0 }; // inoffensif si spawn hors phase 3 (sécurité)
    }
    if (this.type === "barrier_low" || this.type === "barrier_high") {
      // obstacles physiques — toujours dangereux, toutes phases
      return { hp: -2, score: 0 };
    }
    return { hp: 0, score: 0 };
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }
}

// Spawn d'un obstacle selon la phase avec pondération équilibrée
function spawnObstacle(phase) {
  let types;

  if (phase === 1) {
    // phase 1 — introduction calme : beaucoup de pièces et diamonds
    types = [
      "coin", "coin", "coin",
      "spike",
      "diamond_good", "diamond_good",
      "barrier_low",
      "barrier_high"
    ];
  } else if (phase === 2) {
    // phase 2 — inversion : spikes en masse (ils soignent), éviter les pièces
    types = [
      "coin",
      "spike", "spike", "spike",
      "diamond_good",
      "barrier_low", "barrier_low",
      "barrier_high"
    ];
  } else {
    // phase 3 — chaos total : diamond_bad introduit, densité maximale
    types = [
      "coin",
      "spike", "spike",
      "diamond_good",
      "diamond_bad", "diamond_bad",
      "barrier_low", "barrier_low",
      "barrier_high"
    ];
  }

  return new Obstacle(types[Math.floor(Math.random() * types.length)], 820);
}
