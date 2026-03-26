// Obstacle class + système de spawn dynamique par vagues et patterns

class Obstacle {
  constructor(type, x) {
    this.type          = type;
    this.x             = x;
    this.width         = 18;
    this.height        = 18;
    this.y             = this.getYPosition();
    this.baseY         = this.y;

    // animation ennemi volant
    this.frame         = 0;
    this.frameTimer    = 0;
    this.frameInterval = 10;

    // rotation pièce — alternance 2 sprites
    this.coinPhase    = 0;
    this.coinTimer    = 0;
    this.coinInterval = 10;

    // lévitation diamonds
    this.floatSeed = Math.random() * Math.PI * 2;
  }

  getYPosition() {
    if (this.type === "barrier_high") return 275;
    if (this.type === "barrier_low")  return 302;
    if (this.type === "spike")        return 302;
    if (this.type === "coin" || this.type === "diamond_good" || this.type === "diamond_bad") {
      let heights = [302, 302, 260];
      return heights[Math.floor(Math.random() * heights.length)];
    }
    return 302;
  }

  update(speed) {
    this.x -= speed;

    if (this.type === "barrier_high") {
      this.frameTimer++;
      if (this.frameTimer >= this.frameInterval) {
        this.frame = (this.frame + 1) % 3;
        this.frameTimer = 0;
      }
    }

    if (this.type === "coin") {
      this.coinTimer++;
      if (this.coinTimer >= this.coinInterval) {
        this.coinPhase = (this.coinPhase + 1) % 4;
        this.coinTimer = 0;
      }
    }

    if (this.type === "diamond_good" || this.type === "diamond_bad") {
      this.y = this.baseY + sin(frameCount * 0.06 + this.floatSeed) * 4;
    }
  }

  draw(tileSheet, characterSheet, diamondGood, diamondBad) {
    if (this.type === "coin") {
      this._drawCoin(tileSheet);
    } else if (this.type === "spike") {
      image(tileSheet, this.x, this.y, 18, 18, 8 * 19, 3 * 19, 18, 18);
    } else if (this.type === "barrier_low") {
      image(tileSheet, this.x, this.y, 18, 18, 6 * 19, 5 * 19, 18, 18);
    } else if (this.type === "barrier_high") {
      let col = 6 + this.frame;
      image(characterSheet, this.x, this.y, 32, 32, col * 25, 2 * 25, 24, 24);
    } else if (this.type === "diamond_good") {
      image(diamondGood, this.x, this.y, 18, 18);
    } else if (this.type === "diamond_bad") {
      image(diamondBad, this.x, this.y, 18, 18);
    }
  }

  // Alternance sprite face (row10,col7) / profil (row7,col11)
  _drawCoin(tileSheet) {
    push();
    if (this.coinPhase === 0 || this.coinPhase === 1) {
      image(tileSheet, this.x, this.y, 18, 18, 7 * 19, 10 * 19, 18, 18);
    } else {
      image(tileSheet, this.x, this.y, 18, 18, 11 * 19, 7 * 19, 18, 18);
    }
    pop();
  }

  getEffect(phase) {
    if (this.type === "coin") {
      if (phase === 1) return { hp:  0, score: 10 };
      if (phase === 2) return { hp: -2, score: 0  };
      if (phase === 3) return { hp: -2, score: 0  };
    }
    if (this.type === "spike") {
      if (phase === 1) return { hp: -2, score: 0 };
      if (phase === 2) return { hp:  2, score: 5 };
      if (phase === 3) return { hp: -2, score: 0 };
    }
    if (this.type === "diamond_good") {
      if (phase === 1) return { hp:  2, score: 0 };
      if (phase === 2) return { hp: -2, score: 0 };
      if (phase === 3) return { hp:  2, score: 5 };
    }
    if (this.type === "diamond_bad") {
      if (phase === 3) return { hp: -3, score: 0 };
      return { hp: 0, score: 0 };
    }
    if (this.type === "barrier_low" || this.type === "barrier_high") {
      return { hp: -2, score: 0 };
    }
    return { hp: 0, score: 0 };
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }
}

// ── Système de spawn dynamique par vagues + patterns ─────────────────────────
//
// Un "pattern" est une séquence d'obstacles espacés avec un délai entre chaque.
// Une "vague" = 1 à 3 patterns consécutifs, puis une pause.
//
// Structure : SpawnManager gère une file de patterns à exécuter.

class SpawnManager {
  constructor() {
    this.queue      = [];  // file de { type, delay } à spawner
    this.queueTimer = 0;   // timer entre deux spawns dans la queue
    this.waveTimer  = 0;   // timer entre deux vagues
    this.wavePause  = 0;   // durée de pause entre vagues (frames)
    this.inWave     = false;
    this.lastType   = null; // évite deux du même type à la suite
  }

