import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";

interface PlayerProps {
  position: [number, number, number];
}

export default function Player({ position }: PlayerProps) {
  const groupRef = useRef<Group>(null);
  const mouthRef = useRef<Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      // Springy bob + subtle squash-and-stretch
      groupRef.current.position.y = position[1] + Math.sin(t * 4) * 0.06;
      groupRef.current.rotation.z = Math.sin(t * 2) * 0.05;
      const squash = 1 + Math.sin(t * 4) * 0.04;
      groupRef.current.scale.set(2 - squash, squash, 2 - squash);
    }
    if (mouthRef.current) {
      // Chomp animation
      const chomp = 0.5 + Math.abs(Math.sin(t * 3)) * 0.5;
      mouthRef.current.scale.y = chomp;
    }
  });

  const bodyGreen = "#7ed321";
  const bodyDark = "#4a7c0f";

  return (
    <group ref={groupRef} position={position}>
      {/* Body - plump green blob */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color={bodyGreen} roughness={0.45} metalness={0.05} />
      </mesh>

      {/* Belly highlight */}
      <mesh position={[0, 0.34, 0.28]}>
        <sphereGeometry args={[0.24, 24, 24]} />
        <meshStandardMaterial color="#a5e65a" roughness={0.5} transparent opacity={0.55} />
      </mesh>

      {/* Spots */}
      {[
        [0.26, 0.6, 0.18],
        [-0.3, 0.4, 0.1],
        [0.05, 0.72, -0.28],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color={bodyDark} roughness={0.6} />
        </mesh>
      ))}

      {/* Antennae */}
      {[-1, 1].map((s) => (
        <group key={s} position={[0.12 * s, 0.78, 0]} rotation={[0, 0, -0.4 * s]}>
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.035, 0.22, 8]} />
            <meshStandardMaterial color={bodyDark} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.24, 0]} castShadow>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color={bodyGreen} emissive="#bef264" emissiveIntensity={0.4} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Eyes - big and googly */}
      {[-1, 1].map((s) => (
        <group key={s} position={[0.15 * s, 0.55, 0.3]}>
          <mesh castShadow>
            <sphereGeometry args={[0.15, 24, 24]} />
            <meshStandardMaterial color="#ffffff" roughness={0.25} />
          </mesh>
          <mesh position={[0.02 * s, -0.01, 0.11]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color="#1a1a2e" roughness={0.2} />
          </mesh>
          {/* Shine */}
          <mesh position={[0.05 * s, 0.05, 0.15]}>
            <sphereGeometry args={[0.025, 10, 10]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
          </mesh>
        </group>
      ))}

      {/* Cheeks */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0.3 * s, 0.42, 0.24]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#ff8fb0" roughness={0.6} transparent opacity={0.7} />
        </mesh>
      ))}

      {/* Mouth - happy open chomper */}
      <group ref={mouthRef} position={[0, 0.32, 0.36]}>
        <mesh>
          <sphereGeometry args={[0.13, 20, 20, 0, Math.PI * 2, Math.PI * 0.35, Math.PI * 0.65]} />
          <meshStandardMaterial color="#7a1030" roughness={0.5} />
        </mesh>
        {/* Teeth */}
        {[-0.05, 0.05].map((x, i) => (
          <mesh key={i} position={[x, 0.04, 0.05]}>
            <boxGeometry args={[0.05, 0.05, 0.03]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* Little feet */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0.16 * s, 0.05, 0.08]} castShadow>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial color={bodyDark} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}
