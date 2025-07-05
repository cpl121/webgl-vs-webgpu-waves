export default `
uniform sampler2D uNoiseTex;
uniform float uTime;

varying vec2 vUv;

void main() {
    // Scale and animate
    vec2 smokeUv = vUv;
    smokeUv.x *= 0.5;
    smokeUv.y *= 0.2;
    smokeUv.y -= uTime * 0.05;

    // Remap
    float smoke = texture(uNoiseTex, smokeUv).r;
    smoke = smoothstep(0.4, 1.0, smoke);
    
    // Edges
    smoke *= smoothstep(0.0, 0.1, vUv.y);
    smoke *= smoothstep(1.0, 0.7, vUv.y);
    smoke *= smoothstep(0.0, 0.1, vUv.x);
    smoke *= smoothstep(1.0, 0.9, vUv.x);
    
    gl_FragColor = vec4(0.6, 0.6, 0.8, smoke);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}`;
