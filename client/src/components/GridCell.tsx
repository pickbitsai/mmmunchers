import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, RoundedBox } from "@react-three/drei";
import { Mesh, Group } from "three";
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
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);

  // Use position to offset the wave phase so tiles bob independently
  const phaseOffset = position[0] * 0.7 + position[2] * 0.5;

  useFrame((state) => {
    if (groupRef.current && !cell.isMunched) {
      const t = state.clock.elapsedTime;
      // Floating on water bobbing - each tile bobs at slightly different phase
      const bob = Math.sin(t * 1.5 + phaseOffset) * 0.06;
      const tilt = Math.sin(t * 1.2 + phaseOffset + 1) * 0.02;
      const roll = Math.cos(t * 1.0 + phaseOffset + 2) * 0.015;

      groupRef.current.position.y = position[1] + bob;
      groupRef.current.rotation.x = tilt;
      groupRef.current.rotation.z = roll;
    }
  });

  if (cell.isMunched) {
    return null;
  }

  // Wood colors for the raft planks
  const plankColor = cell.isEmpty ? "#c4956a" : "#deb887";
  const plankEdgeColor = cell.isEmpty ? "#a0784c" : "#c4956a";

  return (
    <group ref={groupRef} position={position}>
      {/* Main wooden plank surface */}
      <RoundedBox
        ref={meshRef}
        args={[1.5, 0.18, 1.5]}
        radius={0.06}
        smoothness={4}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial
          color={plankColor}
          roughness={0.85}
          metalness={0.0}
        />
      </RoundedBox>

      {/* Plank line details - horizontal grain lines */}
      {[-0.4, 0, 0.4].map((zOff, i) => (
        <mesh key={`grain-${i}`} position={[0, 0.095, zOff]}>
          <boxGeometry args={[1.4, 0.005, 0.02]} />
          <meshStandardMaterial color={plankEdgeColor} roughness={0.9} />
        </mesh>
      ))}

      {/* Side trim - darker wood edge */}
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[1.54, 0.12, 1.54]} />
        <meshStandardMaterial
          color={plankEdgeColor}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>

      {/* Small water ripple ring around the plank */}
      <mesh position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.85, 0.95, 16]} />
        <meshBasicMaterial
          color="#aaddff"
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Cell value text */}
      {!cell.isEmpty && cell.value && (
        <Text
          position={[0, 0.35, 0]}
          fontSize={(() => {
            const words = cell.value.split(' ');
            const longestWord = Math.max(...words.map(w => w.length));
            const charWidth = 0.24;
            const maxFit = Math.floor(1.4 / charWidth);
            if (longestWord > maxFit) {
              return Math.max(1.4 / (longestWord * 0.6), 0.12);
            }
            const charCount = cell.value.length;
            if (charCount <= 6) return 0.4;
            if (charCount <= 10) return 0.32;
            if (charCount <= 15) return 0.25;
            return 0.2;
          })()}
          color="#2c1810"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.4}
          textAlign="center"
          outlineWidth={0.02}
          outlineColor="#ffffff"
        >
          {cell.value}
        </Text>
      )}
    </group>
  );
}
