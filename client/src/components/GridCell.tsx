import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import * as THREE from "three";

interface GridCellType {
  value: string;
  isCorrect: boolean;
  isMunched: boolean;
  isEmpty: boolean;
}

interface GridCellProps {
  cell: GridCellType;
  position: [number, number, number];
}

export default function GridCell({ cell, position }: GridCellProps) {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && cell.isCorrect && !cell.isMunched) {
      // Highlight correct answers with a gentle glow effect
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  if (cell.isEmpty || cell.isMunched) return null;

  return (
    <group>
      {/* Cell base */}
      <mesh ref={meshRef} position={position} receiveShadow>
        <boxGeometry args={[1.5, 0.2, 1.5]} />
        <meshLambertMaterial 
          color={cell.isCorrect ? "#2196F3" : "#90A4AE"}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Cell value - temporarily disabled to fix R3F error */}
      {/* TODO: Add text rendering back once R3F namespace issue is resolved */}
    </group>
  );
}
