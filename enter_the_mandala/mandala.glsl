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

uniform float thickness;
uniform float speed;


/*
credit to gleurop on shadertoy
https://www.shadertoy.com/view/lslSR7

i've only taken out variables
*/


vec3 hsv(float h,float s,float v) {
  return mix(vec3(1.),clamp((abs(fract(h+vec3(3.,2.,1.)/3.)*6.-3.)-1.),0.,1.),s)*v;
}
float circle(vec2 p, float r) {
  return smoothstep(thickness, 0.0, abs(length(p)-r)); // try changing the 0.1 to 0.3
}
float r3 = sqrt(3.0);
void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
  vec2 uv = -1.0 + 2.0*fragCoord.xy / iResolution.xy;
  uv.x *= iResolution.x/iResolution.y;
  uv *= 10.0;
  float r = smoothstep(-0.7, 0.7, sin(iGlobalTime*speed-length(uv)*0.1))+1.0;

  vec2 rep = vec2(4.0,r3*4.0);
  vec2 p1 = mod(uv, rep)-rep*0.5;
  vec2 p2 = mod(uv+vec2(2.0,0.0), rep)-rep*0.5;
  vec2 p3 = mod(uv+vec2(1.0,r3), rep)-rep*0.5;
  vec2 p4 = mod(uv+vec2(3.0,r3), rep)-rep*0.5;
  vec2 p5 = mod(uv+vec2(0.0,r3*2.0), rep)-rep*0.5;
  vec2 p6 = mod(uv+vec2(2.0,r3*2.0), rep)-rep*0.5;
  vec2 p7 = mod(uv+vec2(1.0,r3*3.0), rep)-rep*0.5;
  vec2 p8 = mod(uv+vec2(3.0,r3*3.0), rep)-rep*0.5;

  float c = 0.0;
  c += circle(p1, r);
  c += circle(p2, r);
  c += circle(p3, r);
  c += circle(p4, r);
  c += circle(p5, r);
  c += circle(p6, r);
  c += circle(p7, r);
  c += circle(p8 , r);
  fragColor = vec4(hsv(r+0.7, 1.0, c), 1.0);
}

void main(void) {
  mainImage(gl_FragColor, gl_FragCoord.xy);
}