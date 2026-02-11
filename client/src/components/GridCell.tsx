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

  if (cell.isMunched) {
    return null;
  }
  
  // Remove excessive logging

  return (
    <group>
      {/* Cell base */}
      <mesh ref={meshRef} position={position} receiveShadow castShadow>
        <boxGeometry args={[1.5, 0.2, 1.5]} />
        <meshLambertMaterial 
          color={cell.isEmpty ? "#2c3e50" : "#3498db"}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Cell value text */}
      {!cell.isEmpty && cell.value && (
        <Text
          position={[position[0], position[1] + 0.5, position[2]]}
          fontSize={(() => {
            const words = cell.value.split(' ');
            const longestWord = Math.max(...words.map(w => w.length));
            // Scale so the longest word fits within maxWidth (1.4 units)
            // At fontSize 0.4, each char is ~0.24 units wide
            const charWidth = 0.24;
            const maxFit = Math.floor(1.4 / charWidth); // ~5.8 chars at 0.4
            if (longestWord > maxFit) {
              return Math.max(1.4 / (longestWord * 0.6), 0.12);
            }
            const charCount = cell.value.length;
            if (charCount <= 6) return 0.4;
            if (charCount <= 10) return 0.32;
            if (charCount <= 15) return 0.25;
            return 0.2;
          })()}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.4}
          textAlign="center"
        >
          {cell.value}
        </Text>
      )}
    </group>
  );
}
