class Cubes {

  ArrayList<Cube> cubes;
  int numCubes;
  int cubesPerRow = 10;

  public Cubes(int max, BeatManager beatManager) {
    int cubeSide = width/cubesPerRow;

    numCubes = 30*30;

    cubes = new  ArrayList<Cube>();

    float x = 0, y = 0;
    int row = 0;
    int col = 0;

    for (int i = 0; i < numCubes; i++) {

      if (col > cubesPerRow) {
        row++;
        col = 0;
      }

      float gridStep = cubeSide * tan(PI/4);
      float gridStepY = cubeSide * sin(PI/4);

      if (row % 2 > 0) {
        x = col * (gridStep);
      } else {

        x = (col * gridStep) + gridStep/2;
      }

      y = gridStepY * row;

      col++;


      Cube newCube = new Cube((int)x,(int) y, (int) cubeSide);
      cubes.add(newCube);
      beatManager.listeners.addListener(newCube);

    }



  }


  void draw(PGraphics p) {

    for (Cube cube : cubes) {
      cube.draw(p);
    }

  }


  void update() {

    for (int i = cubes.size() - 1; i >= 0; i--) {
      Cube c = cubes.get(i);

      c.update();

      if (c.dead()) {
       cubes.remove(c);
      }

    }


  }

  void addCube() {

  }


}
