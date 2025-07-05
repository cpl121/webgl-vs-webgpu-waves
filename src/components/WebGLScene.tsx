'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls, Stars, useGLTF, useTexture } from '@react-three/drei';
import vertexFireShader from '../shaders/fire/vertex.glsl';
import fragmentFireShader from '../shaders/fire/fragment.glsl';
import vertexSmokeShader from '../shaders/smoke/vertex.glsl';
import fragmentSmokeShader from '../shaders/smoke/fragment.glsl';
import { Stats } from '@react-three/drei';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

const FlickeringLight = () => {
  const lightRef = useRef<THREE.SpotLight>(null);
  return (
    <spotLight
      ref={lightRef}
      position={[1, 0.5, 1]}
      angle={Math.PI / 6}
      penumbra={0.5}
      intensity={10}
      castShadow
    />
  );
};

function Campfire() {
  const { scene } = useGLTF('/assets/campfire.glb');
  const modelRef = useRef<THREE.Object3D>(null);

  const cloned = useRef<THREE.Object3D>(null);

  if (!cloned.current) {
    cloned.current = clone(scene);
  }

  return <primitive object={cloned.current} ref={modelRef} scale={[0.005, 0.005, 0.005]} />;
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
    <mesh ref={meshRef} position={[0.03, 0.375, 0.1]} rotation={[0, 0, 0]}>
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

function BonfireInstance({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <FlickeringLight />
      <Campfire />
      <FireShaderPlane />
      <SmokeShaderPlane />
    </group>
  );
}

const WebGLScene = () => {
  const bonfirePositions = [];

  const gridSize = 5;
  const spacing = 3;

  for (let x = 0; x < gridSize; x++) {
    for (let z = 0; z < gridSize; z++) {
      bonfirePositions.push([x * spacing, -0.0, z * spacing] as [number, number, number]);
    }
  }
  return (
    <Canvas camera={{ position: [13.35, 0.75, 14.5], fov: 50, near: 0.1, far: 50 }}>
      <ambientLight intensity={0.5} />
      <Stars radius={100} depth={50} count={50_000} factor={2} saturation={0} fade speed={2} />
      <directionalLight position={[2, 2, 2]} intensity={1} />
      {bonfirePositions.map((pos, i) => (
        <BonfireInstance key={i} position={pos} />
      ))}
      <OrbitControls
        // enableDamping={false}
        enablePan={false}
        enableZoom={false}
        enableDamping
        minPolarAngle={Math.PI / 2.5}
        maxPolarAngle={Math.PI / 2.01}
        minAzimuthAngle={Math.PI / 5}
        maxAzimuthAngle={Math.PI / 3}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8, -0.01, 8]} receiveShadow>
        <planeGeometry args={[35, 35]} />
        <meshStandardMaterial color="#3b2f23" roughness={1} />
      </mesh>
      <Stats />
    </Canvas>
  );
};

export default WebGLScene;
