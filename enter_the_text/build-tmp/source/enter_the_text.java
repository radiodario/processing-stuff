import processing.core.*; 
import processing.data.*; 
import processing.event.*; 
import processing.opengl.*; 

import lazer.viz.*; 
import controlP5.*; 

import java.util.HashMap; 
import java.util.ArrayList; 
import java.io.File; 
import java.io.BufferedReader; 
import java.io.PrintWriter; 
import java.io.InputStream; 
import java.io.OutputStream; 
import java.io.IOException; 

public class enter_the_text extends PApplet {




LazerSyphon send;

String textString = "";
PFont font;
CheckBox liveText;

int width = 1024;
int height = 768;
int fontSize = 60;      

ControlP5 cp5;

public void setup() {
  size (800, 600, P3D);

  send = new LazerSyphon(this, width, height, P3D);
  cp5 = new ControlP5(this);

  font = createFont("FuturaStd-HeavyOblique",80);

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
     .setRange(10,300)
     .setNumberOfTickMarks(25)
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

  liveText = cp5.addCheckBox("liveTextToggle")
    .setPosition(10, 180)
    .setSize(20, 20)
    .addItem("liveText", 0)
    ;

}

public void draw() {



  send.begin();
  send.g.background(0);
  send.g.textFont(font);
  send.g.textSize(fontSize);
  send.g.textAlign(CENTER, CENTER);
  // send.g.fill(255);
  send.g.text(textString, 10, 10, width - 10, height -10);
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


public void textValue(String theText) {
  // receiving text from controller textinput
  println("a textfield event for controller 'textinput': "+theText);
  textString = theText;
}

public void keyPressed(){
  if ((int)liveText.getArrayValue()[0] < 1) {
    return;
  }
  if (keyCode == SHIFT) {
    return;
  }
  if (keyCode != BACKSPACE) { // make sure you're not trying to delete text,
    textString += key;

  }else{ // if it turns out that you were trying to delete a character,
    if (textString.length() < 1) return;
    textString = textString.substring(0, textString.length() - 1);  
  }
}
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "enter_the_text" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
