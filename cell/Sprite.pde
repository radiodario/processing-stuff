class Sprite {

  String name;
  int x;
  int y;
  int w;
  int h; 
  

 
  Sprite(String _name, int _x, int _y, int _w, int _h) {
    name = _name;
    x = _x;
    y = _y;
    w = _w;
    h = _h;
  }
 
  void draw(PImage atlas, int px, int py) {
    PImage texture = atlas.get(x, y, w, h);
    pushMatrix();
    translate(px, py);
    //imageMode(CENTER);
    image(texture, -w/2, -h/2);
    popMatrix();
  }
 
}
