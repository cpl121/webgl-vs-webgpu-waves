import { WebGLScene, WebGPUScene } from '@/components';
import { useEffect, useState } from 'react';

export default function Home() {
  const [webgpuSupported, setWebgpuSupported] = useState(true)

  useEffect(() => {
    if (!navigator.gpu) {
      setWebgpuSupported(false)
    }
  }, [])

  return (
    <div className="flex flex-col h-full w-full">
      <main className="overflow-hidden h-full w-full flex flex-row">
        <div className="w-1/2 border-r-4 border-white">
          <div className="flex flex-col justify-center items-center border-b-2 text-white border-white py-4 space-y-2">
            <h1 className="text-3xl font-thin">WEBGL</h1>
            <span>25 campfires</span>
          </div>
          <WebGLScene />
        </div>
        <div className="w-1/2 border-l-4 border-white">
          {!webgpuSupported && (
            <div style={{
              position: 'relative',
              top: 0,
              width: '100%',
              backgroundColor: '#ff5555',
              color: 'white',
              padding: '10px',
              textAlign: 'center',
              fontWeight: 'bold',
              zIndex: 9999
            }}>
              Your browser does not support WebGPU. Please use Chrome Canary or a compatible browser.
            </div>
          )}
          <div className="flex flex-col justify-center items-center border-b-2 text-white border-white py-4 space-y-2">
            <h1 className="text-3xl font-thin">WEBGPU</h1>
            <span>100 campfires</span>
          </div>
          <WebGPUScene />
        </div>
      </main>
      <footer className="w-full flex items-center justify-center border-t border-white py-4 text-gray-400">
        <a
          className="hover:underline hover:underline-offset-4"
          href="https://github.com/cpl121"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="hidden sm:inline">cpl121.eth</span>
        </a>
      </footer>
    </div>
  );
}
