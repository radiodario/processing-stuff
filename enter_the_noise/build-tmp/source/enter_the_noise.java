import processing.core.*; 
import processing.data.*; 
import processing.event.*; 
import processing.opengl.*; 

import toxi.color.*; 
import toxi.color.theory.*; 
import toxi.util.datatypes.*; 
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

public class enter_the_noise extends PApplet {







MidiBus nanoKontrol;
MidiBus vdmxKontrol;
Controller kontrol;
Colors colors;
Sifon send;

int width = 1024;
int height = 768;

Noisefield noisefield;

public void setup() {
  size(800, 600, P2D);

  MidiBus.list();
  nanoKontrol = new MidiBus(this, "SLIDER/KNOB", "CTRL", "nanoKontrol");
  vdmxKontrol = new MidiBus(this, "From VDMX", "To VDMX", "vdmxKontrol");

  kontrol = new Controller();

  send = new Sifon(this, width, height, P3D);

  colors = new Colors(30*30);

  noisefield = new Noisefield(width);

}


public void draw() {

  // float updateRate = map(kontrol.get("updateRate"), 0, 127, 0, 10);

  // if (frameCount % (updateRate +1) == 0) {
  noisefield.update();
  // }

  colors.update();

  send.begin();
  noisefield.draw(send.g);
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

  //println(timestamp + " - Handled noteon " + channel + " " + pad + " " + velocity + " " + bus_name);

  // kontrol.handleMidiEvent(channel, pad, velocity);
  try {

    if (channel == 0) {
      // piscina.beat();
    }

    if (channel == 1) {
      kontrol.setControlValueFromNote("elevation", pad);
    }

    if (channel == 2) {
      // kontrol.setControlValueFromNote("maxSize", pad);
    }

    if (channel == 3) {
      // kontrol.setControlValueFromNote("strokeWidth", pad);
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

  public void setGradient() {

    t = new ColorTheme("random");

    t.addRange(ColorRange.BRIGHT, TColor.newRandom(), random(0.02f, 0.5f));
    t.addRange(ColorRange.BRIGHT, TColor.newRandom(), random(0.02f, 0.5f));
    t.addRange(ColorRange.BRIGHT, TColor.newRandom(), random(0.02f, 0.5f));
    t.addRange(ColorRange.BRIGHT, TColor.newRandom(), random(0.02f, 0.5f));
    t.addRange(ColorRange.BRIGHT, TColor.newRandom(), random(0.02f, 0.5f));

    ColorList tl = t.getColors(5);

    ColorGradient grad = new ColorGradient();

    grad.addColorAt(0, tl.get(0));
    grad.addColorAt(25, tl.get(1));
    grad.addColorAt(50, tl.get(2));
    grad.addColorAt(75, tl.get(3));
    grad.addColorAt(100, tl.get(4));


    l = grad.calcGradient(0, 100);

  }


    public int getAColor() {
        return l.get((int) random(numColors)).toARGB();
    }

    public int getNextColor() {
        return l.get(++colorCounter % numColors).toARGB();
    }

    public int getColorAt(int colorNumber) {
        return l.get(colorNumber % 100).toARGB();
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


        if (kontrol.get("setGradient") > 0) {
            colors.setGradient();
        }

    }

}
class Noisefield {

    double[] map;
    int charwidth = 10;
    int cellW, cellH;

    float xSpeed = 0.005f;
    float ySpeed = 0.005f;
    float step = 0.10f;
    float xOffset = 0;
    float yOffset = 0;
    float xPos = 0;
    float yPos = 0;


    public Noisefield(int width) {
        cellW = width/charwidth;
        cellH = height/charwidth;

        map = new double[cellW*cellH];
    }

    public void draw(PGraphics p) {

        p.beginCamera();
        p.camera();
        if (kontrol.get("rotateCam") > 0) {
          float fov = PI/map(kontrol.get("fov"), 0, 127, 1, 10);
          float cameraZ = (height/2.0f) / tan(fov/2.0f);
          p.perspective(fov, PApplet.parseFloat(width)/PApplet.parseFloat(height), cameraZ/2.0f, cameraZ*2.0f);


          p.translate(0, 0, map(kontrol.get("zoom"), 0, 127, 0, -1000));
          p.rotateX(map(kontrol.get("rotateX"), 0, 127, 0, 2*PI));
          p.rotateY(map(kontrol.get("rotateY"), 0, 127, 0, 2*PI));
          p.rotateZ(map(kontrol.get("rotateZ"), 0, 127, 0, 2*PI));
        }
        p.endCamera();

        // drawBg(p);

        p.strokeCap(ROUND);
        p.translate(charwidth/2, charwidth/2);
        for (int i = 0; i < map.length; i++) {
            p.pushMatrix();

            int col = (i % cellW);
            int row = (int) ((i - col) / cellH);

            p.translate(col * charwidth, row * charwidth, (float) (0.5f-map[i]) * kontrol.get("elevation") * kontrol.get("elevationFactor"));

            p.strokeWeight(kontrol.get("strokeWidth"));


            if (kontrol.get("drawLines") > 0) {
                if (kontrol.get("rotate") > 0) {
                    p.rotate((int) (2*PI/map[i]));
                }


                float factor = 1;
                if (kontrol.get("factor") > 0 ) {
                    factor = (float) map[i];
                }

                if (kontrol.get("voidColors") > 0) {
                    p.stroke(colors.getColorAt((int) (map[i] * 100)));
                } else {
                    p.stroke((int) (map[i]*127), 127, 127, kontrol.get("fgAlpha"));
                }

                p.strokeCap(ROUND);

                if (map[i] >= 0.5f) {
                    p.line(-charwidth * factor, -charwidth * factor,
                            charwidth * factor,  charwidth * factor);
                } else {
                    p.line(-charwidth * factor,  charwidth * factor,
                            charwidth * factor, -charwidth * factor);
                }
            } else {

                p.noStroke();
                if (kontrol.get("voidColors") > 0) {
                    p.fill(colors.getColorAt((int) (map[i] * 100)));
                } else {
                    p.fill((int) (map[i]*127), 127, 127, kontrol.get("fgAlpha"));
                }

                int strokeW = kontrol.get("strokeWidth");

                if (map[i] >= 0.5f) {
                    p.quad(-charwidth, -charwidth,
                         0, -charwidth,
                         0, charwidth,
                         charwidth, charwidth
                        );
                } else {
                    p.quad(-charwidth, charwidth,
                        0, charwidth,
                        0, -charwidth,
                        charwidth, -charwidth
                        );
                }
            }


            p.popMatrix();
        }
    }


    public void reset(int newCharwidth) {
        charwidth = newCharwidth;
        cellW = width/charwidth;
        cellH = height/charwidth;

        map = new double[cellW*cellH];
    }


    public void drawBg(PGraphics p) {
        p.fill(0, 0, 0, kontrol.get("bgAlpha"));
        p.noStroke();
        p.rect(0, 0, width, height);
    }


    public void update() {

        if (kontrol.get("reset")>0) {
            reset(kontrol.get("charwidth") + 1);
        }

        step = map(kontrol.get("step"), 0, 127, 0, 1) + 0.00001f;

        xPos = xOffset;
        yPos = yOffset;
        for (int i = 0; i < map.length; i++) {
            map[i] = noise(xPos, yPos);
            // if we jump a row, add one step to yPos
            // but bring back xPos to what it was.
            if ((i % cellW) == 0) {
              yPos += step;
              xPos -= step * cellW;
            }
            xPos += step;
        }
        xOffset += map(kontrol.get("xSpeed"), 0, 127, -0.1f, 0.1f);
        yOffset += map(kontrol.get("ySpeed"), 0, 127, -0.1f, 0.1f);
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
     println(mapping + ": -1 \n" + e);
     return -1;
   }

 }


 public void handleMidiEvent(int channel, int number, int value) {
   println("Handled " + channel + " " + number + " " + value);
   if (number >= 0) {
     midiState[number] = value;
   }

 }


 public void setControlValueFromNote(String name, int value) {
   midiState[mappings.get(name)] = value;
 }


 public void setMapping(String name, int control) {
   mappings.put(name, control);
   midiState[control] = 0;
 }

 public void setMapping(String name, int control, int initialValue) {
  mappings.put(name, control);
  midiState[mappings.get(name)] = initialValue;
 }


 public void setMappings() {
   // add mappings here
   setMapping("bgAlpha", SLIDER1, 10);
   setMapping("fgAlpha", SLIDER2, 127);
   setMapping("hideFrame", BUTTON_R5, 1);

   setMapping("strokeWidth", SLIDER3, 10);

   setMapping("setRandomBrightColors", BUTTON_MARKER_SET, 1);
   setMapping("setVoidColors", BUTTON_MARKER_LEFT);
   setMapping("setRandomDarkColors", BUTTON_MARKER_RIGHT);
   setMapping("setGradient", BUTTON_CYCLE);

   setMapping("voidColors", BUTTON_M1, 1);

   setMapping("reset", BUTTON_TRACK_NEXT);
   setMapping("charwidth", KNOB1, 10);

   setMapping("xSpeed", SLIDER4, 64);
   setMapping("ySpeed", SLIDER5, 64);

   setMapping("step", KNOB7, 2);

   setMapping("rotate", BUTTON_R4, 0);

   setMapping("factor", BUTTON_R2, 0);

   setMapping("elevation", SLIDER8, 0);
   setMapping("elevationFactor", KNOB8);

   setMapping("updateRate", KNOB3, 0);

   setMapping("drawLines", BUTTON_PLAY, 1);

   setMapping("rotateCam", BUTTON_S4);
   setMapping("zoom", SLIDER6);
   setMapping("fov", SLIDER7);
   setMapping("rotateX", KNOB4);
   setMapping("rotateY", KNOB5);
   setMapping("rotateZ", KNOB6);

 }

 public void printMappings() {
   int i = 1;
   pushMatrix();
   pushStyle();
   translate(0, 0);
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
   int y = (i * 15);

   fill(255, 150, 200, 100);
   rect(x - 1, y-10, this.get(key), 14);
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
static int BASS;
static int MID;
static int HIGH;
static int PEAK;



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
    g.background(0);
    g.colorMode(HSB, 127);
  }

  public void end() {
    g.endDraw();
  }

}
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "enter_the_noise" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
