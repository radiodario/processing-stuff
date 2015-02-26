class Seeds {

    PGraphics p;
    PGraphics q;
    int numRandSeeds = 10;
    boolean getDiagonal = false;
    int steps = 100;

    ArrayList<Integer> seeds;
    boolean [] traversed;
    int step = 0;
    PImage img;
    boolean finishIt = false;

    int w;
    int h;

    public Seeds(PApplet applet, int w, int h) {
        this.w = w;
        this.h = h;

        p = applet.createGraphics(w, h, P3D);
        q = applet.createGraphics(w, h, P3D);
        initialiseImage();
        seeds = new ArrayList<Integer>();
        traversed = new boolean[w * w];

    }

    void initialiseImage() {
        // noop

    }

    void drawBackdrop() {
        q.beginDraw();
        q.fill(0, 0, 0, map(kontrol.get("bgAlpha"), 0, 127, 0, 255));
        q.rect(0, 0, w, h);
        q.image(p, 0, 0);
        q.endDraw();
    }


    void update() {

        steps = (int) map(kontrol.get("steps"), 0, 127,10, 10000);

        if (kontrol.get("useHSB") > 0) {
            p.colorMode(HSB, 127, 127, 127);
        } else {
            p.colorMode(RGB, 127, 127, 127);
        }

        if (kontrol.get("diagonal") > 0) {
            getDiagonal = true;
        } else {
            getDiagonal = false;
        }


        p.loadPixels();

        if (step == 0) {

            for (int i = 0; i < numRandSeeds; i++) {
                int seed = int(random(this.w * this.h));
                seeds.add(seed);
                traversed[seed] = true;
            }

        } else {
            updateSeeds();
        }

        if (step < steps) {
            step++;
            p.updatePixels();
        } else {
            step = 0;
            traversed = new boolean[width*height];
        }

        p.blendMode(MULTIPLY);

        p.image(p, 0, 0);
        drawBackdrop();


    }


    void updateSeeds() {
        // noise offsets
        float xOff = 0.0;  //noise vals
        float zOff = 0.0;
        noiseDetail(3, .029);

        // iterate backwards to remove
        for (int i = seeds.size()-1; i >= 0; i--) {
            float yOff = 0.0;

            // extract x / y from position in array
            int x = seeds.get(i) % w;
            int y = seeds.get(i) / w;

            float a, b, c, aph;

            // if (kontrol.get("useHSB") == 0) {

            if (kontrol.get("altRGB") > 0) {
                // alternate rgb set
                a = 255 - noise(frameCount * 0.009) * 255;
                b = frameCount * 0.2 % 255;
                c = 255 - noise( 1 + frameCount * 0.005) * 255;
            } else {
                a = noise(zOff, xOff, yOff) * 512;
                b = noise(xOff, yOff, zOff) * 512;
                c = noise(yOff, zOff, yOff) * 512;
            }

            // } else {
            //     a = map(noise(xOff,yOff),0,1,0,255);
            //     b = map(noise(xOff*yOff),0,1,100,255);
            //     c = map(noise(yOff),0,1,0,255);
            // }

            if (kontrol.get("useAlpha") > 0) {
                aph = 255 - noise(xOff, yOff) * 10;
            } else {
                aph = 255;
            }


            p.pixels[x + y * width] = color(
                    kontrol.get("hue") + a,
                    kontrol.get("sat") + b,
                    kontrol.get("bri") + c,
                    aph);
            // p.pixels[x + y * width] = color(a, b, c, aph);

            int mapi = int(lerp(i, y, 0.1));

            // alpha



            // update this pixel

            // p.pixels[x + y * width] = colors.getAColor();

            // get neighboring pixels, check if they have already
            // been stored - if not, add them to the list and flag them
            // as traversed
            //int n = int(noise(zOff,yOff,xOff)*random(frameCount%xOff)); // changing random val generates diff images
            int n = int(noise(xOff, yOff, zOff) * random(3));
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
            int upIndex = seeds.get(i) - width;// + kontrol.get("upIndex");
            boolean upCheck = y - i > 0;
            if (upCheck && !traversed[upIndex]) {
              seeds.add(upIndex);
              traversed[upIndex] = true;
            }

            // RIGHT
            int rightIndex = seeds.get(i) + 1;// + kontrol.get("rightIndex");
            boolean rightCheck = x < width - 1 - i;

            if (rightCheck && !traversed[rightIndex]) {
              seeds.add(rightIndex);
              traversed[rightIndex] = true;
            }

            // DOWN
            int downIndex = seeds.get(i) + width;// + kontrol.get("downIndex");
            boolean downCheck = y < height-1-i;
            if (downCheck && !traversed[downIndex] ){
              seeds.add(downIndex);
              traversed[downIndex] = true;
            }


            // LEFT
            int leftIndex = seeds.get(i) - 1;// + kontrol.get("leftIndex");
            boolean leftCheck = x - i > 0;
            if (leftCheck && !traversed[leftIndex]) {
              seeds.add(leftIndex);
              traversed[leftIndex] = true;
            }


            // if specified, get diagonal neighbors too...
            if (getDiagonal) {

              // UL
              int ulIndex = seeds.get(i) - width - 1;// + kontrol.get("ulIndex");
              boolean ulCheck = x - i > 0 && y - i > 0;
              if (ulCheck && !traversed[ulIndex]) {
                seeds.add(ulIndex);
                traversed[ulIndex] = true;
              }

              // LL
              int llIndex = seeds.get(i) + width - 1;// + kontrol.get("llIndex");
              boolean llCheck = y < height -1 -i;
              if (llCheck && !traversed[llIndex]) {
                seeds.add(llIndex);
                traversed[llIndex] = true;
              }

              // LR
              int lrIndex = seeds.get(i) + width + 1;// + kontrol.get("lrIndex");
              boolean lrCheck = x < width-1-i && y < height -1 -i;
              if (lrCheck && !traversed[lrIndex]) {
                seeds.add(lrIndex);
                traversed[lrIndex] = true;
              }

              // UR
              int urIndex = seeds.get(i) -width + 1;// + kontrol.get("urIndex");
              boolean urCheck = y-i > 0;
              if (urCheck && !traversed[urIndex]) {
                seeds.add(urIndex);
                traversed[urIndex] = true;
              }


            }


            // getOffsets
            xOff += map(kontrol.get("xOffset"), 0, 127, 0.001, 0.01);
            yOff += map(kontrol.get("yOffset"), 0, 127, 0.001, 0.01);
            zOff += map(kontrol.get("zOffset"), 0, 127, 0.001, 0.01);
            // remove the seed as we go!
            seeds.remove(i);

        }


    }

    void beat() {

        p.background(0);
        int seed = int(random(width*height));
        seeds.add(seed);
        traversed = new boolean[w * w];
        traversed[seed] = false;

        // for (int i=0; i<numRandSeeds; i+=1) { //how many seeds are we making?
        //     int seed = int(random(width*height)); // calculate random seed pos
        //     seeds.add(seed); // add a random seed at a random pos
        //     traversed[seed] = true;
        // }

        // println(numRandSeeds);
        // updateSeeds();
        // RRR();
        // p.updatePixels();
    }

    // reverses the image

    void RRR(){
        color[] px = new color[seeds.size()];
        for (int i = seeds.size()-1; i >= 0; i-=1) {
          px[i] = p.pixels[seeds.get(i)];
        }

        // sort the results

        //-----------------------------------------------------------------
        px = sort(px);
        px = reverse(px);
        //-----------------------------------------------------------------

        // set the resulting pixels back into place

        for (int i = seeds.size()-1; i >= 0; i-=1) {
          p.pixels[seeds.get(i)] = px[i];
        }

    }


    // gives you the pixels back
    PGraphics getImage() {
        return q;
    }




}