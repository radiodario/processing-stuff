#ifdef GL_ES
precision highp float;
#endif

// Type of shader expected by Processing
#define PROCESSING_COLOR_SHADER

// Processing specific input
uniform float time;
uniform vec2 resolution;
uniform vec2 mouse;



vec3      iResolution = vec3(resolution, 0.0);           // viewport resolution (in pixels)
uniform float     iGlobalTime;           // shader playback time (in seconds)
uniform float     iChannelTime[4];       // channel playback time (in seconds)
uniform vec3      iChannelResolution[4]; // channel resolution (in pixels)
uniform vec4      iMouse;                // mouse pixel coords. xy: current (if MLB down), zw: click
uniform vec4      iDate;                 // (year, month, day, time in seconds)
uniform float     iSampleRate;           // sound sample rate (i.e., 44100)
uniform float     multi;
uniform float     amount;
uniform float     width;

// triangular groups tessellations. Coxeter group p-q-r. Stereographic projection.
// adapted from fragmentarium script.see: http://www.fractalforums.com/fragmentarium/triangle-groups-tessellation/
// Licence: free.
// the type of the space embedding the tessellation depend on the value: 1/p+1/q+1/r
// if >1 its the sphere
// if =1 its the euclidean plane
// if <1 its the hyperbolic plane
//
// Distance estimation to lines and vertices is used for antialiasing.
// You can still improve quality by using antialiasing.


// Iteration number.
uniform int Iterations;//=20;

//these are the p, q and r parameters that define the coxeter/triangle group
uniform int pParam;//=2;// Pi/p: angle beween reflexion planes a and b .
uniform int qParam;//=2;// Pi/q: angle beween reflexion planes b and c .
uniform int rParam;//=4;// Pi/r: angle beween reflexion planes c and a .

// U,V,W are the 'barycentric' coordinate for the vertex.
float U=0.;
float V=0.;
float W=1.;

uniform float SRadius;//=0.25;//Thikness of the lines

// scale factor
uniform float scaleFactor;//=2.1;

//Colors
uniform vec3 segColor;//=vec3(0.,0.,1.0);
uniform vec3 backGroundColor;//=vec3(1.,1.,1.);

#define PI 3.14159
vec3 nb,nc;//with na(=vec3(1,0,0)) these are the normals of the reflexion planes
vec3 p,q;//the vertex
vec3 pA,pB,pC;//"vertices" of the "triangle" made by the reflexion planes

float spaceType=0.;

float hdott(vec3 a, vec3 b){//dot product for "time like" vectors.
  return spaceType*dot(a.xy,b.xy)+a.z*b.z;
}
float hdots(vec3 a, vec3 b){//dot product for "space like" vectors (these are duals of the "time like" vectors).
  return dot(a.xy,b.xy)+spaceType*a.z*b.z;
}
float hlengtht(vec3 v){
  return sqrt(abs(hdott(v,v)));
}
float hlengths(vec3 v){
  return sqrt(abs(hdots(v,v)));
}

vec3 hnormalizet(vec3 v){//normalization of "time like" vectors.
  float l=1./hlengtht(v);
  return v*l;
}
/*vec3 hnormalizes(vec3 v){//normalization of "space like" vectors.(not used)
  float l=1./hlengths(v);
  return v*l;
}*/
/////////////////////////////////////////////////

int sign(int v){
  if(v<0) return -1; else if(v==0)return 0;else return 1;
}

void init() {
  spaceType=float(sign(qParam*rParam+pParam*rParam+pParam*qParam-pParam*qParam*rParam));//1./pParam+1./qParam+1./rParam-1.;

  float cospip=cos(PI/float(pParam)), sinpip=sin(PI/float(pParam));
  float cospiq=cos(PI/float(qParam)), sinpiq=sin(PI/float(qParam));
  float cospir=cos(PI/float(rParam)), sinpir=sin(PI/float(rParam));
  float ncsincos=(cospiq+cospip*cospir)/sinpip;

  //na is simply vec3(1.,0.,0.).
  nb=vec3(-cospip,sinpip,0.);
  nc=vec3(-cospir,-ncsincos,sqrt(abs((ncsincos+sinpir)*(-ncsincos+sinpir))));

  if(spaceType==0.){//This case is a little bit special
    nc.z=0.25;
  }

  pA=vec3(nb.y*nc.z,-nb.x*nc.z,nb.x*nc.y-nb.y*nc.x);
  pB=vec3(0.,nc.z,-nc.y);
  pC=vec3(0.,0.,nb.y);

  q=U*pA+V*pB+W*pC;//the vertex is the weighted average of the vertices of the triangle
  p=hnormalizet(q);
}

