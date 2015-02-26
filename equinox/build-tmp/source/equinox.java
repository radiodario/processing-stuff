import processing.core.*; 
import processing.data.*; 
import processing.event.*; 
import processing.opengl.*; 

import remixlab.proscene.*; 
import remixlab.dandelion.core.*; 
import remixlab.dandelion.geom.*; 
import processing.pdf.*; 

import java.util.HashMap; 
import java.util.ArrayList; 
import java.io.File; 
import java.io.BufferedReader; 
import java.io.PrintWriter; 
import java.io.InputStream; 
import java.io.OutputStream; 
import java.io.IOException; 

public class equinox extends PApplet {

// Equinox - a sun - earth simulation of truth and beauty.





float easing = 1;
boolean showorbit = true;

Scene scene;


PShader lightShader;

Orbiter moon;
Orbiter earth;

boolean record = false;

boolean followEarth = false;

// measurements
// sun radius: 695800 km
// earth orbit: 149597871 km
// earth radius: 6371 km
// moon orbit: 384400 km
// moon radius: 1736 km

// do everything in sunRadius
float scalee = 0.0001f;
float sunRadius = 695500.0f * scalee;
float earthRadius = 6371.0f * scalee;
float earthOrbit = 149597871.0f * scalee;
float moonOrbit = 384400.0f * scalee;
float moonRadius = 1736.0f * scalee;

float angle = 0;


public void setup() {

  println(scalee + "," + sunRadius + "," + earthRadius + "," + earthOrbit);

  size(1920, 1080, P3D);
  // size(3508, 2480, P3D);
  smooth();
  frameRate(60);

  scene = new Scene(this);
  scene.setAxesVisualHint(false);

  scene.eye().frame().setDampingFriction(0.5f);
  scene.setRadius(earthOrbit+moonOrbit);
  scene.showAll();

  // frustum(-1000, 1000, 1000, -1000, -10000, 10000);
  perspective(1, 2, 1, earthOrbit + moonOrbit);


  // ortho(-earthOrbit*2, earthOrbit*2, earthOrbit, -earthOrbit, -earthOrbit*0.1, earthOrbit );

  colorMode(HSB);

  lights();

  lightShader = loadShader("lightfrag.glsl", "lightvert.glsl");


  moon = new Orbiter(0.02f, 0.001f, moonOrbit, moonRadius, 1, 1, earthRadius);
  earth = new Orbiter(0.001f, 0.001f, earthOrbit, earthRadius, 1, 1, moonOrbit/2);

}

public void update() {
  earth.orbit(0, 0);
  moon.orbit(earth);
}


public void draw() {

  update();

  if (record) {
    // Note that #### will be replaced with the frame number. Fancy!
    // beginRecord(PDF, "frame-####.pdf");
  }

  background(0);

  shader(lightShader);

  directionalLight(255,255,255, 0, 0, 0);

  drawSun();
  earth.draw();
  moon.draw();

  if (followEarth) {
    followEarthMode();
  }

  if (record) {
    // endRecord();
    saveFrame("frame-######.png");
    record = false;
  }

}


public void drawSun() {

  pushStyle();
  noFill();
  stroke(40, 255, 255);
  pushMatrix();
  rotateX(PI/2);
  rotateY(angle += 0.0001f);
  sphereDetail(15);
  sphere(sunRadius);
  popMatrix();

  popStyle();


}

public void followEarthMode() {

}


public void keyPressed() {

  if (key == '1') {
    // cam.lookAt(earth.xr, earth.yr, 0, moonOrbit);
    scene.setAvatar(earth.frame);
    scene.setMouseAsThirdPerson();
    scene.motionAgent().setDefaultGrabber(earth.frame);
    scene.motionAgent().disableTracking();
  }


  if (key == '2') {
    // cam.lookAt(earth.xr, earth.yr, 0, moonOrbit);
    scene.setAvatar(moon.frame);
    scene.setMouseAsThirdPerson();
    scene.motionAgent().setDefaultGrabber(moon.frame);
    scene.motionAgent().disableTracking();
  }

  if (key == '3') {
    scene.unsetAvatar();
    scene.setMouseAsArcball();
    scene.motionAgent().setDefaultGrabber(scene.eye().frame());
    scene.motionAgent().enableTracking();
    scene.camera().interpolateToFitScene();
  }


  if (key == 'r' || key == 'R') {
    record = true;
  }

  if (key == 'o' || key == 'O') {
    showorbit = !showorbit;
  }

}
class Orbiter {
  InteractiveAvatarFrame frame;
  float speed; //Angular velocity of the orbs
  float radius = width/3;  //Base radius of the orbit
  float modX, modY;  //Modifiers for the roundness of the orbit
  float angle;
  float targetX;  //mouseX
  float targetY;  //mouseY
  float planetRadius;
  float rotationalSpeed;
  float x;  //Mouse follower x
  float y;  //Mouse follower y
  float xr, yr;  //Coordinates where the orbs should be
  float rotationalAngle = 0;

