

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
   // println("Handled " + channel + " " + number + " " + value);
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

  setMapping("scaleFactor", KNOB7, 100);
  setMapping("iterations", KNOB8, 4);
  setMapping("pParam", SLIDER1, 10);
  setMapping("qParam", SLIDER2, 10);
  setMapping("rParam", SLIDER3, 10);
  setMapping("SRadius", SLIDER4, 10);

  // base R component for sea
  setMapping("segColorR", KNOB1, 2);
  // base G component for sea
  setMapping("segColorG", KNOB2, 4);
  // base B component for sea
  setMapping("segColorB", KNOB3, 9);

  // water R
  setMapping("bgColorR", KNOB4, 100);
  // water G
  setMapping("bgColorG", KNOB5, 120);
  // water B
  setMapping("bgColorB", KNOB6, 130);

  setMapping("hideFrame", BUTTON_R5, 1);

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
