import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AgentStatus } from '../types';

interface CrystalProps {
  status: AgentStatus;
}

export const CrystalMesh: React.FC<CrystalProps> = ({ status }) => {
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const [error, setError] = React.useState<string | null>(null);

  const config = useMemo(() => {
    try {
      switch(status) {
        case AgentStatus.VOICE_ACTIVE:
          return { color: '#22d3ee', speed: 6.0, roughness: 0.05, emissive: 2.0, scale: 1.2, opacity: 1.0 };
        case AgentStatus.ROUTING:
          return { color: '#c084fc', speed: 2.5, roughness: 0.15, emissive: 0.8, scale: 1.0, opacity: 1.0 }; 
        case AgentStatus.THINKING:
          return { color: '#7e22ce', speed: 4.0, roughness: 0.05, emissive: 1.5, scale: 1.1, opacity: 1.0 }; 
        case AgentStatus.REFLECTING:
          return { color: '#fbbf24', speed: 0.8, roughness: 0.3, emissive: 0.6, scale: 1.05, opacity: 1.0 }; 
        case AgentStatus.EVOLVING:
          return { color: '#f0abfc', speed: 10.0, roughness: 0.0, emissive: 2.0, scale: 1.3, opacity: 1.0 }; 
        case AgentStatus.SPEAKING:
          return { color: '#22d3ee', speed: 1.5, roughness: 0.1, emissive: 0.3, scale: 1.0, opacity: 0.15 }; // 变淡，不影响阅读
        case AgentStatus.IDLE:
        default:
          return { color: '#a855f7', speed: 0.4, roughness: 0.1, emissive: 0.4, scale: 1.0, opacity: 1.0 }; 
      }
    } catch (e) {
      console.error('Config error:', e);
      return { color: '#a855f7', speed: 0.4, roughness: 0.1, emissive: 0.4, scale: 1.0, opacity: 1.0 };
    }
  }, [status]);

  useFrame((state, delta) => {
    try {
      // Safety check for delta parameter
      const safeDelta = (delta && typeof delta === 'number' && !isNaN(delta)) ? delta : 0.016;
      
      if (!outerRef.current || !innerRef.current) return;
      const t = state.clock.getElapsedTime();

      outerRef.current.rotation.x += safeDelta * 0.15 * config.speed;
      outerRef.current.rotation.y += safeDelta * 0.2 * config.speed;
      
      const organicPulse = Math.sin(t * config.speed) * (status === AgentStatus.VOICE_ACTIVE ? 0.15 : 0.05);
      const targetScale = 1.4 + organicPulse + (config.scale - 1.0);
      outerRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), safeDelta * 5);

      const outerMat = outerRef.current.material as THREE.MeshPhysicalMaterial;
      if (!outerMat) {
        console.error('Outer material not found');
        return;
      }
      
      const targetColor = new THREE.Color(config.color);
      outerMat.color.lerp(targetColor, safeDelta * 2);
      outerMat.emissive.lerp(targetColor, safeDelta * 2);
      outerMat.emissiveIntensity = THREE.MathUtils.lerp(outerMat.emissiveIntensity, config.emissive + Math.sin(t * 5) * 0.2, safeDelta * 2);
      // 控制透明度，输出文字时变淡
      outerMat.opacity = THREE.MathUtils.lerp(outerMat.opacity, config.opacity, safeDelta * 3);

      innerRef.current.rotation.x -= safeDelta * 0.1;
      const innerMat = innerRef.current.material as THREE.MeshStandardMaterial;
      if (!innerMat) {
        console.error('Inner material not found');
        return;
      }
      
      innerMat.emissiveIntensity = 2 + Math.sin(t * 10) * 0.5;
      // 内部水晶也变淡
      innerMat.opacity = THREE.MathUtils.lerp(innerMat.opacity, config.opacity, safeDelta * 3);
    } catch (e) {
      console.error('Frame update error:', e);
      setError(`Frame error: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  });

  if (error) {
    return null; // Don't render if there's an error
  }

  return (
    <group>
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[1, 0]} /> 
        <meshPhysicalMaterial transparent transmission={0.9} thickness={2.5} roughness={0.1} clearcoat={1.0} ior={2.2} color={'#a855f7'} emissive={'#a855f7'} opacity={1.0} />
      </mesh>
      <mesh ref={innerRef}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial transparent opacity={0.9} metalness={0.8} color={'#581c87'} emissive={'#581c87'} emissiveIntensity={2} />
      </mesh>
    </group>
  );
};