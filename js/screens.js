let phaseLabelTimer = 0;
let phaseLabelText = "";

function drawTitle() {

  push();

  textAlign(CENTER, CENTER);
  textSize(48);
  fill(255);

  text("TRUST NO ONE", width / 2, height / 2);

  pop();

}

function drawPauseOverlay() {

  push();

  fill(0, 150);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);
  textSize(40);
  fill(255);

  text("PAUSED", width / 2, height / 2);

  pop();

}

function drawPhaseLabel() {

  if (phaseLabelTimer > 0) {

    push();

    textAlign(RIGHT, TOP);
    textSize(24);
    fill(255);

    text(phaseLabelText, width - 20, 20);

    pop();

    phaseLabelTimer--;

  }

}