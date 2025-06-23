import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import * as THREE from "three";

interface EnemyType {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  type: 'basic' | 'fast' | 'smart';
}

interface EnemyProps {
  enemy: EnemyType;
  position: [number, number, number];
}

export default function Enemy({ enemy, position }: EnemyProps) {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Add menacing movement animation
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 3) * 0.2;
      meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 2) * 0.1;
      
      // Different colors for different enemy types
      const material = meshRef.current.material as THREE.MeshLambertMaterial;
      switch (enemy.type) {
        case 'fast':
          material.color.setHex(0xFF5722); // Orange for fast enemies
          break;
        case 'smart':
          material.color.setHex(0x9C27B0); // Purple for smart enemies
          break;
        default:
          material.color.setHex(0xF44336); // Red for basic enemies
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <boxGeometry args={[0.7, 0.7, 0.7]} />
      <meshLambertMaterial />
    </mesh>
  );
}
