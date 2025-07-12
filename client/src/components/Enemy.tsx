import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import * as THREE from "three";

interface EnemyType {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  type: 'basic' | 'fast' | 'smart';
  lastMoveTime: number;
  isMoving: boolean;
}

interface EnemyProps {
  enemy: EnemyType;
  position: [number, number, number];
}

export default function Enemy({ enemy, position }: EnemyProps) {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Menacing wobble animation
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.1;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  // Enemy rendering optimized

  // Different colors for enemy types
  const bodyColor = enemy.type === 'fast' ? "#FF6B35" : enemy.type === 'smart' ? "#9C27B0" : "#8B0000";
  const skinColor = enemy.type === 'fast' ? "#FF8C69" : enemy.type === 'smart' ? "#BA68C8" : "#CD5C5C";

  return (
    <group ref={groupRef} position={position}>
      {/* Troll Body - wider at bottom */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <coneGeometry args={[0.35, 0.5, 8]} />
        <meshLambertMaterial color={bodyColor} />
      </mesh>
      
      {/* Troll Head - larger and menacing */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshLambertMaterial color={skinColor} />
      </mesh>
      
      {/* Horns */}
      <mesh position={[0.15, 0.85, 0]} rotation={[0, 0, -0.3]} castShadow>
        <coneGeometry args={[0.05, 0.15, 8]} />
        <meshLambertMaterial color="#FFD700" />
      </mesh>
      <mesh position={[-0.15, 0.85, 0]} rotation={[0, 0, 0.3]} castShadow>
        <coneGeometry args={[0.05, 0.15, 8]} />
        <meshLambertMaterial color="#FFD700" />
      </mesh>
      
      {/* Evil Eyes */}
      <mesh position={[0.1, 0.7, 0.25]} castShadow>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshLambertMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[-0.1, 0.7, 0.25]} castShadow>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshLambertMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={0.3} />
      </mesh>
      
      {/* Angry Eyebrows */}
      <mesh position={[0.1, 0.78, 0.28]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.12, 0.02, 0.02]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
      <mesh position={[-0.1, 0.78, 0.28]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.12, 0.02, 0.02]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
      
      {/* Nose */}
      <mesh position={[0, 0.65, 0.28]} castShadow>
        <coneGeometry args={[0.08, 0.12, 8]} />
        <meshLambertMaterial color={skinColor} />
      </mesh>
      
      {/* Mouth with teeth */}
      <mesh position={[0, 0.55, 0.25]}>
        <boxGeometry args={[0.2, 0.05, 0.05]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
      {/* Teeth */}
      <mesh position={[0.06, 0.57, 0.26]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.02, 0.04, 4]} />
        <meshLambertMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[-0.06, 0.57, 0.26]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.02, 0.04, 4]} />
        <meshLambertMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Arms - thick and menacing */}
      <mesh position={[0.3, 0.25, 0]} rotation={[0, 0, -0.7]} castShadow>
        <capsuleGeometry args={[0.1, 0.25, 8, 16]} />
        <meshLambertMaterial color={skinColor} />
      </mesh>
      <mesh position={[-0.3, 0.25, 0]} rotation={[0, 0, 0.7]} castShadow>
        <capsuleGeometry args={[0.1, 0.25, 8, 16]} />
        <meshLambertMaterial color={skinColor} />
      </mesh>
      
      {/* Claws */}
      <mesh position={[0.35, 0.1, 0]} castShadow>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshLambertMaterial color={skinColor} />
      </mesh>
      <mesh position={[-0.35, 0.1, 0]} castShadow>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshLambertMaterial color={skinColor} />
      </mesh>
      
      {/* Legs - short and stout */}
      <mesh position={[0.15, -0.05, 0]} castShadow>
        <capsuleGeometry args={[0.12, 0.15, 8, 16]} />
        <meshLambertMaterial color={bodyColor} />
      </mesh>
      <mesh position={[-0.15, -0.05, 0]} castShadow>
        <capsuleGeometry args={[0.12, 0.15, 8, 16]} />
        <meshLambertMaterial color={bodyColor} />
      </mesh>
      
      {/* Big Feet */}
      <mesh position={[0.15, -0.3, 0.1]} castShadow>
        <boxGeometry args={[0.2, 0.1, 0.25]} />
        <meshLambertMaterial color="#654321" />
      </mesh>
      <mesh position={[-0.15, -0.3, 0.1]} castShadow>
        <boxGeometry args={[0.2, 0.1, 0.25]} />
        <meshLambertMaterial color="#654321" />
      </mesh>
    </group>
  );
}