  // Appelé chaque frame — retourne un tableau d'obstacles à spawner (souvent vide)
  update(phase, scrollSpeed) {
    let toSpawn = [];

    // si queue en cours : on exécute
    if (this.queue.length > 0) {
      this.queueTimer++;
      if (this.queueTimer >= this.queue[0].delay) {
        let entry = this.queue.shift();
        this.queueTimer = 0;
        toSpawn.push(new Obstacle(entry.type, 820));
        this.lastType = entry.type;
      }
      return toSpawn;
    }

    // queue vide : on attend la fin de la pause inter-vagues
    this.waveTimer++;
    // pause adaptée à la phase et à la vitesse (plus vite = pause plus courte)
    let basePause = phase === 1 ? 110 : phase === 2 ? 85 : 65;
    basePause = Math.round(basePause * (3.5 / scrollSpeed)); // adaptatif
    basePause = Math.max(40, basePause); // minimum 40 frames

    if (this.waveTimer >= basePause) {
      this.waveTimer = 0;
      this._buildWave(phase);
    }

    return toSpawn;
  }

  // Construit une vague de patterns selon la phase
  _buildWave(phase) {
    // choisit un pattern au hasard parmi ceux disponibles pour cette phase
    let patterns = this._getPatternsForPhase(phase);
    let pattern  = patterns[Math.floor(Math.random() * patterns.length)];
    this.queue   = pattern;
  }

  // Patterns par phase — chaque entrée : { type, delay }
  // delay = frames avant de spawner CE type après le précédent
  _getPatternsForPhase(phase) {
    if (phase === 1) {
      return [
        // sol simple
        [{ type: "coin",         delay: 0 }],
        // sol + air rapprochés
        [{ type: "coin",         delay: 0 }, { type: "diamond_good", delay: 45 }],
        // deux au sol côte à côte
        [{ type: "spike",        delay: 0 }, { type: "barrier_low",  delay: 30 }],
        // un en l'air (joueur doit sauter)
        [{ type: "barrier_low",  delay: 0 }],
        // un en hauteur (joueur doit s'accroupir)
        [{ type: "barrier_high", delay: 0 }],
        // collectible suivi d'un piège
        [{ type: "diamond_good", delay: 0 }, { type: "spike",        delay: 55 }],
        // triple pièces espacées
        [{ type: "coin",         delay: 0 }, { type: "coin",         delay: 40 }, { type: "coin", delay: 40 }],
        // sol puis air
        [{ type: "barrier_low",  delay: 0 }, { type: "barrier_high", delay: 60 }],
      ];
    } else if (phase === 2) {
      return [
        // spikes en rafale (ils soignent maintenant !)
        [{ type: "spike",        delay: 0 }, { type: "spike",        delay: 35 }],
        // piège : pièce (danger) suivie d'un spike (soin)
        [{ type: "coin",         delay: 0 }, { type: "spike",        delay: 50 }],
        // barrières + spike
        [{ type: "barrier_low",  delay: 0 }, { type: "spike",        delay: 45 }],
        // double barrière
        [{ type: "barrier_low",  delay: 0 }, { type: "barrier_high", delay: 55 }],
        // triple spike
        [{ type: "spike",        delay: 0 }, { type: "spike",        delay: 40 }, { type: "spike", delay: 40 }],
        // diamond piège (il fait mal en phase 2)
        [{ type: "diamond_good", delay: 0 }, { type: "barrier_low",  delay: 50 }],
        // coin piège isolé
        [{ type: "coin",         delay: 0 }],
        // alternance sol/air
        [{ type: "barrier_high", delay: 0 }, { type: "spike",        delay: 50 }],
      ];
    } else {
      // phase 3 — chaos max
      return [
        // diamond_bad en embuscade
        [{ type: "diamond_bad",  delay: 0 }],
        // double diamond_bad
        [{ type: "diamond_bad",  delay: 0 }, { type: "diamond_bad",  delay: 40 }],
        // diamond_bad + barrière
        [{ type: "diamond_bad",  delay: 0 }, { type: "barrier_low",  delay: 45 }],
        // triple obstacles rapprochés
        [{ type: "barrier_low",  delay: 0 }, { type: "spike",        delay: 35 }, { type: "barrier_high", delay: 40 }],
        // pluie de spikes
        [{ type: "spike",        delay: 0 }, { type: "spike",        delay: 30 }, { type: "spike", delay: 30 }],
        // coin piège + diamond_bad
        [{ type: "coin",         delay: 0 }, { type: "diamond_bad",  delay: 50 }],
        // barrières en rafale
        [{ type: "barrier_high", delay: 0 }, { type: "barrier_low",  delay: 45 }, { type: "barrier_high", delay: 45 }],
        // diamond_good soin + piège immédiat
        [{ type: "diamond_good", delay: 0 }, { type: "diamond_bad",  delay: 40 }],
      ];
    }
  }

  reset() {
    this.queue      = [];
    this.queueTimer = 0;
    this.waveTimer  = 0;
    this.lastType   = null;
  }
}
