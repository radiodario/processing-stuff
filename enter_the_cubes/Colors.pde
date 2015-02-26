
class Colors {
 
  ColorTheme t;
  ColorList l;
  int colorCounter;
  int numColors;
  
  public Colors(int numColors) {
    this.numColors = numColors; 
    
    this.colorCounter = 0;
    
    setRandomBrightColors();
  }
 
  void setRandomBrightColors() {
    t = new ColorTheme("random");
    
    t.addRange(ColorRange.BRIGHT, TColor.newRandom(), random(0.02, 0.5));
    t.addRange(ColorRange.BRIGHT, TColor.newRandom(), random(0.02, 0.5));
    t.addRange(ColorRange.BRIGHT, TColor.newRandom(), random(0.02, 0.5));
    t.addRange(ColorRange.BRIGHT, TColor.newRandom(), random(0.02, 0.5));
    t.addRange(ColorRange.BRIGHT, TColor.newRandom(), random(0.02, 0.5));
    
    l = t.getColors(numColors);
    
    
  }
  
  void setRandomDarkColors() {
    t = new ColorTheme("random");
    
    t.addRange(ColorRange.INTENSE, TColor.newRandom(), random(0.02, 0.5));
    t.addRange(ColorRange.INTENSE, TColor.newRandom(), random(0.02, 0.5));
    t.addRange(ColorRange.INTENSE, TColor.newRandom(), random(0.02, 0.5));
    t.addRange(ColorRange.INTENSE, TColor.newRandom(), random(0.02, 0.5));
    t.addRange(ColorRange.INTENSE, TColor.newRandom(), random(0.02, 0.5));
    
    l = t.getColors(numColors);
    
    
  }
 
 
  void setVoidColors() {
    t = new ColorTheme("enter_the_void");
  
    t.addRange(ColorRange.BRIGHT, TColor.newHex("34232a"), 0.5547332);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("5e3f6b"), 0.12577668);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("895844"), 0.07337354);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("8a637a"), 0.027640717);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("3e816f"), 0.02567617);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("76331f"), 0.024122808);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("94679c"), 0.020239402);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("346238"), 0.016949927);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("c44531"), 0.012701023);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("cc9718"), 0.0116959065);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("f5da16"), 0.011101974);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("ce9cb9"), 0.011056286);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("de7461"), 0.008954679);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("533399"), 0.007903874);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("9357ba"), 0.006761696);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("6536bb"), 0.0065789474);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("4db8a7"), 0.0061677634);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("8eaa58"), 0.005391082);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("57a846"), 0.0046600876);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("dcc867"), 0.004431652);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("37257a"), 0.0042945906);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("bad2b0"), 0.0038834065);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("6c5d15"), 0.0029239766);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("af68f0"), 0.002741228);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("b23997"), 0.0021472953);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("f8632d"), 0.0021472953);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("da4ee6"), 0.0019188597);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("997a0b"), 0.0018731726);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("5a7ea9"), 0.001370614);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("e4dae5"), 0.001324927);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("51cb69"), 0.001050804);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("d349ad"), 0.001050804);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("8fa3bd"), 9.137427E-4);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("e092ee"), 5.482456E-4);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("fbbcb3"), 5.482456E-4);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("ec44dd"), 5.025585E-4);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("a9c529"), 4.5687135E-4);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("c84c08"), 4.111842E-4);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("81dda8"), 4.111842E-4);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("385c87"), 3.6549708E-4);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("f38c90"), 3.6549708E-4);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("4d33f9"), 3.1980994E-4);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("a7375e"), 2.741228E-4);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("b49b85"), 2.741228E-4);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("f7fa4f"), 2.2843567E-4);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("493f00"), 1.8274854E-4);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("30c3dc"), 1.8274854E-4);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("893ef2"), 1.8274854E-4);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("b68a44"), 1.8274854E-4);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("fc801f"), 1.370614E-4);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("83a409"), 1.370614E-4);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("5cc456"), 9.137427E-5);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("4f811a"), 9.137427E-5);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("6864d1"), 9.137427E-5);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("a5d668"), 9.137427E-5);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("c6edc0"), 4.5687135E-5);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("ff9de5"), 4.5687135E-5);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("862279"), 4.5687135E-5);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("a6280f"), 4.5687135E-5);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("617150"), 4.5687135E-5);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("bffff4"), 4.5687135E-5);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("739f85"), 4.5687135E-5);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("acbee2"), 4.5687135E-5);
   
    l = t.getColors(numColors);

  }
 
 
  int getAColor() {
    
     return l.get((int) random(numColors)).toARGB();
    
    
  }
  
  int getNextColor() {
    return l.get(++colorCounter % numColors).toARGB();
    
  }
  
  void update() {
    if (kontrol.get("setRandomBrightColors") > 0) {
      colors.setRandomBrightColors();
    }
    
    if (kontrol.get("setRandomDarkColors") > 0) {
      colors.setRandomDarkColors();
    }
    
    
    if (kontrol.get("setVoidColors") > 0) {
      colors.setVoidColors();
    } 
    
  }
  
}
