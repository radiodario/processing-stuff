import processing.core.*; 
import processing.data.*; 
import processing.event.*; 
import processing.opengl.*; 

import toxi.color.*; 
import toxi.color.theory.*; 
import lazer.viz.*; 

import java.util.HashMap; 
import java.util.ArrayList; 
import java.io.File; 
import java.io.BufferedReader; 
import java.io.PrintWriter; 
import java.io.InputStream; 
import java.io.OutputStream; 
import java.io.IOException; 

public class enter_windows extends PApplet {






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

public void setup(){
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

public void draw(){

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

public PImage getRandomImage() {

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

public void setControls() {
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
class Star {
  float x=0,y=0,z=0,sx=0,sy=0, size;
  PImage sprite;

  public void SetPosition(){
    z=(float) random(200,255);
    x=(float) random(-1000,1000);
    y=(float) random(-1000,1000);
    sprite = getRandomImage();
  }

  public void DrawStar(PGraphics p){



    if (z < kontrol.get("speed")){
      this.SetPosition();
    }
    z -= kontrol.get("speed");
    sx = (x * kontrol.get("spread")) / (z) + CX;
    sy = (y * kontrol.get("spread"))/(4+z)+CY;

    size = map(z, 255, -250, 0, kontrol.get("maxSize")*10);

    if (sx<0 | sx>width){
      this.SetPosition();
    }
    if (sy<0 | sy>height){
      this.SetPosition();
    }
    p.tint(color(255 - (int) z,255 - (int) z,255 - (int) z));


    //image(windows, sx, sy, size, size);
    p.imageMode(CENTER);
    p.image(sprite, sx, sy, size, size);

    //ellipse( (int) sx,(int) sy,20,20);
  }




}
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "enter_windows" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
