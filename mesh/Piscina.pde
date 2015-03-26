class Piscina implements LazerBeatListener {

  ArrayList triangles = new ArrayList();
  ArrayList points = new ArrayList();
  int margin = 200;

  int dotSize = 100;

  int numberOfPoints = 200;

  void Piscina() {

  }

  void reset() {
    // clear the list
    points.clear();

    // fill the points arraylist with random points
    for (int i = 0; i < numberOfPoints; i++) {
    // PVector.z is used to store an angle (particle's direction)
      points.add(new PVector(random(-margin, width+margin), random(-margin, height+margin), random(TWO_PI)));
    }

  }


  void model() {
    double speed = map(kontrol.get("speed"), 0, 127, 0, 20);
    for (int i = 0; i < points.size(); i++) {
    PVector p = (PVector)points.get(i);
    // p.z is used to store an angle value (particle's direction)
    // p.z -= 0.1;
    p.x += speed*cos(p.z);
    p.y += speed*sin(p.z);
    if (p.x < -margin || p.x > width + margin) { p.z += PI; }
    if (p.y < -margin || p.y > height + margin) { p.z += PI; }
    }

    // get the triangulated mesh
    triangles = Triangulate.triangulate(points);

  }

  void draw(PGraphics pg) {

    pg.fill(127,0,127, kontrol.get("bgalpha"));
    if (kontrol.get("rotate") == 0 ) {
      pg.rect(0, 0, width, height);
    }
    // pg.noStroke();
  //  fill(167,219,216);

    // draw the points

    if (kontrol.get("lights") > 0) {
      pg.lights();
    }

    // draw the mesh of triangles


    //noFill();
    pg.pushMatrix();
    pg.beginShape(TRIANGLES);

    if (kontrol.get("rotate") > 0) {
      pg.rotateX(map(kontrol.get("rotateX"), 0, 127, 0, 2*PI));
      pg.rotateY(map(kontrol.get("rotateY"), 0, 127, 0, 2*PI));
      pg.rotateZ(map(kontrol.get("rotateZ"), 0, 127, 0, 2*PI));
    }

    for (int i = 0; i < triangles.size(); i++) {
      Triangle t = (Triangle)triangles.get(i);
      pg.strokeWeight(map(kontrol.get("strokeWidth"), 0, 127, 0, 1000));

      setTriangleStyle(pg);

      pg.vertex(t.p1.x, t.p1.y, t.p1.z * map(kontrol.get("zMultiplier"), 0, 127, 1, 5));
      pg.vertex(t.p2.x, t.p2.y, t.p2.z * map(kontrol.get("zMultiplier"), 0, 127, 1, 5));
      pg.vertex(t.p3.x, t.p3.y, t.p3.z * map(kontrol.get("zMultiplier"), 0, 127, 1, 5));
    }

    pg.endShape();




    if (kontrol.get("drawRandomTriangle") > 0) {
      try {
        drawRandomTriangle(pg);
      } finally {

      }
    }

    if (kontrol.get("drawPoints") > 0) {
      for (int i = 0; i < points.size(); i++) {

        int maxSize = (int) (dotSize - random(0, 10));

        PVector p = (PVector)points.get(i);
        pg.fill(kontrol.get("hue"),kontrol.get("sat"),kontrol.get("bri"),128);
        pg.ellipse(p.x, p.y, maxSize, maxSize);
      }
    }

    pg.popMatrix();

    model();
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

    p.strokeWeight(map(kontrol.get("strokeWidth"), 0, 127, 0, 25));
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


  void drawRandomTriangle(PGraphics pg) {
    Triangle t = (Triangle)triangles.get((int)random(0, triangles.size()));
    pg.fill(224,228,204);
    pg.beginShape(TRIANGLES);
    pg.vertex(t.p1.x, t.p1.y);
    pg.vertex(t.p2.x, t.p2.y);
    pg.vertex(t.p3.x, t.p3.y);
    pg.endShape();
  }

  void beat() {
    dotSize = (int) random(0, kontrol.get("maxSize"));
  }



}