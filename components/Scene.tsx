import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { CrystalMesh } from './CrystalMesh';
import { AgentStatus } from '../types';

interface SceneProps {
  status: AgentStatus;
}

// Fallback component for loading
const SceneFallback = () => (
  <div className="absolute inset-0 z-0 bg-black flex items-center justify-center">
    <div className="text-white/40 text-sm">加载场景...</div>
  </div>
);

export const Scene: React.FC<SceneProps> = ({ status }) => {
  const [webglSupported, setWebglSupported] = React.useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      // Check WebGL support
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        setWebglSupported(false);
        setErrorMessage('WebGL not supported in your browser');
        console.error('WebGL not supported');
        return;
      }
      
      // Check for common WebGL errors
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        console.log('WebGL Renderer:', gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
      }
      
      setWebglSupported(true);
    } catch (error) {
      console.error('WebGL detection error:', error);
      setWebglSupported(false);
      setErrorMessage(`WebGL error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  if (webglSupported === false) {
    return (
      <div className="absolute inset-0 z-0 bg-black flex items-center justify-center">
        <div className="text-white/60 text-sm text-center">
          <p>WebGL 不受支持或被禁用</p>
          <p className="text-xs mt-2 opacity-60">{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (webglSupported === null) {
    return <SceneFallback />;
  }

  return (
    <div className="absolute inset-0 z-0 bg-black">
      <Suspense fallback={<SceneFallback />}>
        <Canvas 
          camera={{ position: [0, 0, 6], fov: 45 }}
          gl={{ antialias: true, alpha: false }}
          onCreated={(state) => {
            console.log('Canvas created, WebGL context:', state.gl);
            if (!state.gl.getContext()) {
              console.error('WebGL context creation failed');
              setErrorMessage('Failed to create WebGL context');
            }
          }}
          onError={(error) => {
            console.error('[Scene] Canvas error:', error);
            setErrorMessage(`Canvas error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            // 尝试继续渲染，即使有错误
            setWebglSupported(true); // 允许继续尝试
          }}
        >
        <color attach="background" args={['#050505']} />
        
        {/* Ambient Lighting */}
        <ambientLight intensity={0.5} />
        
        {/* Dynamic Point Lights driven by status could be added here, 
            but we rely on the emissive material for the "glow" */}
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4c1d95" />

        <CrystalMesh status={status} />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {/* Allow user to inspect the crystal, but limit zoom */}
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
      </Suspense>
      {errorMessage && (
        <div className="absolute bottom-4 left-4 z-10">
          <div className="text-red-400 text-xs bg-black/50 p-2 rounded">
            {errorMessage}
          </div>
        </div>
      )}
    </div>
  );
};