import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { CrystalMesh } from './CrystalMesh';
import { AgentStatus } from '../types';

interface SceneProps {
  status: AgentStatus;
}

export const Scene: React.FC<SceneProps> = ({ status }) => {
  return (
    <div className="absolute inset-0 z-0 bg-black">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
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
    </div>
  );
};