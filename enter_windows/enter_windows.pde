import toxi.color.*;
import toxi.color.theory.*;
import toxi.util.datatypes.*;
import toxi.util.events.*;
import themidibus.*;

MidiBus nanoKontrol;
MidiBus vdmxKontrol;
Controller kontrol;
Sifon send;

int numstars=100;
int SPREAD=64;
int CX,CY;
float SPEED=5;

int width = 4104;
int height = 2520;

PImage windows;
PImage winSprite;
PImage floppySprite;
PImage foodSprite;
PImage gameboySprite;
PImage macSprite;
PImage playstationSprite;


PImage[] winIcons;

Star[] s = new Star[numstars];

void setup(){
  size(800,600,P2D);
  colorMode(RGB,255);
  noFill();
  CX=width/2 ; CY=height/2;

  MidiBus.list();
  nanoKontrol = new MidiBus(this, "SLIDER/KNOB", "CTRL", "nanoKontrol");
  vdmxKontrol = new MidiBus(this, "From VDMX", "To VDMX", "vdmxKontrol");

  kontrol = new Controller();

  send = new Sifon(this, width, height, P2D);

  windows = loadImage("windows.png");
  winSprite = loadImage("win98.gif");
  floppySprite = loadImage("floppies.gif");
  foodSprite = loadImage("food.gif");
  gameboySprite = loadImage("gameboy.gif");
  macSprite = loadImage("mac.gif");
  playstationSprite = loadImage("playstation.gif");

  for(int i=0;i<numstars;i++){
    s[i]=new Star();
    s[i].SetPosition();
  }



}

void draw(){

  send.begin();

  if (kontrol.get("drawBackground") > 0) {
    send.g.background(0,0,0);
  }

  for(int i=0;i<numstars;i++){
    s[i].DrawStar(send.g);
  }

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

PImage getRandomImage() {

  // there are 132 icons
  int whichOne = floor(random(0, 108));

  // 15 icons per row
  int row = (whichOne / 15);
  int col = whichOne % 15;
  int w = (floppySprite.width / 15) + 1;



  int what = (int) map(kontrol.get("drawWhat"), 0, 127, 0, 6);
  PImage randomImage;


  switch (what) {
    case 0:
      randomImage = winSprite.get(row * w, col * w, w, w);
      break;
    case 1:
      randomImage = floppySprite.get(row * w, col * w, w, w);
      break;
    case 2:
      randomImage = foodSprite.get(row * w, col * w, w, w);
      break;
    case 3:
      randomImage = gameboySprite.get(row * w, col * w, w, w);
      break;
    case 4:
      randomImage = macSprite.get(row * w, col * w, w, w);
      break;
    case 5:
      randomImage = playstationSprite.get(row * w, col * w, w, w);
      break;
    case 6:
      randomImage = windows;
      break;
    default:
      randomImage = windows;
      break;
  }

  return randomImage;

//  int whichOne = floor(random(0, 107));
//
//  return winIcons[whichOne];

}





void controllerChange(int channel, int number, int value, long timestamp, String bus_name) {

  // println(timestamp + " - Handled controllerChange " + channel + " " + number + " " + value + " " + bus_name);

  if (bus_name == "nanoKontrol") {
    kontrol.handleMidiEvent(channel, number, value);

    if (number == BUTTON_TRACK_NEXT) {

      if (value == 127) {
        println("beat");
        //beatManager.setBeat();
      }
    }
  }

  if (bus_name == "vdmxKontrol") {

    // println("Handled " + channel + " " + number + " " + value);

  }

}


void noteOn(int channel, int pad, int velocity, long timestamp, String bus_name) {

  // println(timestamp + " - Handled noteon " + channel + " " + pad + " " + velocity + " " + bus_name);

  // kontrol.handleMidiEvent(channel, pad, velocity);

  // if (channel == 1) {
  //   kontrol.setControlValueFromNote("spread", pad);
  // }

  if (channel == 1) {
    kontrol.setControlValueFromNote("maxSize", pad);
  }




}


