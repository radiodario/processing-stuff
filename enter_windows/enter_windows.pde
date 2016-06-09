import toxi.color.*;
import toxi.color.theory.*;

import lazer.viz.*;

LazerController kontrol;
LazerSyphon send;

int numstars=100;
int SPREAD=64;
int CX,CY;
float SPEED=5;

int width = 800;
int height = 480;

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

  kontrol = new LazerController(this);
  setControls();

  send = new LazerSyphon(this, width, height, P2D);

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

void setControls() {
  kontrol.setMapping("speed", kontrol.SLIDER4, 2);
  kontrol.setMapping("spread", kontrol.SLIDER5, 60);
  kontrol.setMapping("maxSize", kontrol.SLIDER6, 50);
  kontrol.setMapping("drawBackground", kontrol.BUTTON_REC);
  kontrol.setMapping("drawWindows", kontrol.BUTTON_RWD);
  kontrol.setMapping("drawFloppies", kontrol.BUTTON_FWD);
  kontrol.setMapping("drawWhat", kontrol.KNOB5, 50);
  kontrol.setMapping("hideFrame", kontrol.BUTTON_R5, 1);

  kontrol.setNoteControl("maxSize", kontrol.VDMX_LOW);

}
