

class Controller {

  
 int[] midiState;
 
 HashMap<String,Integer> mappings;
  
  
 public Controller() {
   midiState = new int[128];
   mappings = new HashMap<String, Integer>();
   setMappings();
 }
  
 
 int get(String mapping) {

   try {
//     println(mapping + ": " + midiState[mappings.get(mapping)]);
     return midiState[mappings.get(mapping)];
   }
   catch (Exception e) {
     println(mapping + ": -1");
     return -1; 
   }
   
 }
 
 
 void handleMidiEvent(int channel, int number, int val) {
   println("Handled " + channel + " " + number + " " + val);
   if (number >= 0) {
     midiState[number] = val;
   } 
   
 }


 

 void setMapping(String name, int control) {
   mappings.put(name, control);
 } 


 void setMappings() {
   mappings.put("spawnRate", SLIDER1);
   mappings.put("decay", SLIDER2);
   mappings.put("velocity", SLIDER3);
   
   mappings.put("randomSprite", BUTTON_REC);

   mappings.put("hue", KNOB1);
   mappings.put("sat", KNOB2);
   mappings.put("bri", KNOB3);
   
   mappings.put("drawSkyBox", BUTTON_S1);
   mappings.put("drawBuildings", BUTTON_S2);
   mappings.put("drawLogo", BUTTON_S3);
   
   mappings.put("biggernearer", BUTTON_PLAY);
   mappings.put("drawChibis", BUTTON_RWD);
   
   mappings.put("scrollSpeed", SLIDER4);

   mappings.put("hideFrame", BUTTON_R6);

 }

  void printMappings() {
    int i = 1;
    pushMatrix();
    pushStyle();
    translate(0, 0, 1);
    fill(0, 0, 0, 80);
    strokeWeight(1);
    stroke(0, 0, 0);
    rect(0, 0, 200, height);
    
    text("Mappings", 10, 10);
    for (String key : mappings.keySet()) {
  
       drawMapping(key, ++i);
       
       
    }
  
    popStyle();
    popMatrix();
  
  
  } 

  void drawMapping(String key, int i) {

    int x = 10;
    int y = 20 + (i * 20);

    fill(255, 150, 200, 100);
    rect(x - 1, y-10, this.get(key), 15);
    fill(255, 0, 255);
    text(key + " = " + this.get(key), x, y);
  }

  
}
