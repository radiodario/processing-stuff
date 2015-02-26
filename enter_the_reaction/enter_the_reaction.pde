PShader gs;
float feed = 0.037;
float kill = 0.06;
float delta = 1;


PImage kata;

boolean doMouse = false;

void setup() {
  size(1280, 1024, P2D);
  gs = loadShader("shader.glsl");
  gs.set("screen", float(width), float(height));
  gs.set("delta", delta);
  gs.set("feed", feed);
  gs.set("kill", kill);
  kata = loadImage("ti_yong.png");
  imageMode(CENTER);
}

void draw() {
  //image(kata, width/2, height/2);
  if (doMouse) {
    gs.set("mouse", float(mouseX), float(height-mouseY));
  }
  for (int i = 0; i < 20; i++) {
    filter(gs);
  }
}

void mousePressed() {
  doMouse = true;
}

void mouseReleased() {
  doMouse = false;
}