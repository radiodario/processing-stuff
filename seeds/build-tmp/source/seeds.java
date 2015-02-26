import processing.core.*; 
import processing.data.*; 
import processing.event.*; 
import processing.opengl.*; 

import java.util.HashMap; 
import java.util.ArrayList; 
import java.io.File; 
import java.io.BufferedReader; 
import java.io.PrintWriter; 
import java.io.InputStream; 
import java.io.OutputStream; 
import java.io.IOException; 

public class seeds extends PApplet {

/*
SEED SORTING (ie: sort with edge detection or random seeds)
 Jeff Thompson | 2013 | www.jeffreythompson.org

 Using either a set of random seed pixels, or seed pixels defined through edge-
 detection, expand those locations step-by-step, gathering the neighboring pixel's
 color values, sorting them, and putting them back in place.

 The crystal-like growth results in tesselated spirals of color without altering
 or deleting any of the pixels in the source image.

 Much of the optimization for this code is thanks to generous help from the Processing
 forum, especially code by asimes.

 ** Note that we use an ArrayList to store the seed pixels, rather than a standard
 array - this allows us more flexibility to add items, and for more efficient checking
 to see if the pixel has already been stored

 */

//code tweak by Adam Ferriss
// import unlekker.moviemaker.*;
// UMovieMaker mm;

int numRandSeeds = 1;                                   // if using random seeds, how many to start?
boolean getDiagonal = false;                             // get diagonal neighbors? true makes boxes, false diamonds
int steps = 9000000;                                      // # of steps to expand/sort

ArrayList<Integer> seeds = new ArrayList<Integer>();    // seed pixels to find neighbors for**
boolean[] traversed;                                    // keep track of pixels we have traversed
int step = 0;                                           // count steps through the image
PImage img;                                             // variable to load in image
boolean finishIt = false;                               // hit spacebar to stop the process manually (n!
boolean useHSB = false;

public void setup() {
  colorMode(RGB, 255, 255, 255);                        //HSB can generate different results -- look into using toxi color palettes
  println("Loading image...");
  size(1280, 720);
  background(10);
  // frameRate(60);
  // intialize array of already-traversed
  traversed = new boolean[width*width];
  blendMode(MULTIPLY);
  // mm = new UMovieMaker(this,
  // sketchPath("drawing5.mov"), width, height, 30);
}

public void draw() {
  //numRandSeeds = int(random(100));
  // fill(255, 255, 255, 0.1);
  if (frameCount%3 == 0) {
    // rect(0, 0, width, height);
  }

  if (useHSB) {
    colorMode(HSB, 255, 255, 255);
  } else {
    colorMode(RGB, 255, 255, 255);
  }

  loadPixels();
  // println("STEP: " + step + "/" + steps);
  // if we're on the first step, find the edges
  if (step == 0) {
    println("  finding edges...");
    for (int i=0; i<numRandSeeds; i+=1) {         //how many seeds are we making?
      //int seed = int(width*height/2 - width/2);       // calculate random seed pos
      int seed = PApplet.parseInt(random(width*height));
      seeds.add(seed);                            // add a random seed at a random pos
      traversed[seed] = true;
    }
  }

  // otherwise, get neighbors, sort, and put back in place
  else {
    updateSeeds();
    RRR();                                // sort or reverse and retrieve
  }

  // so long as we're not at our limit (and not manually stopped) continue!
  if (step < steps && !finishIt) {
    step++;
    updatePixels();                               // update to display the results
  }
  else {
    // all done!
    println("DONE!");
  }

  //mm.addFrame();
  /*
  if(step%200 == 0){
   // save( "processed/image"+hour()+"_"+minute()+"_"+second()+".png");
   noiseSeed(int(random(70000)));
   //traversed = new boolean[width*height];
   numRandSeeds++;
   //if(numRandSeeds>4){
   // numRandSeeds = 1;
   // }
   for (int i=0; i<40; i+=1) { //how many seeds are we making?
   //int seed = int(random(width*height)); // calculate random seed pos
   //seeds.add(seed); // add a random seed at a random pos
   //traversed[seed] = true;
   }

   }
   */
/*
  if (step%8 == 0) {


    for(int i = 0; i<int(random(5)); i++){
      int seed = int(random(width*height));
    seeds.add(seed);
    }
  }

  if (step%300 == 0) {
    noiseSeed(int(random(55000)));
    //getDiagonal = !getDiagonal;
  }

  if (step%300 == 0) {
    traversed = new boolean[width*height];
  }
  */
  //saveFrame("frames5/nike-####.tiff");
}


public void keyPressed() {
  if (key == 32) {
    save( "processed/image"+hour()+"_"+minute()+"_"+second()+".png");
    if (!finishIt) {
      finishIt = true;
    }
    else {
      finishIt = false;
      loop();
    }
  }

  //add seeds with +
  if (key == '=' || key == '+') {
    getDiagonal = !getDiagonal;
    noiseSeed(PApplet.parseInt(random(55000)));
    traversed = new boolean[width*height];
    numRandSeeds++;

    for (int i=0; i<numRandSeeds; i+=1) { //how many seeds are we making?
      //int seed = int(width*height)/2 - width/2; // calculate random seed pos
      int seed = PApplet.parseInt(random(width*height));
      seeds.add(seed); // add a random seed at a random pos
      traversed[seed] = true;
    }

    println(numRandSeeds);
    updateSeeds();
    RRR();
    updatePixels();
  }

  // flip color mode

  // flip update mode
  if (key == 'd') {
    getDiagonal = !getDiagonal;
  }

  // flip color mode
  if (key == 'c') {
    useHSB = !useHSB;
    println("USE HSB " + useHSB);
  }


  // remove seeds with -
  if (key == '-' || key == '_' ) {
    if (numRandSeeds !=1) {

      numRandSeeds--;

      for (int i=0; i<numRandSeeds; i+=1) { //how many seeds are we making?
        int seed = PApplet.parseInt(random(width*height)); // calculate random seed pos
        seeds.add(seed); // add a random seed at a random pos
        traversed[seed] = true;
      }

      println(numRandSeeds);
      updateSeeds();
      //RRR();
      updatePixels();
    }

    //if numRandSeeds = 1 just make a seed
    else if (numRandSeeds == 1) {
      traversed = new boolean[width*height];
      for (int i=0; i<numRandSeeds; i+=1) { //how many seeds are we making?
        int seed = PApplet.parseInt(random(width*height)); // calculate random seed pos
        seeds.add(seed); // add a random seed at a random pos
        traversed[seed] = true;
      }

      println(numRandSeeds);
      updateSeeds();
      //RRR();
      updatePixels();
    }
  }

  if (key==ESC) {
    // Finish the movie if space bar is pressed
    // MW - Let's catch ESC as well so that movie is closed if
    // user presses Escape, otherwise the file will be damaged
    //mm.finish();

    println("Closing movie file.");

    // Quit running the sketch once the file is written
    exit();
  }
}

public void mouseClicked() {
  //  background(0);
  // int seed = int(random(width*height));
  // seeds.add(seed);
}




public void RRR(){
    int[] px = new int[seeds.size()];
    for (int i = seeds.size()-1; i >= 0; i-=1) {
      px[i] = pixels[seeds.get(i)];
    }

    // sort the results

    //-----------------------------------------------------------------
    px = sort(px);
    //px = reverse(px);
    //-----------------------------------------------------------------

    // set the resulting pixels back into place

    for (int i = seeds.size()-1; i >= 0; i-=1) {
      pixels[seeds.get(i)] = px[i];
    }

}

// get new seed pixels (surrounding neighbors)
public void updateSeeds() {
  float xOff = 0.0f;  //noise vals
  float zOff = 0.0f;
  noiseDetail(3, .029f);
  //noiseSeed(int(random(15)));
  // iterate the seed pixels, in reverse so we can remove them
  for (int i = seeds.size()-1; i >= 0; i-=1) {
    float yOff = 0.0f;
    // extract x/y position from position in array

    int x = seeds.get(i) % width;
    int y = seeds.get(i) / width;


    float r = noise(zOff, xOff, yOff)*512; //red
    float g = noise(xOff, yOff, zOff)*512; //green
    float b = noise(yOff, zOff, yOff)*512; //blue

    int mapi = PApplet.parseInt(lerp(i,y,0.1f));

    float a = 255-noise(xOff, yOff)*10;      //alpha if you want it

    //a different rgb color generation set
     float r2 = 255-noise(frameCount * 0.009f) * 255;
     float g2 = frameCount*0.2f % 255;
     float b2 = 255 - noise(1 + frameCount * 0.005f) * 255;

    int h = PApplet.parseInt(map(noise(xOff,yOff),0,1,0,255));
    int sat = PApplet.parseInt(map(noise(xOff*yOff),0,1,100,255));
    int bri = PApplet.parseInt(map(noise(yOff),0,1,0,255));


     // xOff += 0.001;
     // yOff += 0.001;
     // zOff +=0.001;

    //pixels[x+y*width ] = color(r, g,b);
    pixels[x+y*width ] = color(100+r, 100+g,100+ b);
    // get neighboring pixels, check if they have already
    // been stored - if not, add them to the list and flag them
    // as traversed
    //int n = int(noise(zOff,yOff,xOff)*random(frameCount%xOff)); // changing random val generates diff images
    int n = PApplet.parseInt(noise(xOff, yOff, zOff)*random(3));
    int rand = PApplet.parseInt(random(1)); // random directions for seeds to offset themselves
    int rand2 = PApplet.parseInt(random(2)); // random directions for seeds to offset themselves

    // get neighboring pixels, check if they have already
    // been stored - if not, add them to the list and flag them
    // as traversed

    /* Things to try */
    // playing with the if statements below can generate interesting results. For instance try subtracting i from y or adding i to x.
    // playing with the index values is another path to creating varied results.  Try adding random numbers or noise values.
    // The UP RIGHT DOWN & LEFT indices can be commented out

    // UP
    int upIndex = seeds.get(i) -width ;
    if (y-i> 0 && !traversed[upIndex]) {
      seeds.add(upIndex);
      traversed[upIndex] = true;
    }

    // RIGHT
    int rightIndex = seeds.get(i)+1 ;
    if (x < width-1-i && !traversed[rightIndex]) {
      seeds.add(rightIndex);
      traversed[rightIndex] = true;
    }

    // DOWN
    int downIndex = seeds.get(i) +width;
    if (y< height-1-i && !traversed[downIndex] ){
      seeds.add(downIndex);
      traversed[downIndex] = true;
    }


    // LEFT
    int leftIndex = seeds.get(i) -1 ;
    if (x-i > 0 && !traversed[leftIndex]) {
      seeds.add(leftIndex);
      traversed[leftIndex] = true;
    }


    // if specified, get diagonal neighbors too...
    if (getDiagonal) {

      // UL
      int ulIndex = seeds.get(i)  -width-1 ;
      if (x-i > 0 && y-i > 0 && !traversed[ulIndex]) {
        seeds.add(ulIndex);
        traversed[ulIndex] = true;
      }

      // LL
      int llIndex = seeds.get(i)  +width- 1 ;
      if (y  < height-1 -i&& !traversed[llIndex]) {
        seeds.add(llIndex);
        traversed[llIndex] = true;
      }

      // LR
      int lrIndex = seeds.get(i) +width+1  ;
      if (x < width-1-i && y < height -1 -i && !traversed[lrIndex]) {
        seeds.add(lrIndex);
        traversed[lrIndex] = true;
      }

      // UR
      int urIndex = seeds.get(i) -width+ 1  ;
      if (y-i > 0 && !traversed[urIndex]) {
        seeds.add(urIndex);
        traversed[urIndex] = true;
      }


    }
          xOff +=0.001f;
      yOff +=0.002f;
    zOff+=0.006f;
    // remove the seed as we go!
    seeds.remove(i);

  }
}

  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "seeds" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
