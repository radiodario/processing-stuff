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

public class ferries extends PApplet {






LazerController kontrol;
LazerSyphon send;
Colors colors;

PImage img;

int width = 1024;
int height = 768;

Seeds seedEngine;

boolean started = false;

public void setup() {

    size(800, 600, P2D);

    kontrol = new LazerController(this);
    setControls();

    colors = new Colors(30*30);

    seedEngine = new Seeds(this, width, height);

    send = new LazerSyphon(this, width, height, P3D);

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

public void setControls() {
  kontrol.setMapping("hue", kontrol.KNOB1, 110);
  kontrol.setMapping("sat", kontrol.KNOB2, 127);
  kontrol.setMapping("bri", kontrol.KNOB3, 65);
  kontrol.setMapping("xOffset", kontrol.KNOB4, 110);
  kontrol.setMapping("yOffset", kontrol.KNOB5, 127);
  kontrol.setMapping("zOffset", kontrol.KNOB6, 100);
  kontrol.setMapping("steps", kontrol.KNOB8, 100);
  kontrol.setMapping("setRandomBrightColors", kontrol.BUTTON_MARKER_SET);
  kontrol.setMapping("setVoidColors", kontrol.BUTTON_MARKER_LEFT);
  kontrol.setMapping("setRandomDarkColors", kontrol.BUTTON_MARKER_RIGHT);
  kontrol.setMapping("drawPoints", kontrol.BUTTON_R1, 1);
  kontrol.setMapping("bgAlpha", kontrol.KNOB7, 0);
  kontrol.setMapping("useHSB", kontrol.BUTTON_RWD, 0);
  kontrol.setMapping("useAlpha", kontrol.BUTTON_STOP, 0);
  kontrol.setMapping("altRGB", kontrol.BUTTON_PLAY, 0);
  kontrol.setMapping("diagonal", kontrol.BUTTON_REC, 0);
  kontrol.setMapping("hideFrame", kontrol.BUTTON_R5, 1);
  kontrol.setMapping("upIndex", kontrol.SLIDER1, 0);
  kontrol.setMapping("downIndex", kontrol.SLIDER2, 0);
  kontrol.setMapping("leftIndex", kontrol.SLIDER3, 0);
  kontrol.setMapping("rightupIndex", kontrol.SLIDER4, 0);
  kontrol.setMapping("ulIndex", kontrol.SLIDER5, 0);
  kontrol.setMapping("llIndex", kontrol.SLIDER6, 0);
  kontrol.setMapping("lrIndex", kontrol.SLIDER7, 0);
  kontrol.setMapping("urIndex", kontrol.SLIDER8, 0);

  kontrol.setNoteControl("xOffset", kontrol.VDMX_LOW);
  kontrol.setNoteControl("yOffset", kontrol.VDMX_MID);
  kontrol.setNoteControl("zOffset", kontrol.VDMX_HIGH);

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
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "ferries" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
