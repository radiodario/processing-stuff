import toxi.color.*;
import toxi.color.theory.*;

import lazer.viz.*;

LazerController kontrol;
LazerSyphon send;
Colors colors;

PImage img;

int width = 1024;
int height = 768;

Seeds seedEngine;

boolean started = false;

void setup() {

    size(800, 600, P2D);

    kontrol = new LazerController(this);
    setControls();

    colors = new Colors(30*30);

    seedEngine = new Seeds(this, width, height);

    send = new LazerSyphon(this, width, height, P3D);

}


void draw() {



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

void setControls() {
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