  int colour = color(255, 0, 255);

  Orbiter(float orbitSpeed, float rotationalSpeed, float orbitRadius, float planetRadius, float modX, float modY, float trackingRadius) {

    frame = new InteractiveAvatarFrame(scene);
    frame.setPosition(new Vec(xr, yr, 0));
    frame.setAzimuth(QUARTER_PI);
    frame.setInclination(PI*(1/5));
    frame.setTrackingDistance(trackingRadius);


    this.speed = orbitSpeed;
    this.rotationalSpeed = rotationalSpeed;
    this.radius = orbitRadius;
    this.planetRadius = planetRadius;
    this.modX = modX;
    this.modY = modY;
  }


  public void orbit(Orbiter target) {

    this.x = target.xr;
    this.y = target.yr;

    this.targetX = target.xr;
    this.targetY = target.yr;

    calculateOrbit();

  }



  public void orbit(float targetX, float targetY) {
    this.targetX = targetX;
    this.targetY = targetY;

    calculateOrbit();

  }

  public void calculateOrbit() {

    //Creates the mouse follower effect
    float dx = targetX - x;
    if (abs(dx) > 1) {
      x += dx * easing;
    }
    float dy = targetY - y;
    if (abs(dy) > 1) {
      y += dy * easing;
    }


    //Calculates the x and y coordinates of the rotating orb
    xr = x + (radius / modX) * cos(radians(angle));
    yr = y + (radius / modY) * sin(radians(angle));
    angle += speed % 360;

    frame.setPosition(new Vec(xr, yr, 0));
  }

  public void draw() {
    //Line connecting mouse follower to orbs
    // stroke(colour);
    // strokeWeight(0.5);
    // line(xr, yr, x, y);

    //Orbs
    fill(colour);
    strokeWeight(1);
    stroke(244);
    noFill();
    pushMatrix();
    translate(xr, yr);
    pushMatrix();
    rotateX(PI/2);
    rotateY(rotationalAngle += rotationalSpeed);
    sphere(planetRadius);
    popMatrix();
    popMatrix();

    //Outer ellipse of the mouse follower
    stroke(colour);
    strokeWeight(1);
    noFill();
    ellipse(x,y,20,20);

    //Inner ellipse of the mouse follower
    // fill(colour);
    // strokeWeight(1);

    // ellipse(x,y,5,5);

    //Line connecting mouse cursor to orbs
    stroke(colour);
    strokeWeight(0.5f);
    line(xr, yr, targetX, targetY);

    //Orbit trails
    if(showorbit) {
      strokeWeight(1);
      noFill();
      ellipse(x,y,(radius / modX) * 2, (radius / modY) * 2);
    }

    // //Mouse Cursor
    // strokeWeight(1);
    // fill(colour);
    // ellipse(targetX, targetY, 10, 10);

  }


  //Accelerates clockwise
  public void speedup() {
    speed++;
  }
  //Accelerates counter clockwise
  public void slowdown() {
    speed--;
  }
  //Enlarges the radius
  public void enlarge() {
    radius += 20;
  }
  //Shrinks the radius
  public void shrink() {
    radius -= 20;
  }
}
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "equinox" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