vec3 fold(vec3 pos) {
  for(int i=0;i<Iterations;i++){
    pos.x=abs(pos.x);
    float t=-2.*min(0.,dot(nb,pos)); pos+=t*nb*vec3(1.,1.,spaceType);
    t=-2.*min(0.,dot(nc,pos)); pos+=t*nc*vec3(1.,1.,spaceType);
  }
  return pos;
}

float DD(float tha, float r){
  return tha*(1.+spaceType*r*r)/(1.+spaceType*spaceType*r*tha);
}

float dist2Segment(vec3 z, vec3 n, float r){
  //pmin is the orthogonal projection of z onto the plane defined by p and n
  //then pmin is projected onto the unit sphere

  //we are assuming that p and n are normalized. If not, we should do:
  //mat2 smat=mat2(vec2(hdots(n,n),-hdots(p,n)),vec2(-hdott(p,n),hdott(p,p)));
  mat2 smat=mat2(vec2(1.,-hdots(p,n)),vec2(-hdott(p,n),1.));//should be sent as uniform
  vec2 v=smat*vec2(hdott(z,p),hdots(z,n));//v is the componenents of the "orthogonal" projection (depends on the metric) of z on the plane defined by p and n wrt to the basis (p,n)
  v.y=min(0.,v.y);//crops the part of the segment past the point p

  vec3 pmin=hnormalizet(v.x*p+v.y*n);
  float tha=hlengths(pmin-z)/hlengtht(pmin+z);
  return DD((tha-SRadius)/(1.+spaceType*tha*SRadius),r);
}

float dist2Segments(vec3 z, float r){
  float da=dist2Segment(z, vec3(1.,0.,0.), r);
  float db=dist2Segment(z, nb, r);
  float dc=dist2Segment(z, nc*vec3(1.,1.,spaceType), r);

  return min(min(da,db),dc);
}

float aaScale = 0.005;//anti-aliasing scale == half of pixel size.

vec3 color(vec2 pos){
  //todo: add here a möbius transform.
  float r=length(pos);
  vec3 z3=vec3(2.*pos,1.-spaceType*r*r)*1./(1.+spaceType*r*r);
  if(spaceType==-1. && r>=1.) return backGroundColor;//We are outside Poincaré disc.

  z3=fold(z3);

  vec3 color=backGroundColor;
  //vec3 color=texture2D(iChannel0, z3.xy + 0.25*iGlobalTime).rgb;
  //antialiasing using distance de segments and vertices (ds and dv) (see:http://www.iquilezles.org/www/articles/distance/distance.htm)
  {
    float ds=dist2Segments(z3, r);
    color=mix(segColor,color,smoothstep(-1.,1.,ds*0.5/aaScale));//clamp(ds/aaScale.y,0.,1.));
  }

  //final touch in order to remove jaggies at the edge of the circle (for hyperbolic case)
  if(spaceType==-1.) color=mix(backGroundColor,color,smoothstep(0.,1.,(1.-r)*0.5/aaScale));//clamp((1.-r)/aaScale.y,0.,1.));
  return color;
}

void animUVW(float t){
  U=sin(t)*0.5+0.5;
  V=sin(2.*t)*0.5+0.5;
  W=sin(4.*t)*0.5+0.5;
}

void main(void)
{

  vec2 uv = scaleFactor*(gl_FragCoord.xy-0.5*iResolution.xy) / iResolution.y;
  aaScale=0.5*scaleFactor/iResolution.y;
  animUVW(0.5*PI*iGlobalTime);
  init();
  gl_FragColor = vec4(color(uv),1.0);
}
