class Star {
  float x=0,y=0,z=0,sx=0,sy=0, size;
  PImage sprite;

  void SetPosition(){
    z=(float) random(200,255);
    x=(float) random(-1000,1000);
    y=(float) random(-1000,1000);
    sprite = getRandomImage();
  }

  void DrawStar(PGraphics p){



    if (z < kontrol.get("speed")){
      this.SetPosition();
    }
    z -= kontrol.get("speed");
    sx = (x * kontrol.get("spread")) / (z) + CX;
    sy = (y * kontrol.get("spread"))/(4+z)+CY;

    size = map(z, 255, -250, 0, kontrol.get("maxSize")*10);

    if (sx<0 | sx>width){
      this.SetPosition();
    }
    if (sy<0 | sy>height){
      this.SetPosition();
    }
    p.tint(color(255 - (int) z,255 - (int) z,255 - (int) z));


    //image(windows, sx, sy, size, size);
    p.imageMode(CENTER);
    p.image(sprite, sx, sy, size, size);

    //ellipse( (int) sx,(int) sy,20,20);
  }




}
