import themidibus.*;

PImage eindbaas;
PImage chibitech;
PImage vonpnok;
PImage monodeerTri;
PImage monodeerType;

Sifon s;
Controller kontrol;
MidiBus nanoKontrol;
MidiBus vdmxKontrol;

int width = 1024;
int height = 768;


void setup() {
  size(800, 600, P2D);

  eindbaas = loadImage("eindbaas.png");
  monodeerTri = loadImage("monodeer_tri.png");
  monodeerType = loadImage("monodeer_type.png");
  vonpnok = loadImage("vonpnok.png");
  chibitech = loadImage("chibitech.png");


  MidiBus.list();
  nanoKontrol = new MidiBus(this, "SLIDER/KNOB", "CTRL", "nanoKontrol");
  vdmxKontrol = new MidiBus(this, "From VDMX", "To VDMX", "vdmxKontrol");


  kontrol = new Controller();


  s = new Sifon(this, width, height, P2D);

}

void draw() {


  s.begin();

  s.g.imageMode(CENTER);
  
  if (kontrol.get("drawEindbaas") > 0) {
    s.g.image(eindbaas, width/2, height/2);
  }

  if (kontrol.get("drawMonodeerTri") > 0) {
    s.g.image(monodeerTri, width/2, height/2);
  }

  if (kontrol.get("drawMonodeerType") > 0) {
    s.g.image(monodeerType, width/2, height/2);
  }

  if (kontrol.get("drawVonPnok") > 0) {
    s.g.image(vonpnok, width/2, height/2);
  }

  if (kontrol.get("drawChibitech") > 0) {
    s.g.image(chibitech, width/2, height/2);
  }


  s.end();
  s.send();


  background(0);
  fill(255);
  if (kontrol.get("hideFrame") > 0) {
    text("preview:", 200, 90);
    image(s.g, 200, 100, width/2, height/2);
  }
  kontrol.printMappings();
  text("running", 10, 10);


}


void controllerChange(int channel, int number, int value, long timestamp, String bus_name) {
  

  if (bus_name == "nanoKontrol") {
    kontrol.handleMidiEvent(channel, number, value);

  }

  if (bus_name == "vdmxKontrol") {

  }
  
}


void noteOn(int channel, int pad, int velocity, long timestamp, String bus_name) {



}