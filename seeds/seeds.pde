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

void setup() {
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

void draw() {
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
      int seed = int(random(width*height));
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


void keyPressed() {
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
    noiseSeed(int(random(55000)));
    traversed = new boolean[width*height];
    numRandSeeds++;

    for (int i=0; i<numRandSeeds; i+=1) { //how many seeds are we making?
      //int seed = int(width*height)/2 - width/2; // calculate random seed pos
      int seed = int(random(width*height));
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
        int seed = int(random(width*height)); // calculate random seed pos
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
        int seed = int(random(width*height)); // calculate random seed pos
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

void mouseClicked() {
  //  background(0);
  // int seed = int(random(width*height));
  // seeds.add(seed);
}



