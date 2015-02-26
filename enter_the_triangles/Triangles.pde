class Triangles implements BeatListener {

  long size = 1;
  double soze;
  int z;

  void Triangles() {

  }

  void draw(PGraphics p) {

    soze = size;

    if (kontrol.get("zJitter") > 0) {
      int amt = kontrol.get("zJitterAmount");
      z = (int) random(-amt, amt);
    } else {
      z = 0;
    }


    while (soze > 0) {
      soze /= 2;
      if (soze < width*2) {
       drawTriangle(p, (int) soze, width/2, height/2, z);
      }
    }

    size = (long) (size * (map(kontrol.get("decay"), 0, 127, 1, 2)));


    if (kontrol.get("reset") > 0) {
      if (size > map(kontrol.get("maxSize"), 0, 127, 0, 100000)) {
        size = width * 2;
      }
    }


  }

  void beat() {

    println("beat");

    if (kontrol.get("beating") > 0) {

      size = 1;


    }

  }


  void drawTriangle(PGraphics p, int r, int x, int y, int z) {

   // point 1
   float x1 = r * cos(-PI/2);
   float y1 = r * sin(-PI/2);

   // point 2
   float x2 = r * cos(-PI/2 + TWO_PI/3.0);
   float y2 = r * sin(-PI/2 + TWO_PI/3.0);

   // point 3
   float x3 = r * cos(-PI/2 + TWO_PI/1.5);
   float y3 = r * sin(-PI/2 + TWO_PI/1.5);

    setTriangleStyle(p);

    p.pushMatrix();

    if (kontrol.get("rotate") > 0) {
      p.rotateX(map(kontrol.get("rotateX"), 0, 127, 0, 2*PI));
      p.rotateY(map(kontrol.get("rotateY"), 0, 127, 0, 2*PI));
      p.rotateZ(map(kontrol.get("rotateZ"), 0, 127, 0, 2*PI));
    }


    p.translate(x, y, z);
    p.beginShape();
    p.vertex(x1, y1, z);
    p.vertex(x2, y2, z);
    p.vertex(x3, y3, z);
    p.endShape(CLOSE);
    p.popMatrix();

  }

  void setTriangleStyle(PGraphics p) {



    if (kontrol.get("fill") > 0) {

      if (kontrol.get("randomFill") > 0) {
        p.fill(colors.getAColor());
      } else if (kontrol.get("nextFill") > 0) {
        p.fill(colors.getNextColor());
      } else {
        p.fill(kontrol.get("hue"), kontrol.get("sat"), kontrol.get("bri"));
      }


    } else {
      p.noFill();
    }

    p.strokeWeight(map(kontrol.get("strokeWidth"), 0, 127, 0.5, 50));
    //p.strokeWeight(1);


    if (kontrol.get("stroke") > 0) {
      if (kontrol.get("randomStroke") > 0) {
        p.stroke(colors.getAColor());
      } else if (kontrol.get("nextStroke") > 0) {
        p.stroke(colors.getNextColor());
      } else {
        p.stroke(kontrol.get("hue"), kontrol.get("sat"), kontrol.get("bri"));
      }
    } else {
      p.noStroke();
    }



  }




}
