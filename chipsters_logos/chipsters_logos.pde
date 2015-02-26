import themidibus.*;

PImage fourdboy;
PImage chud_wt;
PImage ltc_bk;
PImage ltc_wt;
PImage ralp_bk;
PImage sbsm_1;
PImage sbsm_2;
PImage sbsm_3;
PImage sbsm_4;
PImage sultan_bk;
PImage sultan_wt;


PImage current;

Sifon s;
Controller kontrol;
MidiBus nanoKontrol;
MidiBus vdmxKontrol;

int width = 1024;
int height = 768;


void setup() {
  size(800, 600, P2D);

  fourdboy = loadImage("fourdboy.png");
  chud_wt = loadImage("chud_wt.png");
  ltc_bk = loadImage("ltc_bk.png");
  ltc_wt = loadImage("ltc_wt.png");
  ralp_bk = loadImage("ralp_bk.png");
  sbsm_1 = loadImage("sbsm1.jpg");
  sbsm_2 = loadImage("sbsm2.jpg");
  sbsm_3 = loadImage("sbsm3.jpg");
  sbsm_4 = loadImage("sbsm4.jpg");
  sultan_bk = loadImage("sultan_bk.png");
  sultan_wt = loadImage("sultan_wt.png");


  MidiBus.list();
  nanoKontrol = new MidiBus(this, "SLIDER/KNOB", "CTRL", "nanoKontrol");
  vdmxKontrol = new MidiBus(this, "From VDMX", "To VDMX", "vdmxKontrol");


  kontrol = new Controller();


  s = new Sifon(this, width, height, P2D);

}


void setImage() {
  if (kontrol.get("fourdboy") > 0) {
    current = fourdboy;
  }

  if (kontrol.get("chud") > 0) {
    current = chud_wt;
  }

  if (kontrol.get("ltc_bk") > 0) {
    current = ltc_bk;
  }

  if (kontrol.get("ltc_wt") > 0) {
    current = ltc_wt;
  }

  if (kontrol.get("ralp_bk") > 0) {
    current = ralp_bk;
  }

  if (kontrol.get("sbsm1") > 0) {
    current = sbsm_1;
  }

  if (kontrol.get("sbsm2") > 0) {
    current = sbsm_2;
  }

  if (kontrol.get("sbsm3") > 0) {
    current = sbsm_3;
  }

  if (kontrol.get("sbsm4") > 0) {
    current = sbsm_4;
  }

  if (kontrol.get("sultan_bk") > 0) {
    current = sultan_bk;
  }

  if (kontrol.get("sultan_wt") > 0) {
    current = sultan_wt;
  }
}


void draw() {


  s.begin();

  s.g.imageMode(CENTER);

  // if (kontrol.get("safeLock") == 0) {
    setImage();
  // }

  s.g.image(current, width/2, height/2);


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

  try {
    if (bus_name == "nanoKontrol") {
      kontrol.handleMidiEvent(channel, number, value);

    }

    if (bus_name == "vdmxKontrol") {

    }

  } catch (Exception e) {

  }

}


void noteOn(int channel, int pad, int velocity, long timestamp, String bus_name) {



}