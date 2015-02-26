interface BeatListener {
  void beat();
}

class BeatManager {
  EventDispatcher<BeatListener> listeners = new EventDispatcher<BeatListener>();

  int count = 0;
  int msecsFirst = 0;
  int msecsPrevious = 0;

  BeatThread b;


  BeatManager() {
    b = new BeatThread(this, millis(), 60000/120);
  }


  void resetCount() {

    count = 0;

  }

  void start() {
    b.start();
  }

  void setBeat() {
    b.stopit();
    int msecs = millis();


    if ((msecs - msecsPrevious) > 2000) {
       resetCount();
    }

    if (count == 0) {
      msecsFirst = msecs;
      count = 1;
    } else {

      int bpmAvg = 60000 * count / (msecs - msecsFirst);

      println("bpm:" + (bpmAvg));

      b = new BeatThread(this, msecs, 60000 / bpmAvg);
      b.start();
      count++;
    }


    msecsPrevious = msecs;

  }

  //trigger
  void broadcastEvent(BeatThread t) {
   for (BeatListener l : listeners) {
     l.beat();
   }
  }

  void beat() {
   for (BeatListener l : listeners) {
     l.beat();
   }
  }



};

// the beat clock thread
class BeatThread extends Thread {
  long timeStamp;
  long interval;
  int MINUTE = 60000;
  boolean running;
  BeatManager parent;

  BeatThread(BeatManager parent, long timeStamp, int interval) {
    this.parent = parent;
    this.timeStamp = timeStamp;
    this.interval = interval;
    this.running = true;
  }

  void run() {
   while (running) {
      beat();
    }

  }

  void stopit() {
    this.running = false;
  }

  void beat() {
    try {
      //parent.broadcastEvent(this);
      Thread.sleep(interval);
    } catch(InterruptedException e) {
    }
  }



};
