import * as THREE from 'three/webgpu'

export function createFireMesh(): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(0.55, 0.7, 128, 128)

  const dummyMaterial = new THREE.MeshBasicMaterial({ visible: false }) // solo placeholder

  const mesh = new THREE.Mesh(geometry, dummyMaterial)
  mesh.position.set(0.03, 0.375, 0)

  return mesh
}
