import processing.core.*; 
import processing.data.*; 
import processing.event.*; 
import processing.opengl.*; 

import toxi.color.*; 
import toxi.color.theory.*; 
import toxi.util.events.*; 
import themidibus.*; 
import codeanticode.syphon.*; 

import java.util.HashMap; 
import java.util.ArrayList; 
import java.io.File; 
import java.io.BufferedReader; 
import java.io.PrintWriter; 
import java.io.InputStream; 
import java.io.OutputStream; 
import java.io.IOException; 

public class ferries extends PApplet {







MidiBus nanoKontrol;
MidiBus vdmxKontrol;
Controller kontrol;
Sifon send;
Colors colors;

PImage img;

int width = 1024;
int height = 768;

Seeds seedEngine;

boolean started = false;

public void setup() {

    size(800, 600, P2D);

    MidiBus.list();
    nanoKontrol = new MidiBus(this, "SLIDER/KNOB", "CTRL", "nanoKontrol");
    vdmxKontrol = new MidiBus(this, "From VDMX", "To VDMX", "vdmxKontrol");

    kontrol = new Controller();

    colors = new Colors(30*30);

    println(width + "," + height);

    seedEngine = new Seeds(this, width, height);

    send = new Sifon(this, width, height, P3D);

}


public void draw() {



    colors.update();
    seedEngine.update();

    started = true;

    send.begin();
    send.g.image(seedEngine.getImage(), 0, 0);
    send.end();


    background(0);
    fill(255);
    if (kontrol.get("hideFrame") > 0) {
        text("preview:", 200, 90);
        image(send.g, 200, 100, width/2, height/2);
    }

    send.send();

    kontrol.printMappings();
    text("running", 10, 10);

}

public void controllerChange(int channel, int number, int value, long timestamp, String bus_name) {

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


public void noteOn(int channel, int pad, int velocity, long timestamp, String bus_name) {
  println(timestamp + " - Handled noteon " + channel + " " + pad + " " + velocity + " " + bus_name);

  // kontrol.handleMidiEvent(channel, pad, velocity);
  try {

    if (channel == 0) {

    }

    if (channel == 1) {
      kontrol.setControlValueFromNote("xOffset", pad);
    }

    if (channel == 2) {
      kontrol.setControlValueFromNote("yOffset", pad);
    }

    if (channel == 3) {
      kontrol.setControlValueFromNote("zOffset", pad);
    }
  } catch (Exception e) {

  }



}

class Colors {

  ColorTheme t;
  ColorList l;
  int colorCounter;
  int numColors;

  public Colors(int numColors) {
    this.numColors = numColors;

    this.colorCounter = 0;

    setRandomBrightColors();
  }

  public void setRandomBrightColors() {
    t = new ColorTheme("random");

    t.addRange(ColorRange.BRIGHT, TColor.newRandom(), random(0.02f, 0.5f));
    t.addRange(ColorRange.BRIGHT, TColor.newRandom(), random(0.02f, 0.5f));
    t.addRange(ColorRange.BRIGHT, TColor.newRandom(), random(0.02f, 0.5f));
    t.addRange(ColorRange.BRIGHT, TColor.newRandom(), random(0.02f, 0.5f));
    t.addRange(ColorRange.BRIGHT, TColor.newRandom(), random(0.02f, 0.5f));

    l = t.getColors(numColors);


  }

  public void setRandomDarkColors() {
    t = new ColorTheme("random");

    t.addRange(ColorRange.INTENSE, TColor.newRandom(), random(0.02f, 0.5f));
    t.addRange(ColorRange.INTENSE, TColor.newRandom(), random(0.02f, 0.5f));
    t.addRange(ColorRange.INTENSE, TColor.newRandom(), random(0.02f, 0.5f));
    t.addRange(ColorRange.INTENSE, TColor.newRandom(), random(0.02f, 0.5f));
    t.addRange(ColorRange.INTENSE, TColor.newRandom(), random(0.02f, 0.5f));

    l = t.getColors(numColors);


  }


  public void setVoidColors() {
    t = new ColorTheme("enter_the_void");

    t.addRange(ColorRange.BRIGHT, TColor.newHex("34232a"), 0.5547332f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("5e3f6b"), 0.12577668f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("895844"), 0.07337354f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("8a637a"), 0.027640717f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("3e816f"), 0.02567617f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("76331f"), 0.024122808f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("94679c"), 0.020239402f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("346238"), 0.016949927f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("c44531"), 0.012701023f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("cc9718"), 0.0116959065f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("f5da16"), 0.011101974f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("ce9cb9"), 0.011056286f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("de7461"), 0.008954679f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("533399"), 0.007903874f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("9357ba"), 0.006761696f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("6536bb"), 0.0065789474f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("4db8a7"), 0.0061677634f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("8eaa58"), 0.005391082f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("57a846"), 0.0046600876f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("dcc867"), 0.004431652f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("37257a"), 0.0042945906f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("bad2b0"), 0.0038834065f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("6c5d15"), 0.0029239766f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("af68f0"), 0.002741228f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("b23997"), 0.0021472953f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("f8632d"), 0.0021472953f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("da4ee6"), 0.0019188597f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("997a0b"), 0.0018731726f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("5a7ea9"), 0.001370614f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("e4dae5"), 0.001324927f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("51cb69"), 0.001050804f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("d349ad"), 0.001050804f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("8fa3bd"), 9.137427e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("e092ee"), 5.482456e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("fbbcb3"), 5.482456e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("ec44dd"), 5.025585e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("a9c529"), 4.5687135e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("c84c08"), 4.111842e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("81dda8"), 4.111842e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("385c87"), 3.6549708e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("f38c90"), 3.6549708e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("4d33f9"), 3.1980994e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("a7375e"), 2.741228e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("b49b85"), 2.741228e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("f7fa4f"), 2.2843567e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("493f00"), 1.8274854e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("30c3dc"), 1.8274854e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("893ef2"), 1.8274854e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("b68a44"), 1.8274854e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("fc801f"), 1.370614e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("83a409"), 1.370614e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("5cc456"), 9.137427e-5f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("4f811a"), 9.137427e-5f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("6864d1"), 9.137427e-5f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("a5d668"), 9.137427e-5f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("c6edc0"), 4.5687135e-5f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("ff9de5"), 4.5687135e-5f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("862279"), 4.5687135e-5f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("a6280f"), 4.5687135e-5f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("617150"), 4.5687135e-5f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("bffff4"), 4.5687135e-5f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("739f85"), 4.5687135e-5f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("acbee2"), 4.5687135e-5f);

    l = t.getColors(numColors);

  }


  public int getAColor() {

     return l.get((int) random(numColors)).toARGB();


  }

  public int getNextColor() {
    return l.get(++colorCounter % numColors).toARGB();

  }

    public void update() {
    if (kontrol.get("setRandomBrightColors") > 0) {
      colors.setRandomBrightColors();
    }

    if (kontrol.get("setRandomDarkColors") > 0) {
      colors.setRandomDarkColors();
    }


    if (kontrol.get("setVoidColors") > 0) {
      colors.setVoidColors();
    }

  }

}
class Seeds {

    PGraphics p;
    PGraphics q;
    int numRandSeeds = 10;
    boolean getDiagonal = false;
    int steps = 100;

    ArrayList<Integer> seeds;
    boolean [] traversed;
    int step = 0;
    PImage img;
    boolean finishIt = false;

    int w;
    int h;

    public Seeds(PApplet applet, int w, int h) {
        this.w = w;
        this.h = h;

        p = applet.createGraphics(w, h, P3D);
        q = applet.createGraphics(w, h, P3D);
        initialiseImage();
        seeds = new ArrayList<Integer>();
        traversed = new boolean[w * w];

    }

    public void initialiseImage() {
        // noop

    }

    public void drawBackdrop() {
        q.beginDraw();
        q.fill(0, 0, 0, map(kontrol.get("bgAlpha"), 0, 127, 0, 255));
        q.rect(0, 0, w, h);
        q.image(p, 0, 0);
        q.endDraw();
    }


    public void update() {

        steps = (int) map(kontrol.get("steps"), 0, 127,10, 10000);

        if (kontrol.get("useHSB") > 0) {
            p.colorMode(HSB, 127, 127, 127);
        } else {
            p.colorMode(RGB, 127, 127, 127);
        }

        if (kontrol.get("diagonal") > 0) {
            getDiagonal = true;
        } else {
            getDiagonal = false;
        }


        p.loadPixels();

        if (step == 0) {

            for (int i = 0; i < numRandSeeds; i++) {
                int seed = PApplet.parseInt(random(this.w * this.h));
                seeds.add(seed);
                traversed[seed] = true;
            }

        } else {
            updateSeeds();
        }

        if (step < steps) {
            step++;
            p.updatePixels();
        } else {
            step = 0;
            traversed = new boolean[width*height];
        }

        p.blendMode(MULTIPLY);

        p.image(p, 0, 0);
        drawBackdrop();


    }


    public void updateSeeds() {
        // noise offsets
        float xOff = 0.0f;  //noise vals
        float zOff = 0.0f;
        noiseDetail(3, .029f);

        // iterate backwards to remove
        for (int i = seeds.size()-1; i >= 0; i--) {
            float yOff = 0.0f;

            // extract x / y from position in array
            int x = seeds.get(i) % w;
            int y = seeds.get(i) / w;

            float a, b, c, aph;

            // if (kontrol.get("useHSB") == 0) {

            if (kontrol.get("altRGB") > 0) {
                // alternate rgb set
                a = 255 - noise(frameCount * 0.009f) * 255;
                b = frameCount * 0.2f % 255;
                c = 255 - noise( 1 + frameCount * 0.005f) * 255;
            } else {
                a = noise(zOff, xOff, yOff) * 512;
                b = noise(xOff, yOff, zOff) * 512;
                c = noise(yOff, zOff, yOff) * 512;
            }

            // } else {
            //     a = map(noise(xOff,yOff),0,1,0,255);
            //     b = map(noise(xOff*yOff),0,1,100,255);
            //     c = map(noise(yOff),0,1,0,255);
            // }

            if (kontrol.get("useAlpha") > 0) {
                aph = 255 - noise(xOff, yOff) * 10;
            } else {
                aph = 255;
            }


            p.pixels[x + y * width] = color(
                    kontrol.get("hue") + a,
                    kontrol.get("sat") + b,
                    kontrol.get("bri") + c,
                    aph);
            // p.pixels[x + y * width] = color(a, b, c, aph);

            int mapi = PApplet.parseInt(lerp(i, y, 0.1f));

            // alpha



            // update this pixel

            // p.pixels[x + y * width] = colors.getAColor();

            // get neighboring pixels, check if they have already
            // been stored - if not, add them to the list and flag them
            // as traversed
            //int n = int(noise(zOff,yOff,xOff)*random(frameCount%xOff)); // changing random val generates diff images
            int n = PApplet.parseInt(noise(xOff, yOff, zOff) * random(3));
            int rand = PApplet.parseInt(random(1)); // random directions for seeds to offset themselves
            int rand2 = PApplet.parseInt(random(2)); // random directions for seeds to offset themselves

            // get neighboring pixels, check if they have already
            // been stored - if not, add them to the list and flag them
            // as traversed

            /* Things to try */
            // playing with the if statements below can generate interesting results. For instance try subtracting i from y or adding i to x.
            // playing with the index values is another path to creating varied results.  Try adding random numbers or noise values.
            // The UP RIGHT DOWN & LEFT indices can be commented out



            // UP
            int upIndex = seeds.get(i) - width;// + kontrol.get("upIndex");
            boolean upCheck = y - i > 0;
            if (upCheck && !traversed[upIndex]) {
              seeds.add(upIndex);
              traversed[upIndex] = true;
            }

            // RIGHT
            int rightIndex = seeds.get(i) + 1;// + kontrol.get("rightIndex");
            boolean rightCheck = x < width - 1 - i;

            if (rightCheck && !traversed[rightIndex]) {
              seeds.add(rightIndex);
              traversed[rightIndex] = true;
            }

            // DOWN
            int downIndex = seeds.get(i) + width;// + kontrol.get("downIndex");
            boolean downCheck = y < height-1-i;
            if (downCheck && !traversed[downIndex] ){
              seeds.add(downIndex);
              traversed[downIndex] = true;
            }


            // LEFT
            int leftIndex = seeds.get(i) - 1;// + kontrol.get("leftIndex");
            boolean leftCheck = x - i > 0;
            if (leftCheck && !traversed[leftIndex]) {
              seeds.add(leftIndex);
              traversed[leftIndex] = true;
            }


            // if specified, get diagonal neighbors too...
            if (getDiagonal) {

              // UL
              int ulIndex = seeds.get(i) - width - 1;// + kontrol.get("ulIndex");
              boolean ulCheck = x - i > 0 && y - i > 0;
              if (ulCheck && !traversed[ulIndex]) {
                seeds.add(ulIndex);
                traversed[ulIndex] = true;
              }

              // LL
              int llIndex = seeds.get(i) + width - 1;// + kontrol.get("llIndex");
              boolean llCheck = y < height -1 -i;
              if (llCheck && !traversed[llIndex]) {
                seeds.add(llIndex);
                traversed[llIndex] = true;
              }

              // LR
              int lrIndex = seeds.get(i) + width + 1;// + kontrol.get("lrIndex");
              boolean lrCheck = x < width-1-i && y < height -1 -i;
              if (lrCheck && !traversed[lrIndex]) {
                seeds.add(lrIndex);
                traversed[lrIndex] = true;
              }

              // UR
              int urIndex = seeds.get(i) -width + 1;// + kontrol.get("urIndex");
              boolean urCheck = y-i > 0;
              if (urCheck && !traversed[urIndex]) {
                seeds.add(urIndex);
                traversed[urIndex] = true;
              }


            }


            // getOffsets
            xOff += map(kontrol.get("xOffset"), 0, 127, 0.001f, 0.01f);
            yOff += map(kontrol.get("yOffset"), 0, 127, 0.001f, 0.01f);
            zOff += map(kontrol.get("zOffset"), 0, 127, 0.001f, 0.01f);
            // remove the seed as we go!
            seeds.remove(i);

        }


    }

    public void beat() {

        p.background(0);
        int seed = PApplet.parseInt(random(width*height));
        seeds.add(seed);
        traversed = new boolean[w * w];
        traversed[seed] = false;

        // for (int i=0; i<numRandSeeds; i+=1) { //how many seeds are we making?
        //     int seed = int(random(width*height)); // calculate random seed pos
        //     seeds.add(seed); // add a random seed at a random pos
        //     traversed[seed] = true;
        // }

        // println(numRandSeeds);
        // updateSeeds();
        // RRR();
        // p.updatePixels();
    }

    // reverses the image

    public void RRR(){
        int[] px = new int[seeds.size()];
        for (int i = seeds.size()-1; i >= 0; i-=1) {
          px[i] = p.pixels[seeds.get(i)];
        }

        // sort the results

        //-----------------------------------------------------------------
        px = sort(px);
        px = reverse(px);
        //-----------------------------------------------------------------

        // set the resulting pixels back into place

        for (int i = seeds.size()-1; i >= 0; i-=1) {
          p.pixels[seeds.get(i)] = px[i];
        }

    }


    // gives you the pixels back
    public PGraphics getImage() {
        return q;
    }




}


class Controller {


 int[] midiState;

 HashMap<String,Integer> mappings;


 public Controller() {
   midiState = new int[128];
   mappings = new HashMap<String, Integer>();
   setMappings();
 }


 public int get(String mapping) {

   try {
//     println(mapping + ": " + midiState[mappings.get(mapping)]);
     return midiState[mappings.get(mapping)];
   }
   catch (Exception e) {
     println(mapping + ": -1");
     return -1;
   }

 }


 public void handleMidiEvent(int channel, int number, int val) {
   println("Handled " + channel + " " + number + " " + val);
   if (number >= 0) {
     midiState[number] = val;
   }

 }


  public void setControlValueFromNote(String name, int value) {
   midiState[mappings.get(name)] = value;
 }


 public void setMapping(String name, int control) {
   mappings.put(name, control);
 }

 public void setMapping(String name, int control, int initialValue) {
  mappings.put(name, control);
  midiState[mappings.get(name)] = initialValue;
 }


 public void setMappings() {

  setMapping("hue", KNOB1, 110);
  setMapping("sat", KNOB2, 127);
  setMapping("bri", KNOB3, 65);
  setMapping("xOffset", KNOB4, 110);
  setMapping("yOffset", KNOB5, 127);
  setMapping("zOffset", KNOB6, 100);

  setMapping("steps", KNOB8, 100);

  setMapping("setRandomBrightColors", BUTTON_MARKER_SET);
  setMapping("setVoidColors", BUTTON_MARKER_LEFT);
  setMapping("setRandomDarkColors", BUTTON_MARKER_RIGHT);

  setMapping("drawPoints", BUTTON_R1, 1);

  setMapping("bgAlpha", KNOB7, 0);

  // modes
  setMapping("useHSB", BUTTON_RWD, 0);
  setMapping("useAlpha", BUTTON_STOP, 0);
  setMapping("altRGB", BUTTON_PLAY, 0);
  setMapping("diagonal", BUTTON_REC, 0);

  setMapping("hideFrame", BUTTON_R5, 1);


  setMapping("upIndex", SLIDER1, 0);
  setMapping("downIndex", SLIDER2, 0);
  setMapping("leftIndex", SLIDER3, 0);
  setMapping("rightupIndex", SLIDER4, 0);
  setMapping("ulIndex", SLIDER5, 0);
  setMapping("llIndex", SLIDER6, 0);
  setMapping("lrIndex", SLIDER7, 0);
  setMapping("urIndex", SLIDER8, 0);



 }

  public void printMappings() {
   int i = 1;
   pushMatrix();
   pushStyle();
   translate(0, 0, 1);
   fill(0, 0, 0, 80);
   strokeWeight(1);
   stroke(0, 0, 0);
   rect(0, 0, 200, height);

   text("Mappings", 10, 10);
   for (String key : mappings.keySet()) {

      drawMapping(key, ++i);


   }

   popStyle();
   popMatrix();


 }

 public void drawMapping(String key, int i) {

   int x = 10;
   int y = 20 + (i * 20);

   fill(255, 150, 200, 100);
   rect(x - 1, y-10, this.get(key), 15);
   fill(255, 0, 255);
   text(key + " = " + this.get(key), x, y);
 }




}
static int SLIDER1 = 0;
static int SLIDER2 = 1;
static int  SLIDER3 = 2;
static int  SLIDER4 = 3;
static int  SLIDER5 = 4;
static int  SLIDER6 = 5;
static int  SLIDER7 = 6;
static int  SLIDER8 = 7;
static int  KNOB1 = 16;
static int  KNOB2 = 17;
static int  KNOB3 = 18;
static int  KNOB4 = 19;
static int  KNOB5 = 20;
static int  KNOB6 = 21;
static int  KNOB7 = 22;
static int  KNOB8 = 23;
static int BUTTON_RWD = 43;
static int BUTTON_FWD = 44;
static int BUTTON_PLAY = 41;
static int BUTTON_STOP = 42;
static int BUTTON_REC = 45;
static int BUTTON_S1 = 32;
static int BUTTON_S2 = 33;
static int BUTTON_S3 = 34;
static int BUTTON_S4 = 35;
static int BUTTON_S5 = 36;
static int BUTTON_S6 = 37;
static int BUTTON_S7 = 38;
static int BUTTON_S8 = 39;
static int BUTTON_M1 = 48;
static int BUTTON_M2 = 49;
static int BUTTON_M3 = 50;
static int BUTTON_M4 = 51;
static int BUTTON_M5 = 52;
static int BUTTON_M6 = 53;
static int BUTTON_M7 = 54;
static int BUTTON_M8 = 55;
static int BUTTON_R1 = 64;
static int BUTTON_R2 = 65;
static int BUTTON_R3 = 66;
static int BUTTON_R4 = 67;
static int BUTTON_R5 = 68;
static int BUTTON_R6 = 69;
static int BUTTON_R7 = 70;
static int BUTTON_R8 = 71;
static int BUTTON_CYCLE = 46;
static int BUTTON_MARKER_SET = 60;
static int BUTTON_MARKER_LEFT = 61;
static int BUTTON_MARKER_RIGHT = 62;
static int BUTTON_TRACK_PREV = 58;
static int BUTTON_TRACK_NEXT = 59;



class Sifon {

  public PGraphics g;
  public SyphonServer server;

  Sifon(PApplet p, int width, int height, String rendererType){
    g = p.createGraphics(width, height, P3D);

    server = new SyphonServer(p, "Processing Syphon");
  }

  public void send(){
    server.sendImage(g);
  }


  public void begin() {
    g.beginDraw();
    g.colorMode(RGB, 255);
  }

  public void end() {
    g.endDraw();
  }

}
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "ferries" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
