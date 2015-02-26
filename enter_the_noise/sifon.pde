import codeanticode.syphon.*;


class Sifon {

  public PGraphics g;
  public SyphonServer server;

  Sifon(PApplet p, int width, int height, String rendererType){
    g = p.createGraphics(width, height, P3D);

    server = new SyphonServer(p, "Processing Syphon");
  }

  void send(){
    server.sendImage(g);
  }


  void begin() {
    g.beginDraw();
    g.background(0);
    g.colorMode(HSB, 127);
  }

  void end() {
    g.endDraw();
  }

}