let phaseLabelTimer = 0;
let phaseLabelText  = "";

function drawPhaseLabel() {
  if (phaseLabelTimer > 0) {
    push();
    textFont("'Press Start 2P'");
    textAlign(RIGHT, TOP);
    textSize(8);
    fill(255, 255, 255, map(phaseLabelTimer, 0, 180, 0, 255));
    text(phaseLabelText, width - 20, 20);
    pop();
    phaseLabelTimer--;
  }
}

function showPhaseLabel(phase) {
  phaseLabelText  = "— PHASE " + phase + " —";
  phaseLabelTimer = 180;
}