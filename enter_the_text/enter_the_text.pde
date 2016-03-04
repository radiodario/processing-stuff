import lazer.viz.*;
import controlP5.*;

LazerSyphon send;

String textValue = "";
PFont font;

int width = 800;
int height = 600;
int fontSize = 60;      

ControlP5 cp5;

void setup() {
  size (800, 600, P3D);

  send = new LazerSyphon(this, width, height, P3D);
  cp5 = new ControlP5(this);

  font = createFont("impact",80);

  cp5 = new ControlP5(this);

  cp5.addTextfield("textValue")
     .setPosition(10,50)
     .setSize(180,20)
     .setFont(createFont("arial",20))
     .setAutoClear(false)
     ;

   cp5.addSlider("fontSize")
     .setPosition(10,100)
     .setSize(180,20)
     .setRange(10,200)
     .setNumberOfTickMarks(5)
     ;

  cp5.getController("fontSize")
    .getCaptionLabel()
    .align(ControlP5.LEFT, ControlP5.BOTTOM_OUTSIDE)
    .setPaddingX(0);

  cp5.addBang("clear")
     .setPosition(10,150)
     .setSize(180,20)
     .getCaptionLabel().align(ControlP5.CENTER, ControlP5.CENTER)
     ;



}

void draw() {

  send.begin();
  send.g.background(0);
  send.g.textFont(font);
  send.g.textSize(fontSize);
  send.g.textAlign(CENTER, CENTER);
  // send.g.fill(255);
  send.g.text(textValue, width/2, height/2);
  send.end();
  send.send();

  background(0);
  fill(255);
  text("preview:", 200, 90);
  image(send.g, 200, 100, width/2, height/2);
  text("running", 10, 10);

}

public void clear() {
  cp5.get(Textfield.class,"textValue").clear();
}