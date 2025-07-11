import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
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
    if (meshRef.current && !cell.isMunched) {
      // Gentle animation for all tiles
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.02;
    }
  });

  if (cell.isEmpty || cell.isMunched) {
    console.log("GridCell: Skipping empty/munched cell", { isEmpty: cell.isEmpty, isMunched: cell.isMunched });
    return null;
  }
  
  console.log("GridCell: Rendering cell", { value: cell.value, isCorrect: cell.isCorrect, position });

  return (
    <group>
      {/* Cell base */}
      <mesh ref={meshRef} position={position} receiveShadow castShadow>
        <boxGeometry args={[1.5, 0.2, 1.5]} />
        <meshLambertMaterial 
          color="#4A90E2"
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Cell value text */}
      <Text
        position={[position[0], position[1] + 0.5, position[2]]}
        fontSize={(() => {
          const len = cell.value.length;
          if (len <= 3) return 0.6;      // "42", "Cat"
          if (len <= 4) return 0.5;      // "Blue", "1234"
          if (len <= 5) return 0.45;     // "Crime", "Drama"
          if (len <= 6) return 0.4;      // "Romans", "Action"
          if (len <= 7) return 0.35;     // "Quickly", "Mystery"
          if (len <= 10) return 0.3;     // "Beautiful"
          return 0.25;                    // Very long words
        })()}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.4}
        textAlign="center"
        overflowWrap="break-word"
      >
        {cell.value}
      </Text>
    </group>
  );
}
