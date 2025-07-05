@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var uNoiseTex: texture_2d<f32>;
@group(0) @binding(2) var uSampler: sampler;

struct FragmentInput {
  @location(0) vUv: vec2<f32>,
}

@fragment
fn fragment_main(input: FragmentInput) -> @location(0) vec4<f32> {
  let uv = input.vUv;
  let noiseUv = (vec2<f32>(uv.x, uv.y + uniforms.uTime * 0.2)) * 2.5;
  let noiseVal = textureSample(uNoiseTex, uSampler, noiseUv).r;
  let distortedY = uv.y + (noiseVal - 0.5) * 0.4;

  let y = distortedY;
  let centerX = 0.5;
  let distFromCenter = abs(uv.x - centerX);
  var shapeMask = smoothstep(0.8, 0.3, distFromCenter / (1.0 - uv.y));
  shapeMask *= smoothstep(0.0, 0.1, uv.y);
  shapeMask *= smoothstep(1.0, 0.9, uv.y);

  var color: vec3<f32>;
  if (y < 0.2) {
    color = mix(vec3<f32>(0.1, 0.0, 0.0), vec3<f32>(1.0, 0.2, 0.0), y / 0.2);
  } else if (y < 0.6) {
    color = mix(vec3<f32>(1.0, 0.2, 0.0), vec3<f32>(1.0, 1.0, 0.0), (y - 0.2) / 0.4);
  } else {
    color = mix(vec3<f32>(1.0, 1.0, 0.0), vec3<f32>(1.0), (y - 0.6) / 0.4);
  }

  color *= shapeMask;

  return vec4<f32>(color, shapeMask);
}
