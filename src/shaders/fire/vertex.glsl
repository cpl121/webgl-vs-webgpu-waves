uniform float uTime;
uniform sampler2D uNoiseTex;

varying vec2 vUv;

void main() {
    vec3 pos = position;

    vec2 noiseUV = vec2(pos.x, pos.y + uTime * 0.3);
    noiseUV *= 2.5;

    float n = texture2D(uNoiseTex, noiseUV).r;
    float noiseStrength = pow(1.0 - pos.y, 1.5);

    pos.x += (n - 0.5) * 0.1 * noiseStrength;
    pos.z += (n - 0.5) * 0.1 * noiseStrength;

    float shapeFactor = pow(1.0 - pos.y, 2.0);
    float wave = sin(pos.y * 10.0 + uTime * 3.0) * 0.025;

    pos.x += (shapeFactor * wave);
    pos.z += (shapeFactor * sin(pos.y * 7.0 + uTime * 2.0)) * 0.02;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

    // Varying
    vUv = uv;
}