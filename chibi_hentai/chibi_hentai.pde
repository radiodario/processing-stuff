import themidibus.*;

PImage chibitech2;
PImage chibitech3;
PImage chibitech4;
PImage chibitech5;
PImage chibitech6;
PImage chibitech7;
PImage chibitech8;
PImage chibitech9;



Sifon s;
Controller kontrol;
MidiBus nanoKontrol;
MidiBus vdmxKontrol;

int width = 640;
int height = 480;


void setup() {
  size(800, 600, P2D);

  MidiBus.list();
  nanoKontrol = new MidiBus(this, "SLIDER/KNOB", "CTRL", "nanoKontrol");
  vdmxKontrol = new MidiBus(this, "From VDMX", "To VDMX", "vdmxKontrol");

  kontrol = new Controller();

  s = new Sifon(this, width, height, P2D);


  chibitech2 = loadImage("chibitech2.jpg");
  chibitech3 = loadImage("chibitech3.jpg");
  chibitech4 = loadImage("chibitech4.jpg");
  chibitech5 = loadImage("chibitech5.jpg");
  chibitech6 = loadImage("chibitech6.jpg");
  chibitech7 = loadImage("chibitech7.jpg");
  chibitech8 = loadImage("chibitech8.jpg");
  chibitech9 = loadImage("chibitech9.jpg");

}

void draw() {


  s.begin();

  s.g.imageMode(CENTER);
  
  if (kontrol.get("chibitech2") > 0) {
    s.g.image(chibitech2, width/2, height/2);
  }

  if (kontrol.get("chibitech3") > 0) {
    s.g.image(chibitech3, width/2, height/2);
  }

  if (kontrol.get("chibitech4") > 0) {
    s.g.image(chibitech4, width/2, height/2);
  }

  if (kontrol.get("chibitech5") > 0) {
    s.g.image(chibitech5, width/2, height/2);
  }

  if (kontrol.get("chibitech6") > 0) {
    s.g.image(chibitech6, width/2, height/2);
  }

  if (kontrol.get("chibitech7") > 0) {
    s.g.image(chibitech7, width/2, height/2);
  }

  if (kontrol.get("chibitech8") > 0) {
    s.g.image(chibitech8, width/2, height/2);
  }

  if (kontrol.get("chibitech9") > 0) {
    s.g.image(chibitech9, width/2, height/2);
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