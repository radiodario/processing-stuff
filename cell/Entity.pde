class Entity {
 
   ArrayList<Sprite> sprites;
   Body body;
   float w;
   float h;
   //int currentSprite;
   String currentAction;
   HashMap<String, Integer[]> actions;
   PImage atlas;
   
   Entity (String filename, float x, float y) {
     loadAtlas(filename);
     
     loadActions(filename);
  

     w = 83;
     h = 148;
     
     currentAction = "start";
     //currentSprite = 0;
     
     makeBody(new Vec2(x, y), w, h);
   }
   
   
   void kill() {
     box2d.destroyBody(body);
   }
   
   
   boolean dead() {
     Vec2 pos = box2d.getBodyPixelCoord(body);
     if (pos.y > height+w*h) {
       kill();
       return true;
     }
    
     return false;
  }
  
  void display() {
    
    Integer [] action = actions.get(currentAction);
    
    int currentFrame = frameCount % action.length;
   
    int currentSprite = action[currentFrame];
    
    //println(currentSprite + " is the current sprite");
    
    
    Vec2 pos = box2d.getBodyPixelCoord(body);
    
    float a = body.getAngle();
   
    pushMatrix();
    translate(pos.x, pos.y);
    rotate (-a);
    sprites.get(currentSprite).draw(atlas, 0, 0);
    popMatrix(); 

    
  }
  
  void loadAtlas(String filename) {
    XML sheet = loadXML(filename);
    String imgPath = sheet.getString("imagePath");
    
    atlas = loadImage(imgPath);
  }
  
  void loadActions(String filename) {
    XML sheet = loadXML(filename);
    
    XML[] actionNodes = sheet.getChildren("action");
    
    println(actionNodes);
    
    actions = new HashMap<String, Integer[]>();
    sprites = new ArrayList<Sprite>();
    int spriteNumber = 0;
    for (int i = 0; i < actionNodes.length; i++) {
     
      XML[] spriteNodes = actionNodes[i].getChildren("sprite"); 
      Integer [] spriteIds = new Integer[spriteNodes.length];

      
      for (int j = 0; j < spriteNodes.length; j++) {
        spriteIds[j] = spriteNumber;
        String name = spriteNodes[j].getString("n");
        int x = spriteNodes[j].getInt("x");
        int y = spriteNodes[j].getInt("y");
        int w = spriteNodes[j].getInt("w");
        int h = spriteNodes[j].getInt("h");
        
        sprites.add(new Sprite(name, x, y, w, h));
        spriteNumber++;
        }
        
        println(actionNodes[i].getString("n") + " " + spriteIds);
        
        actions.put(actionNodes[i].getString("n"), spriteIds);
      
    }
  
  }
  


  // This function adds the rectangle to the box2d world
  void makeBody(Vec2 center, float w_, float h_) {

    // Define a polygon (this is what we use for a rectangle)
    PolygonShape sd = new PolygonShape();
    float box2dW = box2d.scalarPixelsToWorld(w_/2);
    float box2dH = box2d.scalarPixelsToWorld(h_/2);
    sd.setAsBox(box2dW, box2dH);

    // Define a fixture
    FixtureDef fd = new FixtureDef();
    fd.shape = sd;
    // Parameters that affect physics
    fd.density = 1;
    fd.friction = 0.3;
    fd.restitution = 0.2;

    // Define the body and make it from the shape
    BodyDef bd = new BodyDef();
    bd.type = BodyType.DYNAMIC;
    bd.position.set(box2d.coordPixelsToWorld(center));
    bd.angle = random(TWO_PI);

    body = box2d.createBody(bd);
    body.createFixture(fd);
  }
  

}

