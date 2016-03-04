int numPoints = 1200;
int lengthLimit = 80;
int hueColor;
color bgColor;
Point[] points;

boolean save = false;

void setup(){
  size(displayWidth, displayHeight, P3D);
  smooth(32);
  colorMode(HSB, 360, 100, 100, 100);
  noLoop();
  reset();
}

void reset(){
  hueColor = int(random(360));
  bgColor = color(hueColor, 15, 80);
  points = new Point[numPoints];
  for(int i = 0; i < numPoints; i++){
    points[i] = new Point();
  }
}

void draw(){
  background(bgColor);
  translate(width/2, height/2, 0);
  
  for(int i = 0; i < points.length; i++){
    Point fromP = points[i];
    ArrayList<Point> nearPs = new ArrayList<Point>();
    for(int j = 0; j < points.length; j++){
      Point toP = points[j];
      float dist = dist(fromP.x, fromP.y, fromP.z, toP.x, toP.y, toP.z);
      if(dist < lengthLimit){
        nearPs.add(toP);
      }
    }
    strokeWeight(0.5);
    stroke(200, 50);
    fill(fromP.col);
    beginShape();
    for(Point p : nearPs){
      vertex(p.x, p.y, p.z);
    }
    endShape(CLOSE);
  }
  
  if(save){
    saveFrame("img/img-"+(int)random(10000)+".jpg");
    save = false;
  }
}

void mousePressed(){
  if(mouseButton == LEFT){
    reset();
    redraw();
  }
  else if(mouseButton == RIGHT){
    save = true;
    redraw();
  }
}

class Point{
  float x, y, z;
  float radius;
  color col;
  
  Point(){
    float s = 0;
    int r = (int)random(7);
    if(r == 0)           s = random(0, QUARTER_PI);
    if(r >= 1 && r <= 5) s = random(QUARTER_PI, 3*QUARTER_PI);
    if(r == 6)           s = random(3*QUARTER_PI, PI);
    float t = random(TWO_PI);
    if(random(2) < 1){
      radius = 450;
    }
    else radius = 250;
    x = radius * sin(s) * cos(t);
    y = radius * cos(s);
    z = radius * sin(s) * sin(t);
    col = color(hueColor+random(60), random(80), random(20, 100), random(100));
  }
}
