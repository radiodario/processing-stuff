// Equinox - a sun - earth simulation of truth and beauty.
import remixlab.proscene.*;
import remixlab.dandelion.core.*;
import remixlab.dandelion.geom.*;
import processing.pdf.*;
import codeanticode.syphon.*;

SyphonServer server;

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
float sunRadius = 695500.0 * scalee;
float earthRadius = 6371.0 * scalee;
float earthOrbit = 149597871.0 * scalee;
float moonOrbit = 384400.0 * scalee;
float moonRadius = 1736.0 * scalee;

float angle = 0;
float maxTrails = 9.95;

int sceneFrameSwitch = 3000;
int sceneFrameCount = 0;
int sceneNumber = 0;

void setup() {

  println(scalee + "," + sunRadius + "," + earthRadius + "," + earthOrbit);

  size(1920, 1080, P3D);
  // size(3508, 2480, P3D);e
  smooth();
  frameRate(60);

  scene = new Scene(this);
  scene.setAxesVisualHint(false);
  scene.setCameraType(Camera.Type.ORTHOGRAPHIC);
  scene.eye().frame().setDampingFriction(0.5);
  scene.setRadius((earthOrbit+moonOrbit)*1.1);
  scene.showAll();

  // frustum(-1000, 1000, 1000, -1000, -10000, 10000);
  perspective(1, 2, 1, earthOrbit + moonOrbit);


  // ortho(-earthOrbit*2, earthOrbit*2, earthOrbit, -earthOrbit, -earthOrbit*0.1, earthOrbit );

  colorMode(HSB);

  server = new SyphonServer(this, "equinox");

  lights();

  lightShader = loadShader("lightfrag.glsl", "lightvert.glsl");

  sun = new Orbiter(0.1,  0.1, 40,    10, 0,       sunRadius, 1, 1, earthOrbit);
  moon = new Orbiter(0.5, 0.01, 0.005, 0.0001, moonOrbit, moonRadius, 1, 1, moonOrbit*1.2);
  earth = new Orbiter(0.1, 0.01, 0.005, 0.0001, earthOrbit, earthRadius, 1, 1.2, moonOrbit*1.5);
  background(0);
}

void update() {
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


void draw() {

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
     endRecord();
     saveFrame("record/frame-#########.png");
    record = false;
  }
  
  server.sendImage(this.get());

}

void switchScene() {
  sceneNumber++;
  background(0);
  maxTrails = 9 + random(0, 1);
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

void drawSun() {

  pushStyle();
  noFill();
  stroke(40, 255, 255);
  pushMatrix();
  rotateX(PI/2);
  rotateY(angle += 0.01);
  sphereDetail(15);
  sphere(sunRadius);
  popMatrix();

  popStyle();


}

void followEarthMode() {
  showOrbit = true;
  earth.focus();
  scene.setAvatar(earth.frame);
  scene.setMouseAsThirdPerson();
  scene.motionAgent().setDefaultGrabber(earth.frame);
  scene.motionAgent().disableTracking();
}

void followMoonMode() {
  showOrbit = true;
  moon.focus();
  scene.setAvatar(moon.frame);
  scene.setMouseAsThirdPerson();
  scene.motionAgent().setDefaultGrabber(moon.frame);
  scene.motionAgent().disableTracking();
}

void followSunMode() {
  showOrbit = false;
  sun.focus();
  scene.setAvatar(sun.frame);
  scene.setMouseAsThirdPerson();
  scene.motionAgent().setDefaultGrabber(moon.frame);
  scene.motionAgent().disableTracking();
}

void showAll() {
  scene.unsetAvatar();
  scene.setMouseAsArcball();
  scene.motionAgent().setDefaultGrabber(scene.eye().frame());
  scene.motionAgent().enableTracking();
  scene.camera().interpolateToFitScene();
}

void keyPressed() {

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
