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
          color={cell.isEmpty ? "#2c3e50" : cell.isCorrect ? "#4CAF50" : "#F44336"}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* QA Indicator - small sphere above cell */}
      {!cell.isEmpty && (
        <mesh position={[position[0] + 0.5, position[1] + 0.4, position[2] + 0.5]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshLambertMaterial 
            color={cell.isCorrect ? "#2E7D32" : "#C62828"}
            transparent
            opacity={0.9}
          />
        </mesh>
      )}
      
      {/* Cell value text */}
      {!cell.isEmpty && cell.value && (
        <Text
          position={[position[0], position[1] + 0.5, position[2]]}
          fontSize={(() => {
            // Dynamic font size based on text length
            const text = cell.value;
            const charCount = text.length;
            if (charCount <= 6) return 0.4; // Full size for short text
            if (charCount <= 10) return 0.35; // Slightly smaller
            if (charCount <= 15) return 0.3; // Smaller for longer text
            return 0.25; // Smallest for very long text
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
      )}
    </group>
  );
}
