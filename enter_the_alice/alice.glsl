#ifdef GL_ES
precision highp float;
#endif

// Type of shader expected by Processing
#define PROCESSING_COLOR_SHADER

// Processing specific input
uniform vec2 resolution;
uniform vec2 mouse;

vec3    iResolution = vec3(resolution, 0.0);
uniform float     iGlobalTime;           // shader playback time (in seconds)
uniform float     iChannelTime[4];       // channel playback time (in seconds)
uniform vec3      iChannelResolution[4]; // channel resolution (in pixels)
uniform vec4      iMouse;                // mouse pixel coords. xy: current (if MLB down), zw: click
uniform vec4      iDate;                 // (year, month, day, time in seconds)
uniform float     iSampleRate;           // sound sample rate (i.e., 44100)

uniform float dirac_y;
uniform float band_size;
uniform float speed;
uniform float speedMult;

uniform float matX;
uniform float matY;
uniform float matZ;
uniform float matQ;

uniform float red;
uniform float green;
uniform float blue;


uniform float mover;

float t=iGlobalTime+80.;

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
  vec2 uv = fragCoord.xy / iResolution.yy;
  uv.y *= dirac_y;
  uv *= mat2(matX,matY,matZ,matQ)*band_size;


  float z=exp(-uv.y*uv.y*(2000.+1000.*cos(t*0.074+0.36)))*((2.+sin(t*0.035))*0.2)+0.8*cos(uv.y*11.0);
  uv.x += speedMult*sin(z+t*speed)*0.3;
  float d=sin(uv.x*mover)+0.3;
  float aa=fwidth(d);
  float c=smoothstep(-aa,aa,d);
  fragColor = vec4(red * c, green * c, blue * c,1.0);
}

void main(void) {
  mainImage(gl_FragColor, gl_FragCoord.xy);
}