export default `
  varying vec2 vUv;
  uniform float uTime;
  uniform sampler2D uNoiseTex;

  void main() {
    vec2 uv = vUv;
    vec3 color = vec3(0.0);
    vec2 noiseUv = vec2(vUv.x, vUv.y + uTime * 0.2);
    noiseUv *= 2.5;

    float noiseVal = texture2D(uNoiseTex, noiseUv).r;
    float distortedY = vUv.y + (noiseVal - 0.5) * 0.4;

    float y = distortedY;

    float centerX = 0.5;
    float distFromCenter = abs(uv.x - centerX);

    float shapeMask = smoothstep(0.8, 0.3, distFromCenter / (1.0 - uv.y));
    shapeMask *= smoothstep(0.0, 0.1, vUv.y);
    shapeMask *= smoothstep(1.0, 0.9, vUv.y);

    if (y < 0.2) {
        color = mix(vec3(0.1, 0.0, 0.0), vec3(1.0, 0.2, 0.0), y / 0.2);
    } else if (y < 0.6) {
        color = mix(vec3(1.0, 0.2, 0.0), vec3(1.0, 1.0, 0.0), (y - 0.2) / 0.4);
    } else {
        color = mix(vec3(1.0, 1.0, 0.0), vec3(1.0), (y - 0.6) / 0.4);
    }

    color *= shapeMask;

    gl_FragColor = vec4(color, shapeMask);
  }`;
