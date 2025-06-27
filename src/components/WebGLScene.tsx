'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { ShaderMaterial } from 'three'
import { OrbitControls } from '@react-three/drei'

const vertexShader = `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;
    pos.y = sin(pos.x * 5.0 + uTime) * 0.2;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const fragmentShader = `
  varying vec2 vUv;

  void main() {
    gl_FragColor = vec4(vUv, 1.0, 1.0);
  }
`

function WavePlane() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const materialRef = useRef<ShaderMaterial>(null!)

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime()
    }
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        wireframe
        uniforms={{ uTime: { value: 0 } }}
      />
    </mesh>
  )
}

const WebGLScene = () => {
  return (
    <Canvas camera={{ position: [0, 0, 2], fov: 45 }}>
      <OrbitControls />
      <WavePlane />
    </Canvas>
  )
}

export default WebGLScene;