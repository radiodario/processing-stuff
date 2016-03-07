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

uniform float DELTA; //0.001;
uniform int RAY_COUNT;  //   7
uniform float RAY_LENGTH_MAX; //    75.0
uniform int RAY_STEP_MAX; //    50
uniform float REFRACT_FACTOR; //    0.6
uniform float REFRACT_INDEX; //   2.417 // 2.417 for real diamonds... but it would require RAY_COUNT to be increased (because of total internal reflections)
uniform float AMBIENT; //       0.52
uniform float SPECULAR_POWER; //    3.0
uniform float SPECULAR_INTENSITY; //  0.85
uniform float FADE_POWER; //      1.0
uniform float GLOW_FACTOR; //     1.5
uniform float LUMINOSITY_FACTOR; // 2.90

#define LIGHT vec3 (1.0, 1.0, -1.0)
#define M_PI        3.1415926535897932384626433832795

//#define ATAN2 // Comment this to use the original atan function

mat3 mRotate (in vec3 angle) {
  float c = cos (angle.x);
  float s = sin (angle.x);
  mat3 rx = mat3 (1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c);

  c = cos (angle.y);
  s = sin (angle.y);
  mat3 ry = mat3 (c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c);

  c = cos (angle.z);
  s = sin (angle.z);
  mat3 rz = mat3 (c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0);

  return rz * ry * rx;
}

vec3 vRotateY (in vec3 p, in float angle) {
  float c = cos (angle);
  float s = sin (angle);
  return vec3 (c * p.x - s * p.z, p.y, c * p.z + s * p.x);
}

#ifndef ATAN2
#define atan2 atan
#else
float atan2 (in float y, in float x) {

  // From http://www.deepdyve.com/lp/institute-of-electrical-and-electronics-engineers/full-quadrant-approximations-for-the-arctangent-function-tips-and-V6yJDoI0iF
  // atan (x) = x / (1 + 0.28086 x^2)

  float t1 = abs (y);
  float t2 = abs (x);
  float t3 = min (t1, t2) / max (t1, t2);
  t3 = t3 / (1.0 + 0.28086 * t3 * t3);
  t3 = t1 > t2 ? M_PI / 2.0 - t3 : t3;
  t3 = x < 0.0 ? M_PI - t3 : t3;
  t3 = y < 0.0 ? -t3 : t3;
  return t3;
}

float atan2_nobranch (in float y, in float x) {

  // From http://www.deepdyve.com/lp/institute-of-electrical-and-electronics-engineers/full-quadrant-approximations-for-the-arctangent-function-tips-and-V6yJDoI0iF
  // atan (x) = x / (1 + 0.28086 x^2)

  float t1 = abs (y);
  float t2 = abs (x);
  float t3 = min (t1, t2) / max (t1, t2);
  t3 = t3 / (1.0 + 0.28086 * t3 * t3);
  float t4 = M_PI / 2.0 - t3;
  t3 = step (0.0, t2 - t1) * (t3 - t4) + t4;
  t4 = M_PI - t3;
  t3 = step (0.0, x) * (t3 - t4) + t4;
  t3 = step (0.0, y) * (t3 + t3) - t3;
  return t3;
}
#endif

vec3 normalTopA = normalize (vec3 (0.0, 1.0, 1.4));
vec3 normalTopB = normalize (vec3 (0.0, 1.0, 1.0));
vec3 normalTopC = normalize (vec3 (0.0, 1.0, 0.8));
vec3 normalBottomA = normalize (vec3 (0.0, -1.0, 1.6));
vec3 normalBottomB = normalize (vec3 (0.0, -1.0, 2.0));
vec3 k;
float getDistance (in vec3 p) {
  float repeat = 20.0;
  vec3 q = p + repeat * 0.5;
  k = floor (q / repeat);
  q -= repeat * (k + 0.5);
  p = mRotate (k + iGlobalTime) * q;

  float topCut = p.y - 1.1;
  float angleStep = M_PI / max (1.0, abs (4.0 + k.x + 2.0 * k.y + 4.0 * k.z));
  float angle = angleStep * (0.5 + floor (atan2 (p.x, p.z) / angleStep));
  q = vRotateY (p, angle);
  float topA = dot (q, normalTopA) - 2.0;
  float bottomA = dot (q, normalBottomA) - 2.0;
  float topC = dot (q, normalTopC) - 1.8;
  q = vRotateY (p, -angleStep * 0.5);
  angle = angleStep * floor (atan2 (q.x, q.z) / angleStep);
  q = vRotateY (p, angle);
  float bottomB = dot (q, normalBottomB) - 1.95;
  float topB = dot (q, normalTopB) - 1.92;

  return max (topCut, max (topA, max (topB, max (topC, max (bottomA, bottomB)))));
}

