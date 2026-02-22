import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Beach environment decorations: sky dome, sun, distant clouds, and palm trees.
 */
export default function BeachEnvironment() {
  return (
    <group>
      <SkyDome />
      <Sun />
      <Clouds />
      <PalmTree position={[-14, -0.3, -10]} scale={1.0} />
      <PalmTree position={[16, -0.3, -8]} scale={0.85} rotation={0.3} />
      <PalmTree position={[-12, -0.3, 12]} scale={0.7} rotation={-0.5} />
      <SandIsland position={[-14, -0.4, -10]} />
      <SandIsland position={[16, -0.4, -8]} />
      <SandIsland position={[-12, -0.4, 12]} />
    </group>
  );
}

function SkyDome() {
  return (
    <mesh>
      <sphereGeometry args={[50, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshBasicMaterial
        color="#87CEEB"
        side={THREE.BackSide}
      />
    </mesh>
  );
}

function Sun() {
  const sunRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (sunRef.current) {
      // Subtle pulsing glow
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      sunRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={[20, 18, -20]}>
      <mesh ref={sunRef}>
        <sphereGeometry args={[2, 16, 16]} />
        <meshBasicMaterial color="#FFF8DC" />
      </mesh>
      {/* Sun glow */}
      <mesh>
        <sphereGeometry args={[3.5, 16, 16]} />
        <meshBasicMaterial color="#FFFACD" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

function Clouds() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Slow drift
      groupRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.05) * 2;
    }
  });

  return (
    <group ref={groupRef}>
      <Cloud position={[-8, 14, -15]} scale={1.2} />
      <Cloud position={[10, 16, -18]} scale={0.8} />
      <Cloud position={[0, 13, -20]} scale={1.0} />
      <Cloud position={[-15, 15, -12]} scale={0.6} />
    </group>
  );
}

function Cloud({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.5, 8, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
      </mesh>
      <mesh position={[1.2, 0.2, 0]}>
        <sphereGeometry args={[1.2, 8, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>
      <mesh position={[-1.0, 0.1, 0.3]}>
        <sphereGeometry args={[1.0, 8, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>
      <mesh position={[0.3, 0.5, 0]}>
        <sphereGeometry args={[1.0, 8, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.75} />
      </mesh>
    </group>
  );
}

function PalmTree({ position, scale = 1, rotation = 0 }: { position: [number, number, number]; scale?: number; rotation?: number }) {
  const frondRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (frondRef.current) {
      // Gentle swaying in the breeze
      frondRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.05;
      frondRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.6 + position[2]) * 0.03;
    }
  });

  return (
    <group position={position} scale={scale} rotation={[0, rotation, 0]}>
      {/* Trunk - slightly curved */}
      <mesh position={[0, 2, 0]} rotation={[0, 0, 0.1]}>
        <cylinderGeometry args={[0.15, 0.25, 4, 8]} />
        <meshStandardMaterial color="#8B6914" roughness={0.9} />
      </mesh>
      <mesh position={[0.15, 4, 0]} rotation={[0, 0, 0.15]}>
        <cylinderGeometry args={[0.1, 0.15, 2, 8]} />
        <meshStandardMaterial color="#9B7424" roughness={0.9} />
      </mesh>

      {/* Fronds (leaves) */}
      <group ref={frondRef} position={[0.2, 5, 0]}>
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <mesh
            key={i}
            position={[
              Math.cos((angle * Math.PI) / 180) * 0.8,
              -0.2,
              Math.sin((angle * Math.PI) / 180) * 0.8,
            ]}
            rotation={[
              0.8 + Math.random() * 0.2,
              (angle * Math.PI) / 180,
              0,
            ]}
          >
            <coneGeometry args={[0.15, 2.5, 4]} />
            <meshStandardMaterial color="#228B22" roughness={0.8} side={THREE.DoubleSide} />
          </mesh>
        ))}
        {/* Coconuts */}
        <mesh position={[0.15, -0.3, 0.1]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#8B4513" roughness={0.7} />
        </mesh>
        <mesh position={[-0.1, -0.25, -0.12]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#8B4513" roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

function SandIsland({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[3, 16]} />
      <meshStandardMaterial color="#f4d49c" roughness={1} />
    </mesh>
  );
}
