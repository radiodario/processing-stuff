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
boolean showOrbit = true;

Scene scene;


PShader lightShader;

Orbiter moon;
Orbiter earth;
Orbiter sun;

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
float maxTrails = 9.95f;

int sceneFrameSwitch = 3000;
int sceneFrameCount = 0;
int sceneNumber = 0;

public void setup() {

  println(scalee + "," + sunRadius + "," + earthRadius + "," + earthOrbit);

  size(displayWidth, displayHeight, P3D);
  // size(3508, 2480, P3D);e
  smooth();
  frameRate(60);

  scene = new Scene(this);
  scene.setAxesVisualHint(false);
  scene.setCameraType(Camera.Type.ORTHOGRAPHIC);
  scene.eye().frame().setDampingFriction(0.5f);
  scene.setRadius((earthOrbit+moonOrbit)*1.1f);
  scene.showAll();

  // frustum(-1000, 1000, 1000, -1000, -10000, 10000);
  perspective(1, 2, 1, earthOrbit + moonOrbit);


  // ortho(-earthOrbit*2, earthOrbit*2, earthOrbit, -earthOrbit, -earthOrbit*0.1, earthOrbit );

  colorMode(HSB);

  lights();

  lightShader = loadShader("lightfrag.glsl", "lightvert.glsl");

  sun = new Orbiter(0.1f,  0.1f, 40,    10, 0,       sunRadius, 1, 1, earthOrbit);
  moon = new Orbiter(0.5f, 0.01f, 0.005f, 0.0001f, moonOrbit, moonRadius, 1, 1, moonOrbit*1.2f);
  earth = new Orbiter(0.1f, 0.01f, 0.005f, 0.0001f, earthOrbit, earthRadius, 1, 1.2f, moonOrbit*1.5f);
  background(0);
}

public void update() {
  sceneFrameCount++;
//  println(sceneFrameCount);
  if (sceneFrameCount >= sceneFrameSwitch) {
    sceneFrameCount = 0;
    switchScene();
  }
  sun.orbit(0, 0);
  earth.orbit(0, 0);
  moon.orbit(earth);
  
  if (random(0,10) > maxTrails) {
     background(0);
  }
  
}


public void draw() {

  update();

  if (record) {
    // Note that #### will be replaced with the frame number. Fancy!
    // beginRecord(PDF, "frame-####.pdf");
  }

//  background(0);

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

public void switchScene() {
  sceneNumber++;
  background(0);
  maxTrails = 5 + random(0, 5);
  if (sceneNumber == 0) {
    followEarthMode();
  } else 
  if (sceneNumber == 1) {
    followSunMode();
  } else
  if (sceneNumber == 2) {
    followMoonMode();
  } else
  if (sceneNumber == 3) {
    showAll();
  } else
  if (sceneNumber == 4) {
    sceneNumber = 0;
  }
}

public void drawSun() {

  pushStyle();
  noFill();
  stroke(40, 255, 255);
  pushMatrix();
  rotateX(PI/2);
  rotateY(angle += 0.01f);
  sphereDetail(15);
  sphere(sunRadius);
  popMatrix();

  popStyle();


}

public void followEarthMode() {
  showOrbit = true;
  earth.focus();
  scene.setAvatar(earth.frame);
  scene.setMouseAsThirdPerson();
  scene.motionAgent().setDefaultGrabber(earth.frame);
  scene.motionAgent().disableTracking();
}

public void followMoonMode() {
  showOrbit = true;
  moon.focus();
  scene.setAvatar(moon.frame);
  scene.setMouseAsThirdPerson();
  scene.motionAgent().setDefaultGrabber(moon.frame);
  scene.motionAgent().disableTracking();
}

public void followSunMode() {
  showOrbit = false;
  sun.focus();
  scene.setAvatar(sun.frame);
  scene.setMouseAsThirdPerson();
  scene.motionAgent().setDefaultGrabber(moon.frame);
  scene.motionAgent().disableTracking();
}

public void showAll() {
  scene.unsetAvatar();
  scene.setMouseAsArcball();
  scene.motionAgent().setDefaultGrabber(scene.eye().frame());
  scene.motionAgent().enableTracking();
  scene.camera().interpolateToFitScene();
}

public void keyPressed() {

  if (key == '1') {
    followEarthMode();
  }


  if (key == '2') {
    followMoonMode();
  }

  if (key == '3') {
    followSunMode();
  }
  
  if (key == '4') {
    showAll();
  }


  if (key == 'r' || key == 'R') {
    record = true;
  }

  if (key == 'o' || key == 'O') {
    showOrbit = !showOrbit;
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
  float trackingDistance = 0;
  float trackingRadius = 0;
  int direction = -1;
  float camSpeed;
  float camAngle;
  float rotSpeed;

  int colour = color(255, 0, 255);

  Orbiter(float orbitSpeed, float rotationalSpeed, float camSpeed, float rotSpeed, float orbitRadius, float planetRadius, float modX, float modY, float trackingRadius) {

    frame = new InteractiveAvatarFrame(scene);
    focus();
    this.trackingRadius = trackingRadius;
    this.trackingDistance = trackingRadius;
    this.camSpeed = camSpeed;
    this.speed = orbitSpeed;
    this.rotationalSpeed = rotationalSpeed;
    this.radius = orbitRadius;
    this.planetRadius = planetRadius;
    this.modX = modX;
    this.modY = modY;
    this.rotSpeed = rotSpeed;
    camAngle = 0;
  }


  public void orbit(Orbiter target) {

    this.x = target.xr;
    this.y = target.yr;

    this.targetX = target.xr;
    this.targetY = target.yr;

    calculateOrbit();

  }

  public void focus() {
    trackingDistance = trackingRadius;
    camAngle = 0;
    frame.setPosition(new Vec(xr, yr, 0));
    frame.setAzimuth(camAngle);
    frame.setInclination(PI*(1/5));
    frame.setTrackingDistance(trackingDistance);
    
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
    camAngle += (direction * rotSpeed * 0.01f);
    frame.setPosition(new Vec(xr, yr, 0));
    frame.setInclination(camAngle);
    frame.setAzimuth(camAngle);
    
    trackingDistance += (direction * camSpeed);
    if (trackingDistance <= planetRadius) {
      direction = 1;
      println("change direction out");
      
    } if (trackingDistance >= trackingRadius) {
      direction = -1;
      println("change direction in");
    }
    
   
    frame.setTrackingDistance(trackingDistance);
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
    if(showOrbit) {
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
