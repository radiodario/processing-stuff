

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
     println(mapping + ": -1 \n" + e);
     return -1;
   }

 }


 void handleMidiEvent(int channel, int number, int value) {
   println("Handled " + channel + " " + number + " " + value);
   if (number >= 0) {
     midiState[number] = value;
   }

 }


 void setControlValueFromNote(String name, int value) {
   midiState[mappings.get(name)] = value;
 }


 void setMapping(String name, int control) {
   mappings.put(name, control);
   midiState[control] = 0;
 }

 void setMapping(String name, int control, int initialValue) {
  mappings.put(name, control);
  midiState[mappings.get(name)] = initialValue;
 }


 void setMappings() {
   setMapping("decay", SLIDER1, 100);
   setMapping("reset", BUTTON_S8, 1);
   setMapping("fullLife", BUTTON_TRACK_PREV);
   setMapping("resetLife", BUTTON_R2);
   setMapping("setRandomBrightColors", BUTTON_MARKER_SET);
   setMapping("setVoidColors", BUTTON_MARKER_LEFT);
   setMapping("setRandomDarkColors", BUTTON_MARKER_RIGHT);

   setMapping("beating", BUTTON_PLAY);
   setMapping("showMappings", BUTTON_R8);
   setMapping("randomGrowth", BUTTON_R3);

   setMapping("fill", BUTTON_S1);
   setMapping("stroke", BUTTON_M1, 1);

   setMapping("strokeWidth", SLIDER2, 2);

   setMapping("fov", SLIDER7);

   setMapping("hue", KNOB1, 127);
   setMapping("sat", KNOB2, 65);
   setMapping("bri", KNOB3, 127);

   setMapping("randomFill", BUTTON_S2);
   setMapping("randomStroke", BUTTON_M2);

   setMapping("nextFill", BUTTON_S3);
   setMapping("nextStroke", BUTTON_M3, 2);

   setMapping("rotate", BUTTON_S4);
   setMapping("rotateX", KNOB4);
   setMapping("rotateY", KNOB5);
   setMapping("rotateZ", KNOB6);

   setMapping("zJitter", BUTTON_S6);
   setMapping("zJitterAmount", SLIDER6);

   setMapping("sphere", BUTTON_RWD);
   setMapping("sphereDetail", SLIDER8, 10);

   setMapping("maxSize", KNOB8);
   setMapping("hideFrame", BUTTON_R5, 1);

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
   int y = (i * 15);

   fill(255, 150, 200, 100);
   rect(x - 1, y-10, this.get(key), 14);
   fill(255, 0, 255);
   text(key + " = " + this.get(key), x, y);
 }



}
