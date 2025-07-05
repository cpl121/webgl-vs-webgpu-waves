'use client';

import { useEffect, useRef } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import * as THREE from 'three/webgpu';
import {
  uv,
  time,
  texture,
  float,
  vec2,
  vec3,
  add,
  sub,
  mul,
  pow,
  abs,
  mix,
  smoothstep,
  select,
  lessThan,
  positionLocal,
  sin,
  cos,
  div,
} from 'three/tsl';
import OperatorNode from 'three/src/nodes/math/OperatorNode.js';
import { useStats } from '@/hooks/useStats';
import Stats from 'three/examples/jsm/libs/stats.module.js';

export default function WebGPUCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!navigator.gpu) {
      console.error('WebGPU not supported.');
      return;
    }

    const container = containerRef.current!;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const stats = new Stats();
    stats.dom.style.position = 'absolute';
    stats.dom.style.top = '-100px';
    // stats.dom.style.left = '-100px'
    stats.dom.style.zIndex = '100';
    container.appendChild(stats.dom);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);

    const textureLoader = new THREE.TextureLoader();
    const perlinTex = textureLoader.load('/assets/textures/firePerlinNoise.png');
    perlinTex.wrapS = perlinTex.wrapT = THREE.RepeatWrapping;

    const rotate2D = (
      val: THREE.TSL.ShaderNodeObject<THREE.Node>,
      ang: THREE.TSL.ShaderNodeObject<OperatorNode>,
    ) => {
      const s = sin(ang),
        c = cos(ang);
      return vec2(sub(mul(c, val.x), mul(s, val.y)), add(mul(s, val.x), mul(c, val.y)));
    };

    function createFire(perlin: THREE.Texture) {
      const mat = new THREE.MeshBasicNodeMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const pos = positionLocal,
        t = time;
      const nUV = mul(vec2(pos.x, add(pos.y, mul(t, float(0.3)))), float(2.5));
      const nVal = texture(perlin, nUV).r;
      const nStr = pow(sub(float(1.0), pos.y), float(1.5));
      const offset = mul(sub(nVal, float(0.5)), mul(float(0.1), nStr));

      const shape = pow(sub(float(1.0), pos.y), float(2.0));
      const waveX = mul(sin(add(mul(pos.y, float(10.0)), mul(t, float(3.0)))), float(0.05));
      const waveZ = mul(sin(add(mul(pos.y, float(7.0)), mul(t, float(2.0)))), float(0.05));

      mat.positionNode = vec3(
        add(pos.x, add(offset, mul(shape, waveX))),
        pos.y,
        add(pos.z, add(offset, mul(shape, waveZ))),
      );

      const uvNode = uv(),
        noiseUV = mul(add(uvNode, vec2(float(0), mul(t, float(0.2)))), float(2.5));
      const noise = texture(perlin, noiseUV).r;
      const y = add(uvNode.y, mul(sub(noise, float(0.5)), float(0.4)));

      const d = abs(sub(uvNode.x, float(0.5)));
      const mask = mul(
        mul(
          smoothstep(float(0.5), float(0.25), div(d, add(sub(float(1.0), uvNode.y), float(0.01)))),
          smoothstep(float(0.02), float(0.15), uvNode.y),
        ),
        smoothstep(float(0.95), float(0.7), uvNode.y),
      );

      const color = select(
        lessThan(y, float(0.2)),
        mix(vec3(0.1, 0, 0), vec3(1, 0.2, 0), div(y, float(0.2))),
        select(
          lessThan(y, float(0.6)),
          mix(vec3(1, 0.2, 0), vec3(1, 1, 0), div(sub(y, float(0.2)), float(0.4))),
          mix(vec3(1, 1, 0), vec3(1, 1, 1), div(sub(y, float(0.6)), float(0.4))),
        ),
      );

      mat.colorNode = vec3(mul(color, mask));
      mat.opacityNode = mask;
      const geo = new THREE.PlaneGeometry(0.55, 0.7, 64, 64);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0.03, 0.375, 0);
      return mesh;
    }

    function createSmoke(perlin: THREE.Texture) {
      const mat = new THREE.MeshBasicNodeMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.NormalBlending,
      });

      const pos = positionLocal,
        uvV = uv(),
        t = time;
      const twist = texture(perlin, vec2(0.2, sub(mul(uvV.y, 0.2), mul(t, 0.005)))).r;
      const angle = mul(twist, float(2.5));
      const twistXZ = rotate2D(vec2(pos.x, pos.z), angle);

      const windX = sub(texture(perlin, vec2(0.25, mul(t, 0.01))).r, 0.5);
      const windZ = sub(texture(perlin, vec2(0.75, mul(t, 0.01))).r, 0.5);
      const windStr = mul(pow(uvV.y, float(2.0)), float(1.0));

      mat.positionNode = vec3(
        add(twistXZ.x, mul(windX, windStr)),
        pos.y,
        add(twistXZ.y, mul(windZ, windStr)),
      );

      const sUV = vec2(mul(uv().x, 0.5), sub(mul(uv().y, 0.3), mul(t, 0.08)));
      let val = texture(perlin, sUV).r;
      val = smoothstep(0.4, 1.0, val);
      val = mul(val, smoothstep(0, 0.2, uv().y));
      val = mul(val, smoothstep(1.0, 0.6, uv().y));
      val = mul(val, smoothstep(0, 0.15, uv().x));
      val = mul(val, smoothstep(1.0, 0.85, uv().x));

      mat.colorNode = vec3(0.6, 0.6, 0.8);
      mat.opacityNode = mul(val, float(0.7));
      const geo = new THREE.PlaneGeometry(1.2, 2.0, 64, 64);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, 0.8, 0);
      return mesh;
    }

    function createLight() {
      const flickeringLight = new THREE.SpotLight(0xffffff, 8);
      flickeringLight.position.set(
        flickeringLight.position.x + 1.25,
        0.5,
        flickeringLight.position.z + 1.25,
      );
      flickeringLight.angle = Math.PI / 6;
      flickeringLight.penumbra = 0.5;
      flickeringLight.castShadow = true;
      return flickeringLight;
    }

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 500);
    camera.position.set(30, 0.65, 29);

    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1000;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 100;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.2,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    const renderer = new THREE.WebGPURenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.minPolarAngle = Math.PI / 2.2;
    controls.maxPolarAngle = Math.PI / 2.01;
    controls.minAzimuthAngle = Math.PI / 4.5;
    controls.maxAzimuthAngle = Math.PI / 3.5;

    const resize = () => {
      const w = container.clientWidth,
        h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', resize);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(2, 2, 2);
    scene.add(light);

    // Floor
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#3b2f23',
      roughness: 1,
    });
    const floorGeo = new THREE.PlaneGeometry(50, 50);
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.set(-Math.PI / 2, 0, 0);
    floorMesh.position.set(11.5, 0, 11.5);
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    const loader = new GLTFLoader();

    loader.load('/assets/campfire.glb', (gltf) => {
      const base = gltf.scene;
      base.scale.set(0.005, 0.005, 0.005);
      const grid = 10,
        spacing = 3.0;

      for (let x = 0; x < grid; x++) {
        for (let z = 0; z < grid; z++) {
          const g = new THREE.Group();
          const m = clone(base);
          m.position.set(0.03, 0, 0);
          g.add(m);
          g.add(createFire(perlinTex));
          g.add(createSmoke(perlinTex));
          g.add(createLight());
          g.position.set(x * spacing, 0, z * spacing);
          scene.add(g);
        }
      }
    });

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      stats.update();
      renderer.renderAsync(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
      container.removeChild(stats.dom);
    };
  }, []);

  useStats(containerRef.current);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100vh', position: 'relative' }} />
  );
}
