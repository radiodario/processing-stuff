
void RRR(){
    color[] px = new color[seeds.size()];
    for (int i = seeds.size()-1; i >= 0; i-=1) {
      px[i] = pixels[seeds.get(i)];
    }

    // sort the results

    //-----------------------------------------------------------------
    px = sort(px);
    //px = reverse(px);
    //-----------------------------------------------------------------

    // set the resulting pixels back into place

    for (int i = seeds.size()-1; i >= 0; i-=1) {
      pixels[seeds.get(i)] = px[i];
    }

}

