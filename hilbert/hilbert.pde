String axiom = "A";
  String[] rules = {"A", "lBfrAfArfBl",  // production rules copied from wikipedia article on Hilbert curve
                    "B", "rAflBfBlfAr"};
  HashMap rulesH = new HashMap();
  
  int nbrGenerations = 4;
  float lineLength = 0;
  String lsys;
  
  void setup()
  {
    size(500,500);
    noLoop();
    setupLSystem();
  }
  
  void setupLSystem()
  {
    for (int j = 0; j < rules.length; j += 2) {
      rulesH.put(rules[j], rules[j+1]);
    }
  }
  
  String lsysGen(String lsys, String[] rules, int nbrGenerations)
  {
    while (nbrGenerations > 0) {
      String dst = "";
      for (int i = lsys.length()-1; i >= 0; --i) {
        String ch = lsys.substring(i,i+1);
        if (rulesH.containsKey(ch))
          dst += rulesH.get(ch);
        else
           dst += ch;
      }
      lsys = dst;
      --nbrGenerations; // 1 down
    }
    return lsys;
  }
  
  // Angles are in integer amounts (1 = 90 degrees) to avoid rounding error
  void lsysDraw(String src, float sx, float sy, float len, int angD) 
  {
    // Table of 90 degree sin/cos values
    int[][] sincos  = {{1,0},{0,1},{-1,0},{0,-1}}; 
  
    float px = sx;
    float py = sy;
    // println("Drawing at " + px + "," + py);
    beginShape();
    vertex(px,py);
    
    for (int i = 0; i < src.length(); ++i) {
       String ch = lsys.substring(i,i+1);
       if (ch.equals("f")) {
         px += sincos[angD][0]*len;
         py += sincos[angD][1]*len;
         vertex(px,py);
       } else if (ch.equals("l")) {
         angD = (angD+3)%4; // Counter-clockwise turn
       } else if (ch.equals("r")) {
         angD = (angD+1)%4;  // Clockwise turn
       }
    }
    endShape();
  }
  
  void draw()
  {
    lsys = lsysGen(axiom,rules, nbrGenerations);
    // println("--> " + lsys);
    background(255);
    stroke(128);
    noFill();
    smooth();
    
    float lineLength = width/2.0 * pow(.5, nbrGenerations-1);
    strokeWeight(lineLength/2.0);
    strokeCap(PROJECT);
    // strokeJoin(ROUND);
    lsysDraw(lsys, lineLength/2, height-lineLength/2, width/2 * pow(.5, nbrGenerations-1), 0);
  }
  
  void mouseClicked()
  {
    if (mouseX > width/2) {
      nbrGenerations = min(8, nbrGenerations+1);
    }
    else {
      nbrGenerations = max(1, nbrGenerations-1);
    }
    redraw();
  }
