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


  void orbit(Orbiter target) {

    this.x = target.xr;
    this.y = target.yr;

    this.targetX = target.xr;
    this.targetY = target.yr;

    calculateOrbit();

  }

  void focus() {
    trackingDistance = trackingRadius;
    camAngle = 0;
    frame.setPosition(new Vec(xr, yr, 0));
    frame.setAzimuth(camAngle);
    frame.setInclination(PI*(1/5));
    frame.setTrackingDistance(trackingDistance);
    
  }


  void orbit(float targetX, float targetY) {
    this.targetX = targetX;
    this.targetY = targetY;

    calculateOrbit();

  }

  void calculateOrbit() {

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
    camAngle += (direction * rotSpeed * 0.01);
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

  void draw() {
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
    strokeWeight(0.5);
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
  void speedup() {
    speed++;
  }
  //Accelerates counter clockwise
  void slowdown() {
    speed--;
  }
  //Enlarges the radius
  void enlarge() {
    radius += 20;
  }
  //Shrinks the radius
  void shrink() {
    radius -= 20;
  }
}
