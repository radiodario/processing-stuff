class Noisefield {

    double[] map;
    int charwidth = 10;
    int cellW, cellH;

    float xSpeed = 0.005;
    float ySpeed = 0.005;
    float step = 0.10;
    float xOffset = 0;
    float yOffset = 0;
    float xPos = 0;
    float yPos = 0;


    public Noisefield(int width) {
        cellW = width/charwidth;
        cellH = height/charwidth;

        map = new double[cellW*cellH];
    }

    void draw(PGraphics p) {

        p.beginCamera();
        p.camera();
        if (kontrol.get("rotateCam") > 0) {
          float fov = PI/map(kontrol.get("fov"), 0, 127, 1, 10);
          float cameraZ = (height/2.0) / tan(fov/2.0);
          p.perspective(fov, float(width)/float(height), cameraZ/2.0, cameraZ*2.0);


          p.translate(0, 0, map(kontrol.get("zoom"), 0, 127, 0, -1000));
          p.rotateX(map(kontrol.get("rotateX"), 0, 127, 0, 2*PI));
          p.rotateY(map(kontrol.get("rotateY"), 0, 127, 0, 2*PI));
          p.rotateZ(map(kontrol.get("rotateZ"), 0, 127, 0, 2*PI));
        }
        p.endCamera();

        // drawBg(p);

        p.strokeCap(ROUND);
        p.translate(charwidth/2, charwidth/2);
        for (int i = 0; i < map.length; i++) {
            p.pushMatrix();

            int col = (i % cellW);
            int row = (int) ((i - col) / cellH);

            p.translate(col * charwidth, row * charwidth, (float) (0.5-map[i]) * kontrol.get("elevation") * kontrol.get("elevationFactor"));

            p.strokeWeight(kontrol.get("strokeWidth"));


            if (kontrol.get("drawLines") > 0) {
                if (kontrol.get("rotate") > 0) {
                    p.rotate((int) (2*PI/map[i]));
                }


                float factor = 1;
                if (kontrol.get("factor") > 0 ) {
                    factor = (float) map[i];
                }

                if (kontrol.get("voidColors") > 0) {
                    p.stroke(colors.getColorAt((int) (map[i] * 100)));
                } else {
                    p.stroke((int) (map[i]*127), 127, 127, kontrol.get("fgAlpha"));
                }

                p.strokeCap(ROUND);

                if (map[i] >= 0.5) {
                    p.line(-charwidth * factor, -charwidth * factor,
                            charwidth * factor,  charwidth * factor);
                } else {
                    p.line(-charwidth * factor,  charwidth * factor,
                            charwidth * factor, -charwidth * factor);
                }
            } else {

                p.noStroke();
                if (kontrol.get("voidColors") > 0) {
                    p.fill(colors.getColorAt((int) (map[i] * 100)));
                } else {
                    p.fill((int) (map[i]*127), 127, 127, kontrol.get("fgAlpha"));
                }

                int strokeW = kontrol.get("strokeWidth");

                if (map[i] >= 0.5) {
                    p.quad(-charwidth, -charwidth,
                         0, -charwidth,
                         0, charwidth,
                         charwidth, charwidth
                        );
                } else {
                    p.quad(-charwidth, charwidth,
                        0, charwidth,
                        0, -charwidth,
                        charwidth, -charwidth
                        );
                }
            }


            p.popMatrix();
        }
    }


    void reset(int newCharwidth) {
        charwidth = newCharwidth;
        cellW = width/charwidth;
        cellH = height/charwidth;

        map = new double[cellW*cellH];
    }


    void drawBg(PGraphics p) {
        p.fill(0, 0, 0, kontrol.get("bgAlpha"));
        p.noStroke();
        p.rect(0, 0, width, height);
    }


    void update() {

        if (kontrol.get("reset")>0) {
            reset(kontrol.get("charwidth") + 1);
        }

        step = map(kontrol.get("step"), 0, 127, 0, 1) + 0.00001;

        xPos = xOffset;
        yPos = yOffset;
        for (int i = 0; i < map.length; i++) {
            map[i] = noise(xPos, yPos);
            // if we jump a row, add one step to yPos
            // but bring back xPos to what it was.
            if ((i % cellW) == 0) {
              yPos += step;
              xPos -= step * cellW;
            }
            xPos += step;
        }
        xOffset += map(kontrol.get("xSpeed"), 0, 127, -0.1, 0.1);
        yOffset += map(kontrol.get("ySpeed"), 0, 127, -0.1, 0.1);
    }


}