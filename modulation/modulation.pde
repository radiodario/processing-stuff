void setup() {
  size(1024, 480); 
}

void draw() {
  background(255);
  fill(0);
  float startX = 0;
  float startY = height/2;
  for(int x = 0; x < width; x++) {
    // cast to avoid integer division
    float theta = (float) x / width * TWO_PI * 4;
   
    
    // modulator (for phase/frequency)
    float km = map(sin(mouseX), 0, 1, -4, 4);
    float m = km * sin(theta);
    // modulator (amplitude)
    float ka = map(sin(mouseY), 0, 1, -4, 4); 
    float a = sin(ka);
    // add the phase modulator to theta
    // multiply the amplitude modulator to the result
    float y = a * sin(theta + m);
    float yp = y * height/2 + height/2;
    line(startX, startY, x, yp);
    //ellipse(x, yp, 3, 3);
    startX = x;
    startY = yp;
  }
}
