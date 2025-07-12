import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import * as THREE from "three";

interface PlayerProps {
  position: [number, number, number];
}

export default function Player({ position }: PlayerProps) {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Bobbing animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 4) * 0.05;
      // Slight rotation while moving
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  // Log player position occasionally
  if (Math.random() < 0.01) {
    // Player rendering optimized
  }

  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.3, 8, 16]} />
        <meshLambertMaterial color="#3498db" />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshLambertMaterial color="#fdbcb4" />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[0.08, 0.75, 0.2]} castShadow>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
      <mesh position={[-0.08, 0.75, 0.2]} castShadow>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
      
      {/* Smile */}
      <mesh position={[0, 0.65, 0.22]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.08, 0.02, 8, 16, Math.PI]} />
        <meshLambertMaterial color="#d2691e" />
      </mesh>
      
      {/* Arms */}
      <mesh position={[0.25, 0.3, 0]} rotation={[0, 0, -0.5]} castShadow>
        <capsuleGeometry args={[0.06, 0.2, 8, 16]} />
        <meshLambertMaterial color="#fdbcb4" />
      </mesh>
      <mesh position={[-0.25, 0.3, 0]} rotation={[0, 0, 0.5]} castShadow>
        <capsuleGeometry args={[0.06, 0.2, 8, 16]} />
        <meshLambertMaterial color="#fdbcb4" />
      </mesh>
      
      {/* Legs */}
      <mesh position={[0.1, -0.1, 0]} castShadow>
        <capsuleGeometry args={[0.08, 0.2, 8, 16]} />
        <meshLambertMaterial color="#2c3e50" />
      </mesh>
      <mesh position={[-0.1, -0.1, 0]} castShadow>
        <capsuleGeometry args={[0.08, 0.2, 8, 16]} />
        <meshLambertMaterial color="#2c3e50" />
      </mesh>
      
      {/* Feet */}
      <mesh position={[0.1, -0.35, 0.05]} castShadow>
        <boxGeometry args={[0.15, 0.08, 0.2]} />
        <meshLambertMaterial color="#8b4513" />
      </mesh>
      <mesh position={[-0.1, -0.35, 0.05]} castShadow>
        <boxGeometry args={[0.15, 0.08, 0.2]} />
        <meshLambertMaterial color="#8b4513" />
      </mesh>
    </group>
  );
}