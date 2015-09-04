import toxi.color.*;
import toxi.color.theory.*;
import lazer.viz.*;

LazerController kontrol;
LazerSyphon send;

int width = 1024;
int height = 768;

PShader myShader;

Colors colors;

void setup() {
  size(800, 600, P3D);

  kontrol = new LazerController(this);
  setControls();

  colors = new Colors(30*30);

  myShader = loadShader("spiral_frag.glsl");
  myShader.set("resolution", float(width), float(height));

  send = new LazerSyphon(this, width, height, P3D);

  updateShader();

}

void updateShaderColors() {

  if ((kontrol.get("setRandomBrightColors") > 0) ||
      (kontrol.get("setRandomDarkColors") > 0) ||
      (kontrol.get("setVoidColors") > 0)) {

    float [] fillColor;
    for (int i = 1; i < 6; i++) {
      if (kontrol.get("randomFill") > 0) {
        fillColor = colors.getAColor();
      } else if (kontrol.get("nextFill") > 0){
        fillColor = colors.getNextColor();
      }  else {
        continue;
      }
      // println("color" + i);
      // println(fillColor);
      myShader.set("color" + i, fillColor[0], fillColor[1], fillColor[2]);
    }

    colors.update();
  }

}


void updateShader() {
  myShader.set("iGlobalTime", millis() / 1000.0);
  float n_sub = (float) int(map(kontrol.get("n_sub"), 0, 127, 0, 200));
  myShader.set("n_sub", n_sub);
  float depth = (float) map(kontrol.get("depth"), 0, 127, 1, 10);
  myShader.set("depth", depth);
  float rot_factor = (float) map(kontrol.get("rot_factor"), 0, 127, 0.001, 1);
  myShader.set("rot_factor", rot_factor);

  float squiggle_factor = (float) map(kontrol.get("squiggle_factor"), 0, 127, 0, 10);
  myShader.set("squiggle_factor", squiggle_factor);
  float squiggle_period = (float) map(kontrol.get("squiggle_period"), 0, 127, 0, 10);
  myShader.set("squiggle_period", squiggle_period);

  float bob_factor = (float) map(kontrol.get("bob_factor"), 0, 127, 0, 1000);
  myShader.set("bob_factor", bob_factor);

  float divisions = (float) map(kontrol.get("divisions"), 0, 127, 1, 20);
  myShader.set("divisions", divisions);
  float speed = (float) map(kontrol.get("speed"), 0, 127, 0, 40);
  myShader.set("speed", speed);
  updateShaderColors();
}

void draw() {
  updateShader();



  send.begin();
  send.g.background(255);
  send.g.shader(myShader);
  // This kind of effects are entirely implemented in the
  // fragment shader, they only need a quad covering the
  // entire view area so every pixel is pushed through the
  // shader.
  send.g.fill(255);
  send.g.rect(0, 0, width, height);
  send.g.resetShader();

  send.end();
  send.send();

  background(0);
  fill(255);
  if (kontrol.get("hideFrame") > 0) {
    text("preview:", 200, 90);
    image(send.g, 200, 100, width/2, height/2);
  }
  kontrol.printMappings();
  text("running", 10, 10);
}

void setControls() {
  kontrol.setMapping("hideFrame", kontrol.BUTTON_R5, 1);
  kontrol.setMapping("n_sub", kontrol.SLIDER1, 1);
  kontrol.setMapping("speed", kontrol.SLIDER2, 2);
  kontrol.setMapping("rot_factor", kontrol.SLIDER3, 1);
  kontrol.setMapping("squiggle_factor", kontrol.SLIDER4, 1);
  kontrol.setMapping("squiggle_period", kontrol.SLIDER5, 2);
  kontrol.setMapping("bob_factor", kontrol.SLIDER6, 3);
  kontrol.setMapping("divisions", kontrol.SLIDER7, 10);
  kontrol.setMapping("depth", kontrol.SLIDER8, 10);

  kontrol.setMapping("randomFill", kontrol.BUTTON_S2, 1);
  kontrol.setMapping("nextFill", kontrol.BUTTON_S3);

  kontrol.setMapping("setRandomBrightColors",  kontrol.BUTTON_MARKER_SET, 1);
  kontrol.setMapping("setVoidColors",  kontrol.BUTTON_MARKER_LEFT);
  kontrol.setMapping("setRandomDarkColors",  kontrol.BUTTON_MARKER_RIGHT);

}