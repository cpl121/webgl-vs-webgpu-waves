/// <reference types="@webgpu/types" />

'use client';

import { useEffect, useRef } from 'react';

export default function WebGPUScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    let animationFrameId: number;

    async function initWebGPU() {
      const canvas = canvasRef.current!;
      const adapter = await navigator.gpu?.requestAdapter();
      const device = await adapter?.requestDevice();
      if (!device) {
        console.error('WebGPU not supported');
        return;
      }

      const context = canvas.getContext('webgpu') as GPUCanvasContext;
      const format = navigator.gpu.getPreferredCanvasFormat();
      const sampleCount = 4;

      context.configure({
        device,
        format,
        alphaMode: 'opaque',
      });

      // === Vertex data (1D wave) ===
      const vertexCount = 1024;
      const positions = new Float32Array(vertexCount * 2);
      for (let i = 0; i < vertexCount; i++) {
        const x = (i / (vertexCount - 1)) * 2 - 1;
        positions[i * 2] = x;
        positions[i * 2 + 1] = 0;
      }

      const vertexBuffer = device.createBuffer({
        size: positions.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
      });
      new Float32Array(vertexBuffer.getMappedRange()).set(positions);
      vertexBuffer.unmap();

      // === Time uniform ===
      const timeBuffer = device.createBuffer({
        size: 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });

      const bindGroupLayout = device.createBindGroupLayout({
        entries: [
          {
            binding: 0,
            visibility: GPUShaderStage.VERTEX,
            buffer: { type: 'uniform' },
          },
        ],
      });

      const bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [{ binding: 0, resource: { buffer: timeBuffer } }],
      });

      // === Shaders ===
      const vertexShader = `
        struct Uniforms {
          time: f32,
        };
        @group(0) @binding(0) var<uniform> uniforms: Uniforms;

        struct VertexOut {
          @builtin(position) Position: vec4<f32>,
          @location(0) color: vec3<f32>,
        };

        @vertex
        fn main(@location(0) pos: vec2<f32>) -> VertexOut {
          var out: VertexOut;
          let y = sin(pos.x * 5.0 + uniforms.time) * 0.2;
          out.Position = vec4<f32>(pos.x, y, 0.0, 1.0);
          out.color = vec3<f32>(0.5 + 0.5 * pos.x, 0.2, 1.0);
          return out;
        }
      `;

      const fragmentShader = `
        @fragment
        fn main(@location(0) color: vec3<f32>) -> @location(0) vec4<f32> {
          return vec4<f32>(color, 1.0);
        }
      `;

      const vertexModule = device.createShaderModule({ code: vertexShader });
      const fragmentModule = device.createShaderModule({ code: fragmentShader });

      const pipeline = device.createRenderPipeline({
        layout: device.createPipelineLayout({
          bindGroupLayouts: [bindGroupLayout],
        }),
        vertex: {
          module: vertexModule,
          entryPoint: 'main',
          buffers: [
            {
              arrayStride: 8,
              attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x2' }],
            },
          ],
        },
        fragment: {
          module: fragmentModule,
          entryPoint: 'main',
          targets: [{ format }],
        },
        primitive: {
          topology: 'line-strip',
        },
        multisample: {
          count: sampleCount,
        },
      });

      // === Create MSAA target ===
      let msaaTexture: GPUTexture;

      const createMsaaTarget = () => {
        const width = canvas.width;
        const height = canvas.height;
        msaaTexture = device.createTexture({
          size: [width, height],
          sampleCount,
          format,
          usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
      };

      createMsaaTarget();
      window.addEventListener('resize', createMsaaTarget);

      // === Render loop ===
      const render = () => {
        const now = performance.now() / 1000;
        device.queue.writeBuffer(timeBuffer, 0, new Float32Array([now]));

        const encoder = device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
          colorAttachments: [
            {
              view: msaaTexture.createView(),
              resolveTarget: context.getCurrentTexture().createView(),
              loadOp: 'clear',
              storeOp: 'store',
              clearValue: { r: 0.05, g: 0.05, b: 0.07, a: 1 },
            },
          ],
        });

        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.setVertexBuffer(0, vertexBuffer);
        pass.draw(vertexCount);
        pass.end();

        device.queue.submit([encoder.finish()]);
        animationFrameId = requestAnimationFrame(render);
      };

      render();
    }

    initWebGPU();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
}
