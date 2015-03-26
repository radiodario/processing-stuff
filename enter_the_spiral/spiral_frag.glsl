#ifdef GL_ES
precision highp float;
#endif

// Type of shader expected by Processing
#define PROCESSING_COLOR_SHADER
#define PI 3.141592653589793
#define TAU 6.283185307179586

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

uniform float n_sub;
uniform float depth;
uniform float rot_factor;
uniform float squiggle_factor;
uniform float squiggle_period;
uniform float bob_factor;
uniform float speed;
uniform float divisions;

uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;
uniform vec3 color4;
uniform vec3 color5;

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
  vec2 p = depth*(0.5 * iResolution.xy - fragCoord.xy) / iResolution.xx;
  float angle = atan(p.y, p.x);
  float turn = (angle + PI) / TAU;
  float radius = sqrt(p.x*p.x + p.y*p.y);

  float rotation = rot_factor * TAU * iGlobalTime;
  float turn_1 = turn + rotation;

  float turn_sub = mod(float(n_sub) * turn_1, float(n_sub));

  float k_sine = squiggle_factor * sin(squiggle_period * iGlobalTime);
  float sine = k_sine * sin(bob_factor * (pow(radius, 0.1) - 0.4 * iGlobalTime));
  float turn_sine = turn_sub + sine;

  int n_colors = 5;
  int i_turn = int(mod(float(n_colors) * turn_sine, float(n_colors)));

  int i_radius = int(divisions/pow(radius*0.5, 0.6) + speed * iGlobalTime);

  int i_color = int(mod(float(i_turn + i_radius), float(n_colors)));

  vec3 color;
  if(i_color == 0) {
    color = color1;
  } else if(i_color == 1) {
    color = color2;
  } else if(i_color == 2) {
    color = color3;
  } else if(i_color == 3) {
    color = color4;
  } else if(i_color == 4) {
    color = color5;
  }

  color *= pow(radius, 0.5)*1.0;

  fragColor = vec4(color, 1.0);
}

void main(void) {
  mainImage(gl_FragColor, gl_FragCoord.xy);
}