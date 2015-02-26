

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
   // add mappings here
   setMapping("bgAlpha", SLIDER1, 10);
   setMapping("fgAlpha", SLIDER2, 127);
   setMapping("hideFrame", BUTTON_R5, 1);

   setMapping("strokeWidth", SLIDER3, 10);

   setMapping("setRandomBrightColors", BUTTON_MARKER_SET, 1);
   setMapping("setVoidColors", BUTTON_MARKER_LEFT);
   setMapping("setRandomDarkColors", BUTTON_MARKER_RIGHT);
   setMapping("setGradient", BUTTON_CYCLE);

   setMapping("voidColors", BUTTON_M1, 1);

   setMapping("reset", BUTTON_TRACK_NEXT);
   setMapping("charwidth", KNOB1, 10);

   setMapping("xSpeed", SLIDER4, 64);
   setMapping("ySpeed", SLIDER5, 64);

   setMapping("step", KNOB7, 2);

   setMapping("rotate", BUTTON_R4, 0);

   setMapping("factor", BUTTON_R2, 0);

   setMapping("elevation", SLIDER8, 0);
   setMapping("elevationFactor", KNOB8);

   setMapping("updateRate", KNOB3, 0);

   setMapping("drawLines", BUTTON_PLAY, 1);

   setMapping("rotateCam", BUTTON_S4);
   setMapping("zoom", SLIDER6);
   setMapping("fov", SLIDER7);
   setMapping("rotateX", KNOB4);
   setMapping("rotateY", KNOB5);
   setMapping("rotateZ", KNOB6);

 }

 void printMappings() {
   int i = 1;
   pushMatrix();
   pushStyle();
   translate(0, 0);
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
