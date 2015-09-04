// copyrite dw

int[][] result;
float t, c;

float ease(float p) {
  return 3*p*p - 2*p*p*p;
}

float ease(float p, float g) {
  if (p < 0.5)
    return 0.5 * pow(2*p, g);
  else
    return 1 - 0.5 * pow(2*(1 - p), g);
}

float mn = .5*sqrt(3);

void setup() {
  setup_();
  result = new int[width*height][3];
}

void draw() {

  if(!recording){
    t = mouseX*1.0/width;
    c = mouseY*1.0/height;
    if(mousePressed)
        println(c);
    draw_();
  }

  else {
  for (int i=0; i<width*height; i++)
    for (int a=0; a<3; a++)
      result[i][a] = 0;

  c = 0;
  for (int sa=0; sa<samplesPerFrame; sa++) {
    t = map(frameCount-1 + sa*shutterAngle/samplesPerFrame, 0, numFrames, 0, 1);
    draw_();
    loadPixels();
    for (int i=0; i<pixels.length; i++) {
      result[i][0] += pixels[i] >> 16 & 0xff;
      result[i][1] += pixels[i] >> 8 & 0xff;
      result[i][2] += pixels[i] & 0xff;
    }
  }

  loadPixels();
  for (int i=0; i<pixels.length; i++)
    pixels[i] = 0xff << 24 |
      int(result[i][0]*1.0/samplesPerFrame) << 16 |
      int(result[i][1]*1.0/samplesPerFrame) << 8 |
      int(result[i][2]*1.0/samplesPerFrame);
  updatePixels();

  saveFrame("f###.gif");
  if (frameCount==numFrames)
    exit();
  }
}

//////////////////////////////////////////////////////////////////////////////

int samplesPerFrame = 8;
int numFrames = 240;
float shutterAngle = .33;

boolean recording = false;

void setup_() {
  size(540,540);
  noStroke();
}

float d;
float ff = .65;
int N = 24;

void draw_() {
  d = 400;
  background(250);
  pushMatrix();
  translate(width/2, height/2);
  rotate(-HALF_PI);
  fill(32);
  ellipse(0, 0, d, d);
  for (int i=0; i<N; i++) {
    d *= ff;
    pushMatrix();
    rotate(TWO_PI*t + PI*i);
    translate(.5*d*(1/ff-1), 0);
    fill(i%2 == 0 ? 250 : 32);
    ellipse(0, 0, d, d);
  }
  for (int i=0; i<N; i++)
    popMatrix();
  popMatrix();
}