
class Cube implements BeatListener {
  
  int x;
  int y;
  int z;
  int h;
  int s;
  int l;
  float life = 1;
  int size;
    
  public Cube(int x, int y, int size) {
    this.x = x;
    this.y = y;
    this.z = 0;
    this.size = size;
  }

  void beat() {
    if (kontrol.get("avoidBeat") == 0) {
      this.life = 0; 
    }
  }

  void draw(PGraphics p) {
    p.pushMatrix();
    
    if (kontrol.get("zJitter") > 0) {
      int amt = kontrol.get("zJitterAmount");
      z = (int) random(-amt, amt);
    } else {
      z = 0;
    }
    
    p.translate(x, y, z);
    
    p.pushMatrix();
    if (kontrol.get("rotate") > 0) {
      p.rotateX(map(kontrol.get("rotateX"), 0, 127, 0, 2*PI));
      p.rotateY(map(kontrol.get("rotateY"), 0, 127, 0, 2*PI));
      p.rotateZ(map(kontrol.get("rotateZ"), 0, 127, 0, 2*PI));
    } else {
      p.rotateX(-PI/4); 
      p.rotateY(PI/4);
    }
    
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
    
    p.strokeWeight(map(kontrol.get("strokeWidth"), 0, 127, 0.5, 100));
    
    
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
    
    
    if (kontrol.get("sphere") > 0) {
      p.sphereDetail((int)map(kontrol.get("sphereDetail"), 0, 127, 1, 10));
      p.sphere(life*size);
    } else {
      p.box(life*size);
    }
    p.popMatrix();
    p.popMatrix();
  }
  
  void setColor(int h, int s, int l) {
    this.h = h;
    this.s = s;
    this.l = l;  
  }
  
  
  void update() {
    
    if (kontrol.get("resetLife") > 0) {
      this.life = 0;
    }
    
    if (kontrol.get("fullLife") > 0) {
      this.life = 0;
    }
    
    
    if (kontrol.get("randomGrowth") > 0) {
      float amt = map(kontrol.get("decay"), 0, 127, 0, 0.5);
      this.life += random(-amt, amt) ;
    } else {
      float amt = map(kontrol.get("decay"), 0, 127, 0, 0.2);
      this.life += amt;  
    }
    

    
    
  }
  
  boolean dead() { 
    return false;
//    return (this.life <= 0);
  }
}
