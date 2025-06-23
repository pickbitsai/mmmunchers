import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import * as THREE from "three";

interface PlayerProps {
  position: [number, number, number];
}

export default function Player({ position }: PlayerProps) {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Add a slight bobbing animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 4) * 0.1;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <meshLambertMaterial color="#4CAF50" />
    </mesh>
  );
}
