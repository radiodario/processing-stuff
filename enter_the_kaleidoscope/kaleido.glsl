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


uniform float tau_inverse;
uniform float time_mult;
uniform float zoom;
uniform float offset;
uniform float mult;
uniform int iterations;

const float tau = 6.2831853;

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
  vec2 uv = (fragCoord.xy-0.5*iResolution.xy) * zoom / iResolution.y;

    float r = 1.0;
    float a = iGlobalTime*.1;
    float c = cos(a)*r;
    float s = sin(a)*r;
    for ( int i=0; i<iterations; i++ )
    {
        uv = abs(uv);

        // higher period symmetry
        float t = atan(uv.x,uv.y);
        float q = tau_inverse / tau;
        t *= q;
        t = abs(fract(t*time_mult+.5)*2.0-1.0);
        t /= q;
        uv = length(uv)*vec2(sin(t),cos(t));

        uv -= .7;
        uv = uv*c + s*uv.yx*vec2(1,-1);
    }

    // fragColor = 1.0*0.5*iGlobalTime+vec4(13,17,23,1)*texture2D( texture, uv*vec2(1,-1)+.5, -1.0 );
    // fragColor = offset+mult*sin(iGlobalTime+vec4(13,17,23,1)*texture2D( texture, uv*vec2(1,-1)+.5, -1.0 ));
    // fragColor = offset+mult*sin((iGlobalTime/100.0)+vec4(13,17,23,1)*texture2D( texture, uv*vec2(1,-1)+.5, -1.0 ));
    fragColor = 0.5+1.0*sin(1.0+vec4(13,17,23,1)*texture2D( texture, uv*vec2(1,-1)+.5, -1.0 ));
}

void main(void) {
  mainImage(gl_FragColor, gl_FragCoord.xy);
}