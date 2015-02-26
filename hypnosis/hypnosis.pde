PShader myShader;
import themidibus.*;

MidiBus nanoKontrol;
MidiBus vdmxKontrol;
Controller kontrol;
Sifon send;

PImage texture;

int width = 1280;
int height = 1024;

void setup() {
  size(800, 600, P3D);

  MidiBus.list();
  nanoKontrol = new MidiBus(this, "SLIDER/KNOB", "CTRL", "nanoKontrol");
  vdmxKontrol = new MidiBus(this, "From VDMX", "To VDMX", "vdmxKontrol");

  kontrol = new Controller();

  myShader = loadShader("shader.glsl");
  myShader.set("amount", 0.0023);
  myShader.set("resolution", float(width), float(height));

  send = new Sifon(this, width, height, P3D);

}

void updateShader() {
  myShader.set("iGlobalTime", millis() / 1000.0);
  float multi = (float) map(kontrol.get("multi"), 0, 127, 0.000001, 0.0025);
  myShader.set("multi", multi);
  float amount = (float) map(kontrol.get("amount"), 0, 127, 0.0001, 1);
  myShader.set("amount", amount);
  float barWidth = (float) map(kontrol.get("width"), 0, 127, -1, 1);
  // myShader.set("width", barWidth);
  myShader.set("width", 0.5);
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

void controllerChange(int channel, int number, int value, long timestamp, String bus_name) {

  // println(timestamp + " - Handled controllerChange " + channel + " " + number + " " + value + " " + bus_name);

  if (bus_name == "nanoKontrol") {
    kontrol.handleMidiEvent(channel, number, value);
  }

  if (bus_name == "vdmxKontrol") {

    // println("Handled " + channel + " " + number + " " + value);

  }

}