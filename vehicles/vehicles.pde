
Vehicle v;

void setup() {
  size(800, 600);
  
  v = new Vehicle(width/2, height/2);
  
  
  
}

void draw() {
  v.update();
  v.seek(new PVector(mouseX, mouseY));
  v.display();
}
