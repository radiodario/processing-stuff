
int left = 20;
int right = 300;
int top = 20;
int bottom = 100;


void setup() {
    size(400, 300);
}

void draw() {
  background(0);
   
  if (insideRectangle()) {
    fill(255, 0, 0);
  } else {
    fill(255);
  } 
  
  rect(left, top, right - left, bottom - top); 
}
  
// checks if we're inside the rectangle
boolean insideRectangle() {
  
  
  if (mouseX < left) {
    return false;
  }
  
  if (mouseX > right) {
    return false;
  }
  
  if (mouseY > bottom) {
    return false;
  }
  
  if (mouseY < top) {
    return false; 
  }
  
  return true;
}
  
  
  
