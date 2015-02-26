

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


  void setControlValueFromNote(String name, int value) {
   midiState[mappings.get(name)] = value;
 }


 void setMapping(String name, int control) {
   mappings.put(name, control);
 }

 void setMapping(String name, int control, int initialValue) {
  mappings.put(name, control);
  midiState[mappings.get(name)] = initialValue;
 }


 void setMappings() {
  setMapping("bgalpha", SLIDER1);

  setMapping("speed", SLIDER4, 10);
  setMapping("spread", SLIDER5);
  setMapping("maxSize", SLIDER6);
  setMapping("hue", KNOB1, 110);
  setMapping("sat", KNOB2, 127);
  setMapping("bri", KNOB3, 65);

  setMapping("setRandomBrightColors", BUTTON_MARKER_SET);
  setMapping("setVoidColors", BUTTON_MARKER_LEFT);
  setMapping("setRandomDarkColors", BUTTON_MARKER_RIGHT);

  setMapping("drawPoints", BUTTON_R2, 0);

  setMapping("fill", BUTTON_S1, 0);
  setMapping("stroke", BUTTON_M1, 1);

  setMapping("zMultiplier", SLIDER3, 1);

  setMapping("rotate", BUTTON_S4);
  setMapping("rotateX", KNOB4);
  setMapping("rotateY", KNOB5);
  setMapping("rotateZ", KNOB6);

  setMapping("lights", BUTTON_R1,1);

  setMapping("randomFill", BUTTON_S2);
  setMapping("randomStroke", BUTTON_M2);

  setMapping("nextFill", BUTTON_S3);
  setMapping("nextStroke", BUTTON_M3, 1);

  setMapping("hideFrame", BUTTON_R5, 1);
  setMapping("drawRandomTriangle", BUTTON_FWD);
  setMapping("strokeWidth", SLIDER7, 1);

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