vec3 getFragmentColor (in vec3 origin, in vec3 direction) {
  vec3 lightDirection = normalize (LIGHT);
  vec2 delta = vec2 (DELTA, 0.0);

  vec3 fragColor = vec3 (0.0, 0.0, 0.0);
  float intensity = 1.0;

  float distanceFactor = 1.0;
  float refractionRatio = 1.0 / REFRACT_INDEX;
  float rayStepCount = 0.0;
  for (int rayIndex = 0; rayIndex < RAY_COUNT; ++rayIndex) {

    // Ray marching
    float dist = RAY_LENGTH_MAX;
    float rayLength = 0.0;
    for (int rayStep = 0; rayStep < RAY_STEP_MAX; ++rayStep) {
      dist = distanceFactor * getDistance (origin);
      float distMin = max (dist, DELTA);
      rayLength += distMin;
      if (dist < 0.0 || rayLength > RAY_LENGTH_MAX) {
        break;
      }
      origin += direction * distMin;
      ++rayStepCount;
    }

    // Check whether we hit something
    vec3 backColor = vec3 (0.0, 0.0, 0.1 + 0.2 * max (0.0, dot (-direction, lightDirection)));
    if (dist >= 0.0) {
      fragColor = fragColor * (1.0 - intensity) + backColor * intensity;
      break;
    }

    // Get the normal
    vec3 normal = normalize (distanceFactor * vec3 (
      getDistance (origin + delta.xyy) - getDistance (origin - delta.xyy),
      getDistance (origin + delta.yxy) - getDistance (origin - delta.yxy),
      getDistance (origin + delta.yyx) - getDistance (origin - delta.yyx)));

    // Basic lighting
    vec3 reflection = reflect (direction, normal);
    if (distanceFactor > 0.0) {
      float relfectionDiffuse = max (0.0, dot (normal, lightDirection));
      float relfectionSpecular = pow (max (0.0, dot (reflection, lightDirection)), SPECULAR_POWER) * SPECULAR_INTENSITY;
      float fade = pow (1.0 - rayLength / RAY_LENGTH_MAX, FADE_POWER);

      vec3 localColor = max (sin (k * k), 0.2);
      localColor = (AMBIENT + relfectionDiffuse) * localColor + relfectionSpecular;
      localColor = mix (backColor, localColor, fade);

      fragColor = fragColor * (1.0 - intensity) + localColor * intensity;
      intensity *= REFRACT_FACTOR;
    }

    // Next ray...
    vec3 refraction = refract (direction, normal, refractionRatio);
    if (dot (refraction, refraction) < DELTA) {
      direction = reflection;
      origin += direction * DELTA * 2.0;
    } else {
      direction = refraction;
      distanceFactor = -distanceFactor;
      refractionRatio = 1.0 / refractionRatio;
    }
  }

  // Return the fragment color
  return fragColor * LUMINOSITY_FACTOR + GLOW_FACTOR * rayStepCount / float (RAY_STEP_MAX * RAY_COUNT);
}

void mainImage (out vec4 fragColor, in vec2 fragCoord) {

  // Define the ray corresponding to this fragment
  vec2 frag = (2.0 * fragCoord.xy - iResolution.xy) / iResolution.y;
  vec3 direction = normalize (vec3 (frag, 2.0));

  // Set the camera
  vec3 origin = vec3 ((125.0 * cos (iGlobalTime * 0.1)), 10.0 * sin (iGlobalTime * 0.2), 15.0 * sin (iGlobalTime * 0.1));
  vec3 forward = -origin;
  vec3 up = vec3 (sin (iGlobalTime * 0.3), 2.0, 0.0);
  mat3 rotation;
  rotation [2] = normalize (forward);
  rotation [0] = normalize (cross (up, forward));
  rotation [1] = cross (rotation [2], rotation [0]);
  direction = rotation * direction;

  // Set the fragment color
  fragColor = vec4 (getFragmentColor (origin, direction), 1.0);
}

void main(void) {
  mainImage(gl_FragColor, gl_FragCoord.xy);
}
