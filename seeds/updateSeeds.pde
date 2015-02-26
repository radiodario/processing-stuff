// get new seed pixels (surrounding neighbors)
void updateSeeds() {
  float xOff = 0.0;  //noise vals
  float zOff = 0.0;
  noiseDetail(3, .029);
  //noiseSeed(int(random(15)));
  // iterate the seed pixels, in reverse so we can remove them
  for (int i = seeds.size()-1; i >= 0; i-=1) {
    float yOff = 0.0;
    // extract x/y position from position in array

    int x = seeds.get(i) % width;
    int y = seeds.get(i) / width;


    float r = noise(zOff, xOff, yOff)*512; //red
    float g = noise(xOff, yOff, zOff)*512; //green
    float b = noise(yOff, zOff, yOff)*512; //blue

    int mapi = int(lerp(i,y,0.1));

    float a = 255-noise(xOff, yOff)*10;      //alpha if you want it

    //a different rgb color generation set
     float r2 = 255-noise(frameCount * 0.009) * 255;
     float g2 = frameCount*0.2 % 255;
     float b2 = 255 - noise(1 + frameCount * 0.005) * 255;

    int h = int(map(noise(xOff,yOff),0,1,0,255));
    int sat = int(map(noise(xOff*yOff),0,1,100,255));
    int bri = int(map(noise(yOff),0,1,0,255));


     // xOff += 0.001;
     // yOff += 0.001;
     // zOff +=0.001;

    pixels[x+y*width ] = color(r, g,b);
    // pixels[x+y*width ] = color(100+r, 100+g,100+ b);
    // get neighboring pixels, check if they have already
    // been stored - if not, add them to the list and flag them
    // as traversed
    //int n = int(noise(zOff,yOff,xOff)*random(frameCount%xOff)); // changing random val generates diff images
    int n = int(noise(xOff, yOff, zOff)*random(3));
    int rand = int(random(1)); // random directions for seeds to offset themselves
    int rand2 = int(random(2)); // random directions for seeds to offset themselves

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
          xOff +=0.001;
      yOff +=0.002;
    zOff+=0.006;
    // remove the seed as we go!
    seeds.remove(i);

  }
}

