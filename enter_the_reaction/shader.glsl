#ifdef GL_ES
precision highp float;
#endif

#define PROCESSING_TEXTURE_SHADER

uniform sampler2D texture;
uniform vec2 texOffset;

uniform vec2 screen;
uniform vec2 mouse;
uniform float delta;
uniform float feed;
uniform float kill;

varying vec4 vertColor;
varying vec4 vertTexCoord;


float step_x = 1.0/screen.x;
float step_y = 1.0/screen.y;

void main() {

    vec2 uv = texture2D(texture, vertTexCoord.st).rg;
    vec2 uv0 = texture2D(texture, vertTexCoord.st + vec2(-texOffset.s, 0.0)).rg;
    vec2 uv1 = texture2D(texture, vertTexCoord.st + vec2(+texOffset.s, 0.0)).rg;
    vec2 uv2 = texture2D(texture, vertTexCoord.st + vec2(0.0, -texOffset.t)).rg;
    vec2 uv3 = texture2D(texture, vertTexCoord.st + vec2(0.0, +texOffset.t)).rg;

    vec2 lapl = uv0 + uv1 + uv2 + uv3 - 4.0 * uv;
    float du = 0.2097 * lapl.r - uv.r * uv.g * uv.g + feed * (1.0 - uv.r);
    float dv = 0.105 * lapl.g + uv.r * uv.g * uv.g - (feed+kill) * uv.g;
    vec2 dst = uv + delta * vec2(du, dv);

    vec2 diff = (vertTexCoord.st * screen) - mouse;
    float dist = dot(diff, diff);

    if (dist < 150.0) {
        dst.g = 0.9;
    }

    gl_FragColor = vec4(dst.r, dst.g, 0.0, 1.0);
}