struct Uniforms {
  uTime: f32,
}
@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var uNoiseTex: texture_2d<f32>;
@group(0) @binding(2) var uSampler: sampler;

struct VertexInput {
  @location(0) position: vec3<f32>,
  @location(1) uv: vec2<f32>,
}

struct VertexOutput {
  @builtin(position) Position: vec4<f32>,
  @location(0) vUv: vec2<f32>,
}

@vertex
fn vertex_main(input: VertexInput) -> VertexOutput {
  var pos = input.position;
  let uv = input.uv;

  let noiseUV = vec2<f32>(pos.x, pos.y + uniforms.uTime * 0.3) * 2.5;
  let n = textureSample(uNoiseTex, uSampler, noiseUV).r;
  let noiseStrength = pow(1.0 - pos.y, 1.5);

  pos.x += (n - 0.5) * 0.1 * noiseStrength;
  pos.z += (n - 0.5) * 0.1 * noiseStrength;

  let shapeFactor = pow(1.0 - pos.y, 2.0);
  let wave = sin(pos.y * 10.0 + uniforms.uTime * 3.0) * 0.025;

  pos.x += shapeFactor * wave;
  pos.z += shapeFactor * sin(pos.y * 7.0 + uniforms.uTime * 2.0) * 0.02;

  var output: VertexOutput;
  output.Position = vec4<f32>(pos, 1.0);
  output.vUv = uv;
  return output;
}
