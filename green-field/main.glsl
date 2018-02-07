#define PI 3.1415926535

#define INC 0.01
#define ESC 50.0

float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453);
}

bool intersects(in vec3 pos, out vec4 color) {
    #define WIDTH 0.02

    vec2 uv = pos.xz;
    color = vec4(0, 1, 0, 1);

    vec2 lol = fract(pos.xz);
    vec2 kek = floor(pos.xz);
    float h;

    if (max(lol.x, lol.y) <= WIDTH)
        h = rand(kek);
    else if (lol.x <= WIDTH)
        h = mix(rand(kek), rand(kek + vec2(0, 1)), lol.y);
    else if (lol.y <= WIDTH)
        h = mix(rand(kek), rand(kek + vec2(1, 0)), lol.x);
    else
        return false;

    return abs(h - pos.y) <= WIDTH;

    #undef WIDTH
}

vec3 ray(in vec3 pos, in vec2 frag) {
    vec2 uv = frag / iResolution.xy - 0.5;

    vec2 angle = iMouse.xy / iResolution.xy - 0.5;
    angle.x *= 2.0*PI; // [-PI,   PI  ]
    angle.y *=     PI; // [-PI/2, PI/2]

    vec3 forwards = vec3(
        cos(angle.y) * sin(angle.x),
        sin(angle.y),
        cos(angle.y) * cos(angle.x));

    vec3 up = vec3(
        -sin(angle.y) * sin(angle.x),
         cos(angle.y),
        -sin(angle.y) * cos(angle.x));

    vec3 right = vec3(
        cos(angle.x),
    	0,
    	-sin(angle.x));

    vec3 result = forwards + mat3(right, up, forwards) * vec3(uv.x, uv.y, 0);

    return normalize(result) * INC;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // Default color.

    fragColor = vec4(vec3(0), 1);

    // Trace.

    vec3 pos = vec3(0, 3, 8.0 * iTime);
    vec3 inc = ray(pos, fragCoord);
    vec4 col;
    float dst;

    //NOTE: Assumes that the grid is always below you and its top is at height 1.0.
    if (inc.y >= 0.0)
        return;
    float jump = ((1.0 - pos.y) / inc.y);
    pos += inc * jump;
    dst += INC * jump;


    while (dst < ESC) {
        if (intersects(pos, col)) {
            fragColor = col;
            break;
        }

        //NOTE: Assumes you're looking down on the grid.
        if (pos.y <= -INC)
            return;

        pos += inc;
    	dst += INC;
    }
}
