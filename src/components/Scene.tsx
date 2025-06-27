import { Canvas } from '@react-three/fiber';
import { CanvasLoader } from '@/components';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Suspense } from 'react';

const Scene = () => {
  return (
    <Canvas
      camera={{ position: [4, 5, 10], fov: 70 }}
      shadows
      gl={{
        outputColorSpace: THREE.SRGBColorSpace,
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
        shadowMapEnabled: true,
        shadowMapType: THREE.PCFSoftShadowMap,
      }}
    >
      <color attach="background" args={['#000']} />
      <ambientLight intensity={3} color="#445566" />
      <OrbitControls
        enableDamping
        enablePan={false}
        //   minPolarAngle={Math.PI / 3}
        //   maxPolarAngle={Math.PI / 1.75}
        //   minDistance={10}
        //   maxDistance={25}
        //   minAzimuthAngle={-Math.PI / 4}
        //   maxAzimuthAngle={Math.PI / 3}
      />

      <Suspense fallback={<CanvasLoader />} name={'Loader'}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[10, 10, 30, 30]} />
          <meshBasicMaterial color={'cyan'} side={THREE.DoubleSide} />
        </mesh>
      </Suspense>
    </Canvas>
  );
};

export default Scene;
