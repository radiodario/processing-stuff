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
uniform sampler2D texture;

uniform float zoom;
uniform vec3 baseColor;


const mat2 z = mat2(1,1,1,-1);

float rand(vec2 co) {
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}



float m(vec2 p)
{
    //vec4 sample = texture2D(texture, floor(z * p * .1)/64., -32.);
    //float component = (sample.r > .5 ? p.y : p.x);
    float sample = rand(floor(z * p *.01));
    float component = (sample > .5 ? p.y : p.x);
    return step(cos(1.257 * component), .17);
}


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 p = z * (fragCoord.xy / resolution.y * zoom + iGlobalTime * vec2(1.8, 1.08));
    vec2 c = floor(p);
    float s = step(1. - p.x + c.x, p.y - c.y);
    float f = m(c);
    float g = m(c + vec2(-1, 0) + s);
    s /= 4.;

    float mm = m(c-z[1]);
    float gOrF = (g < f ? f * (.75-s) : g * (.5+s));
    
    fragColor.rgb = mix(baseColor, vec3(1), mm + gOrF);
    fragColor.a = 1.0;
}

void main(void) {
  mainImage(gl_FragColor, gl_FragCoord.xy);
}