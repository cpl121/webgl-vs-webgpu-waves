uniform sampler2D uNoiseTex;
uniform float uTime;

varying vec2 vUv;

vec2 rotate2D(vec2 value, float angle)
{
    float s = sin(angle);
    float c = cos(angle);
    mat2 m = mat2(c, s, -s, c);
    return m * value;
}

void main() {
    vec3 newPosition = position;

    // Twist
    float twistPerlin = texture(
        uNoiseTex, 
        vec2(0.4, uv.y * 0.2 - uTime * 0.005)
    ).r;
    float angle = twistPerlin * 10.0;
    newPosition.xz = rotate2D(newPosition.xz, angle);

    // Wind
    vec2 windOffset = vec2(
        texture(
            uNoiseTex, 
            vec2(0.25, uTime * 0.01)
        ).r - 0.5,
        texture(
            uNoiseTex, 
            vec2(0.75, uTime * 0.01)
        ).r - 0.5
    );
    windOffset *= pow(uv.y, 1.5) * 5.0;
    newPosition.xz += windOffset;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

    // Varying
    vUv = uv;
}