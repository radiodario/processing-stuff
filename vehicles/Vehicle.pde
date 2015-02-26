class Vehicle {
  PVector location;
  PVector velocity;
  PVector acceleration;
  float maxspeed;
  float maxforce;
  
  float r;
  
  Vehicle(float x, float y) {
    location = new PVector(x, y);
    acceleration = new PVector(0, 0);
    velocity = new PVector(0, 0);
    
    r = 3.0;
    maxspeed = 4;
    maxforce = 0.1;
  }
  
  
  void update() {
    velocity.add(acceleration);
    velocity.limit(maxspeed);
    location.add(velocity);
    acceleration.mult(0);
  }
  
  void applyForce(PVector force) {
    acceleration.add(force);
  }
  
 
  void seek(PVector target) {
    PVector desired = PVector.sub(target,location);
    desired.normalize();
    desired.mult(maxspeed);
    PVector steer = PVector.sub(desired,velocity);
    steer.limit(maxforce);
    applyForce(steer);
  }
  
  void flee(PVector aggressor) {
    PVector desired = PVector.sub(aggressor, location);
    println("d:  " + desired.x + ", " + desired.y);
    desired.normalize();
    desired.mult(maxspeed);
    PVector steer = PVector.sub(desired, velocity);
    steer.limit(maxforce);
    
    steer.mult(-1);
    println("st: " + steer.x + ", " + steer.y);
    applyForce(steer);
  }



  void display() {
    float theta = velocity.heading() + PI/2;
//    println (location.x + ", " + location.y);
    fill(175);
    stroke(0);
    pushMatrix();
    translate(location.x, location.y);
    rotate(theta);
    beginShape();
    vertex(0, -r*2);
    vertex(-r, r*2);
    vertex(r, r*2);
    endShape(CLOSE);
    popMatrix();
  }

}
