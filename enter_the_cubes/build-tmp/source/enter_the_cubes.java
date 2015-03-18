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

public class enter_the_cubes extends PApplet {




//import toxi.util.datatypes.*;




LazerController kontrol;
LazerSyphon s;


Cubes cubes;
Colors colors;

Boolean setupReady = false;

int width = 1024;
int height = 768;

public void setup()  {
  size(800, 600, P2D);

  frameRate(60);


  kontrol = new LazerController(this);

  colors = new Colors(30*30);
  cubes = new Cubes(30, kontrol.beatManager);

  s = new LazerSyphon(this, width, height, P3D);

  setControls();

  setupReady = true;

}

public void draw()  {

  if (kontrol.get("avoidBeat") > 0) {
    kontrol.beatManager.setBeat();
  }

  s.begin();
  if (kontrol.get("ortho") == 0) {
    s.g.ortho(0, width, 0, height);
  } else {
    float fov = PI/map(kontrol.get("fov"), 0, 127, 1, 10);
    float cameraZ = (height/2.0f) / tan(fov/2.0f);
    s.g.perspective(fov, PApplet.parseFloat(width)/PApplet.parseFloat(height), cameraZ/2.0f, cameraZ*2.0f);
  }

  if (kontrol.get("lights") > 0) {
    s.g.lights();
  }


  cubes.draw(s.g);
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
  colors.update();
  cubes.update();
}

public void setControls() {

  kontrol.setMapping("decay",  kontrol.SLIDER1, 10);
  kontrol.setMapping("resetLife",  kontrol.BUTTON_CYCLE);
  kontrol.setMapping("fullLife", kontrol.BUTTON_TRACK_PREV);
  kontrol.setMapping("avoidBeat",  kontrol.BUTTON_TRACK_NEXT);
  kontrol.setMapping("resetLife",  kontrol.BUTTON_R2);
  kontrol.setMapping("setRandomBrightColors",  kontrol.BUTTON_MARKER_SET, 1);
  kontrol.setMapping("setVoidColors",  kontrol.BUTTON_MARKER_LEFT);
  kontrol.setMapping("setRandomDarkColors",  kontrol.BUTTON_MARKER_RIGHT);
  kontrol.setMapping("randomGrowth", kontrol.BUTTON_R3, 1);
  kontrol.setMapping("fill", kontrol.BUTTON_S1, 1);
  kontrol.setMapping("stroke", kontrol.BUTTON_M1, 0);
  kontrol.setMapping("strokeWidth",  kontrol.SLIDER2);
  kontrol.setMapping("fov",  kontrol.SLIDER7);
  kontrol.setMapping("hue",  kontrol.KNOB1, 127);
  kontrol.setMapping("sat",  kontrol.KNOB2, 100);
  kontrol.setMapping("bri",  kontrol.KNOB3, 127);
  kontrol.setMapping("randomFill", kontrol.BUTTON_S2);
  kontrol.setMapping("randomStroke", kontrol.BUTTON_M2);
  kontrol.setMapping("nextFill", kontrol.BUTTON_S3, 1);
  kontrol.setMapping("nextStroke", kontrol.BUTTON_M3);
  kontrol.setMapping("rotate", kontrol.BUTTON_S4);
  kontrol.setMapping("rotateX",  kontrol.KNOB4);
  kontrol.setMapping("rotateY",  kontrol.KNOB5);
  kontrol.setMapping("rotateZ",  kontrol.KNOB6);
  kontrol.setMapping("zJitter",  kontrol.BUTTON_S6);
  kontrol.setMapping("zJitterAmount",  kontrol.SLIDER6);
  kontrol.setMapping("sphere", kontrol.BUTTON_RWD);
  kontrol.setMapping("sphereDetail", kontrol.SLIDER8);
  kontrol.setMapping("ortho",  kontrol.BUTTON_REC);
  kontrol.setMapping("lights", kontrol.BUTTON_R1,1);
  kontrol.setMapping("hideFrame",  kontrol.BUTTON_R5, 1);


  kontrol.setNoteControl("decay", kontrol.VDMX_MID);
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

class Cube implements LazerBeatListener {

  int x;
  int y;
  int z;
  int h;
  int s;
  int l;
  float life = 1;
  int size;

  public Cube(int x, int y, int size) {
    this.x = x;
    this.y = y;
    this.z = 0;
    this.size = size;
  }

  public void beat() {
    if (kontrol.get("avoidBeat") == 0) {
      this.life = 0;
    }
  }

  public void draw(PGraphics p) {
    p.pushMatrix();

    if (kontrol.get("zJitter") > 0) {
      int amt = kontrol.get("zJitterAmount");
      z = (int) random(-amt, amt);
    } else {
      z = 0;
    }

    p.translate(x, y, z);

    p.pushMatrix();
    if (kontrol.get("rotate") > 0) {
      p.rotateX(map(kontrol.get("rotateX"), 0, 127, 0, 2*PI));
      p.rotateY(map(kontrol.get("rotateY"), 0, 127, 0, 2*PI));
      p.rotateZ(map(kontrol.get("rotateZ"), 0, 127, 0, 2*PI));
    } else {
      p.rotateX(-PI/4);
      p.rotateY(PI/4);
    }

    if (kontrol.get("fill") > 0) {

      if (kontrol.get("randomFill") > 0) {
        p.fill(colors.getAColor());
      } else if (kontrol.get("nextFill") > 0) {
        p.fill(colors.getNextColor());
      } else {
        p.fill(kontrol.get("hue"), kontrol.get("sat"), kontrol.get("bri"));
      }


    } else {
      p.noFill();
    }

    p.strokeWeight(map(kontrol.get("strokeWidth"), 0, 127, 0.5f, 100));


    if (kontrol.get("stroke") > 0) {
      if (kontrol.get("randomStroke") > 0) {
        p.stroke(colors.getAColor());
      } else if (kontrol.get("nextStroke") > 0) {
        p.stroke(colors.getNextColor());
      } else {
        p.stroke(kontrol.get("hue"), kontrol.get("sat"), kontrol.get("bri"));
      }
    } else {
      p.noStroke();
    }


    if (kontrol.get("sphere") > 0) {
      p.sphereDetail((int)map(kontrol.get("sphereDetail"), 0, 127, 1, 10));
      p.sphere(life*size);
    } else {
      p.box(life*size);
    }
    p.popMatrix();
    p.popMatrix();
  }

  public void setColor(int h, int s, int l) {
    this.h = h;
    this.s = s;
    this.l = l;
  }


  public void update() {

    if (kontrol.get("resetLife") > 0) {
      this.life = 0;
    }

    if (kontrol.get("fullLife") > 0) {
      this.life = 0;
    }


    if (kontrol.get("randomGrowth") > 0) {
      float amt = map(kontrol.get("decay"), 0, 127, 0, 0.5f);
      this.life += random(-amt, amt) ;
    } else {
      float amt = map(kontrol.get("decay"), 0, 127, 0, 0.2f);
      this.life += amt;
    }




  }

  public boolean dead() {
    return false;
//    return (this.life <= 0);
  }
}
class Cubes {

  ArrayList<Cube> cubes;
  int numCubes;
  int cubesPerRow = 10;

  public Cubes(int max, LazerBeatManager beatManager) {
    int cubeSide = width/cubesPerRow;

    numCubes = 30*30;

    cubes = new  ArrayList<Cube>();

    float x = 0, y = 0;
    int row = 0;
    int col = 0;

    for (int i = 0; i < numCubes; i++) {

      if (col > cubesPerRow) {
        row++;
        col = 0;
      }

      float gridStep = cubeSide * tan(PI/4);
      float gridStepY = cubeSide * sin(PI/4);

      if (row % 2 > 0) {
        x = col * (gridStep);
      } else {

        x = (col * gridStep) + gridStep/2;
      }

      y = gridStepY * row;

      col++;


      Cube newCube = new Cube((int)x,(int) y, (int) cubeSide);
      cubes.add(newCube);
      beatManager.register(newCube);

    }



  }


  public void draw(PGraphics p) {

    for (Cube cube : cubes) {
      cube.draw(p);
    }

  }


  public void update() {

    for (int i = cubes.size() - 1; i >= 0; i--) {
      Cube c = cubes.get(i);

      c.update();

      if (c.dead()) {
       cubes.remove(c);
      }

    }


  }

  public void addCube() {

  }


}
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "enter_the_cubes" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
