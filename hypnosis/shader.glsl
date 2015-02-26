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

float sample(vec2 uv, float t) {
  uv *= amount;
  float r = length(uv);
  t *= (10.+floor(r))*0.1;
  t *= multi;
  t = t*t*t*t*t;
  t *= sign(fract(r)-0.5);
  float c = cos(t), s = sin(t);

  uv = mat2(c,s,-s,c)*uv;

  return step(width, fract(uv.x));
}

// s/rand based on justaway's https://www.shadertoy.com/view/MdXXWr
float srand(vec2 a) {
    return sin(dot(a,vec2(1233.224,1743.335)));
}

vec2 rand(vec2 r) {
    return fract(3712.65*r+0.61432);
}

void main(void) {
  vec2 uv = gl_FragCoord.xy - iResolution.xy * 0.5;
  vec2 aa = vec2(srand(uv.xy),srand(uv.yx));
  float c = 0.;
  float t = iGlobalTime * 60.0 + aa.x/64.0;
  for (int i = 0; i < 64; ++i) {
    aa = rand(aa);
    c += sample(uv+aa, t);
    t += 1./64.;
  }
  c=sqrt(c/64.);
  gl_FragColor = vec4(c,c,1.0,1.0);
}