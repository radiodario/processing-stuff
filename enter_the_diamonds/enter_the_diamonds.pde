PShader myShader;
import lazer.viz.*;

LazerController kontrol;

LazerSyphon send;

PImage texture;

int width = 1280;
int height = 720;

void setup() {
  size(800, 600, P3D); //P3D? Why not OpenGL??? ;_____;
  kontrol = new LazerController(this);
  setControls();

  myShader = loadShader("diamonds.glsl");
  myShader.set("resolution", float(width), float(height));

  send = new LazerSyphon(this, width, height, P3D);

  updateShader();

}

void updateShader() {
  myShader.set("iGlobalTime", millis() / 2000.0);
}


void draw() {

  updateShader();

  send.begin();
  send.g.background(255);
  send.g.shader(myShader);
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

  // Kontroller controls

  // the height of the sea
  kontrol.setMapping("seaHeight", kontrol.SLIDER1, 50);
  // how choppy is the sea
  
  kontrol.setMapping("hideFrame", kontrol.BUTTON_R5, 1);

  // VDMX note controls
  kontrol.setNoteControl("seaHeight", kontrol.VDMX_LOW);
}
