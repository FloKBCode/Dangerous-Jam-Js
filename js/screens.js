function drawTitle() {
  push();
  textFont("'Press Start 2P'");
  textAlign(CENTER, CENTER);
  textSize(22);
  fill(255, 255, 100);
  text("TRUST NO ONE", width / 2, height / 2 - 60);
  pop();
}
function drawPauseOverlay() {
  push();
  noStroke();
  fill(0, 0, 0, 160);
  rect(0, 0, width, height);
  textFont("'Press Start 2P'");
  textAlign(CENTER, CENTER);
  textSize(18);
  fill(255);
  text("PAUSED", width / 2, height / 2 - 20);
  textSize(7);
  fill(180);
  text("Press P to resume", width / 2, height / 2 + 20);
  pop();
}