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

uniform float timeOffset1;
uniform float timeOffset2;
uniform float timeOffset3;

//Based on Andrew Baldwin's noise tutorial: http://thndl.com/?15

float rand(vec2 p, float timeOffset)
{
  p += 0.2127*timeOffset + p.x + 0.3713*p.y;
  vec2 r = (123.789)*sin(1.823*(p));
  return fract(r.x*r.y);
}

float sn(vec2 p, float timeOffset)
{
  vec2 i=floor(p-0.5);
  vec2 f=fract(p-0.5);
  f = f*f*f*(f*(f*6.0-15.0)+6.0);
  float rt=mix(rand(i, timeOffset),rand(i+vec2(1.,0.), timeOffset),f.x);
  float rb=mix(rand(i+vec2(0.0,1.0), timeOffset),rand(i+vec2(1.0,1.0), timeOffset),f.x);
  return mix(rt,rb,f.y);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
  //vec2 r=fract(456.789*sin(789.123*c.xy));
  //f=vec4(r.x*r.y)

  //create random noise
  //vec2 r = 123.0*sin(1.823*fragCoord.xy);


  vec2 p = fragCoord.xy*vec2(0.012);

  //fragColor = vec4(vec3(sn(vec2(0.02)*fragCoord.xy)),1.0);
  fragColor = vec4(vec3(
  0.5*sn(p, timeOffset1)
  +0.25*sn(2.0*p, timeOffset2)
  +0.125*sn(4.0*p, timeOffset3)
  +0.0625*sn(8.0*p, sin(iGlobalTime*0.00025))
  +0.03125*sn(16.0*p, sin(iGlobalTime*0.00032))
  +0.015*sn(32.0*p, sin(iGlobalTime*0.00046))
  ),1.);
}

void main(void) {
  mainImage(gl_FragColor, gl_FragCoord.xy);
}