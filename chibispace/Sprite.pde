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
 
  void draw(PGraphics p, PImage atlas, int px, int py) {
    PImage texture = atlas.get(x, y, w, h);
    if (kontrol.get("biggernearer") > 0) {
      float amount = 2 + (sin((abs(py%height)*TWO_PI)/(height)));
      float newHeight = (texture.height * amount);
      float newWidth = (texture.width * amount);
      texture.resize(ceil(newWidth), ceil(newHeight));
      
      p.image(texture, -texture.width/2, -texture.height/2);
      
    } else {
      p.image(texture, -w/2, -h/2);
    }
  }
 
}
