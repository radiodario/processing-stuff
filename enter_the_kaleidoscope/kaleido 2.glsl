#ifdef GL_ES
precision highp float;
#endif

// Type of shader expected by Processing
#define PROCESSING_COLOR_SHADER

// Processing specific input
uniform vec2 resolution;
uniform vec2 mouse;

uniform float     time;           // shader playback time (in seconds)

uniform sampler2D texture;


uniform float tau_inverse;
uniform float time_mult;
uniform float zoom;
uniform float offset;
uniform float mult;
uniform float speed;
uniform int iterations;

const float TAU = 6.2831853;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) * zoom / resolution.y;
  
  float r = 1.0;
  float a = time * speed;
  float c = cos(a) * r;
  float s = sin(a) * r;
  for (int i = 0; i < iterations; i++) {
    uv = abs(uv);

    // higher period simetry;
    float t = atan(uv.x, uv.y);
    float q = tau_inverse / TAU;
    t *= q;
    t = abs(fract(t * time_mult + .5) * 2.0 - 1.0);
    t /= q;
    uv = length(uv) * vec2(sin(t), cos(t));

    uv -= .7;
    uv = uv * c + s * uv.yx * vec2(1.0, -1.0);

  }

  gl_FragColor = 0.5 + 1.0 * sin(1.0 + vec4(13.0, 17.0, 23.0, 1.0) * texture2D(texture, uv*vec2(1.0, -1.0) + .5, -1.0));

}
