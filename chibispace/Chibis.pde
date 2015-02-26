class Chibis {
  boolean canAdd = true;
  int numOfChibis = 20;
  ArrayList<Entity> chibiEntities;
  
  int lastSpawn = 0;
  int spawnEvery = 500;
  
  Chibis() {
    chibiEntities = new ArrayList<Entity>(); 
  }
  
  void draw(PGraphics g) {
    for (Entity e : chibiEntities){
      e.display(g);
    }
  
    text(chibiEntities.size(), 10, 10);
  
  
  }
  
  void update() {
     // remove dead chibis
     spawnEvery = (int) map(kontrol.get("spawnRate"), 0, 127, 1000, 1);
  
     
     for (int i = chibiEntities.size() - 1; i >= 0; i--) {
       Entity e = chibiEntities.get(i);
       if (e.dead()) {
         chibiEntities.remove(i);
         e.kill();
       }
     }
    
     if (chibiEntities.size() < numOfChibis) {
       int now = millis();
       
       if ((lastSpawn + spawnEvery) < now) {
         addChibi();
         lastSpawn = now; 
       }
            
     }
  }
  
  void addChibi() {

    Entity newChibi = new Entity("chibi-sprites.xml", random(25,width-25), height+150);

    chibiEntities.add(newChibi);

    beatManager.listeners.addListener(newChibi);

  }
  
  
  
}
