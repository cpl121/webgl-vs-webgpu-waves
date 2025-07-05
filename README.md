# 🔥 WebGL vs WebGPU — Procedural Fire & Smoke Shader

This project showcases a side-by-side comparison of **WebGL** and **WebGPU** rendering techniques by implementing a procedural fire and smoke effect with custom shaders.

### 🚀 Tech Stack

- **Three.js** (WebGL & WebGPU modules)
- **React** with Next.js
- **GLSL** shaders (for WebGL)
- **TSL** (Three Shader Language) for WebGPU
- **@react-three/fiber** (WebGL scene)
- **WebGPURenderer** (native Three.js)
- **GLTF** campfire model
- **Custom animated light + perlin texture distortion**

### 🎯 Goals

- Visualize the performance and visual differences between **WebGL** and **WebGPU**.
- Test shader migration from GLSL (WebGL) to TSL (WebGPU).
- Explore procedural animation (vertex displacement + color gradient) using a noise texture.

### 📸 Features

- 🔥 Fire and smoke procedural shaders with vertex displacement and additive blending.
- 💡 Dynamic spotlight with flickering animation to simulate fire lighting.
- 🌌 Star field background + 100 campfires in a grid to test scalability.
- 📈 Built-in FPS stats overlay to compare both rendering modes.
- 🛑 Browser fallback notice if WebGPU is not supported.

### 📊 Performance Observations
- WebGL is stable and compatible, but performance drops as the scene scales.
- WebGPU maintains high FPS with many objects, better GPU parallelism.