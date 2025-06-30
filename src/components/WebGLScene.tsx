'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { ShaderMaterial } from 'three';
import { OrbitControls, useGLTF, useTexture } from '@react-three/drei';
import vertexFireShader from '../shaders/fire/vertex.glsl';
import fragmentFireShader from '../shaders/fire/fragment.glsl';
import vertexSmokeShader from '../shaders/smoke/vertex.glsl';
import fragmentSmokeShader from '../shaders/smoke/fragment.glsl';

function Campfire() {
  const materialRef = useRef<ShaderMaterial>(null!);

  const { scene } = useGLTF('/assets/campfire.glb');

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return <primitive object={scene} scale={[0.005, 0.005, 0.005]} />;
}

function FireShaderPlane() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  const perlinTexture = useTexture('/assets/textures/firePerlinNoise.png');
  perlinTexture.wrapS = THREE.RepeatWrapping;
  perlinTexture.wrapT = THREE.RepeatWrapping;

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef} position={[0.03, 0.375, 0]} rotation={[0, 0, 0]}>
      <planeGeometry args={[0.55, 0.7, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexFireShader}
        fragmentShader={fragmentFireShader}
        uniforms={{
          uTime: { value: 0 },
          uNoiseTex: { value: perlinTexture },
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
        //  wireframe
      />
    </mesh>
  );
}

function SmokeShaderPlane() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  const perlinTexture = useTexture('/assets/textures/perlin.png');
  perlinTexture.wrapS = THREE.RepeatWrapping;
  perlinTexture.wrapT = THREE.RepeatWrapping;

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 1, 0]} rotation={[0, 0, 0]}>
      <planeGeometry args={[0.5, 0.5, 16, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexSmokeShader}
        fragmentShader={fragmentSmokeShader}
        uniforms={{
          uTime: { value: 0 },
          uNoiseTex: { value: perlinTexture },
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
        //  wireframe
      />
    </mesh>
  );
}

const WebGLScene = () => {
  return (
    <Canvas camera={{ position: [0, 1, 2], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 2, 2]} intensity={1} />
      <group position={[0, -0.5, 0]}>
        <Campfire />
        <FireShaderPlane />
        <SmokeShaderPlane />
      </group>
      <OrbitControls
        enableDamping={false}
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 3.5}
        maxPolarAngle={Math.PI / 2}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 8}
      />
    </Canvas>
  );
};

export default WebGLScene;
