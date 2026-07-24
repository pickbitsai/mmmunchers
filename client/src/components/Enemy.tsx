import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";

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

// 2026 palette - chunky voxel crystal creatures
const PALETTE = {
  basic: { body: '#2f9fe0', light: '#7cd0ff', dark: '#1c5f8c' },
  fast: { body: '#f59e0b', light: '#fcd34d', dark: '#b45309' },
  smart: { body: '#a855f7', light: '#d8b4fe', dark: '#6b21a8' },
} as const;

export default function Enemy({ enemy, position }: EnemyProps) {
  const groupRef = useRef<Group>(null);
  const c = PALETTE[enemy.type] ?? PALETTE.basic;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      // Menacing hop + wobble
      const speed = enemy.type === 'fast' ? 5 : 3;
      groupRef.current.position.y = position[1] + Math.abs(Math.sin(t * speed)) * 0.12;
      groupRef.current.rotation.z = Math.sin(t * speed * 0.6) * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Chunky faceted body */}
      <mesh position={[0, 0.4, 0]} castShadow rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.55, 0.55, 0.55]} />
        <meshStandardMaterial color={c.body} roughness={0.35} metalness={0.25} flatShading />
      </mesh>

      {/* Lighter chest facet */}
      <mesh position={[0, 0.36, 0.26]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.28, 0.28, 0.12]} />
        <meshStandardMaterial color={c.light} roughness={0.3} metalness={0.3} flatShading transparent opacity={0.85} />
      </mesh>

      {/* Crystal spikes on top */}
      {[
        { p: [0, 0.78, 0] as [number, number, number], s: 0.16, r: 0 },
        { p: [0.18, 0.7, 0.05] as [number, number, number], s: 0.12, r: 0.3 },
        { p: [-0.18, 0.7, -0.05] as [number, number, number], s: 0.12, r: -0.3 },
      ].map((spk, i) => (
        <mesh key={i} position={spk.p} rotation={[spk.r, 0, spk.r]} castShadow>
          <coneGeometry args={[spk.s * 0.7, spk.s * 2.2, 4]} />
          <meshStandardMaterial color={c.light} roughness={0.25} metalness={0.35} flatShading emissive={c.body} emissiveIntensity={0.15} />
        </mesh>
      ))}

      {/* Glowing angry eyes */}
      {[-1, 1].map((s) => (
        <group key={s} position={[0.13 * s, 0.44, 0.29]}>
          <mesh>
            <boxGeometry args={[0.12, 0.1, 0.06]} />
            <meshStandardMaterial color="#ffe14d" emissive="#ffd000" emissiveIntensity={1.4} roughness={0.2} toneMapped={false} />
          </mesh>
          {/* Pupil slit */}
          <mesh position={[0, 0, 0.04]}>
            <boxGeometry args={[0.03, 0.07, 0.02]} />
            <meshStandardMaterial color="#1a1400" />
          </mesh>
        </group>
      ))}

      {/* Angry brows */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0.13 * s, 0.55, 0.3]} rotation={[0, 0, 0.5 * s]}>
          <boxGeometry args={[0.16, 0.045, 0.05]} />
          <meshStandardMaterial color={c.dark} roughness={0.5} flatShading />
        </mesh>
      ))}

      {/* Jagged grin */}
      <mesh position={[0, 0.3, 0.3]}>
        <boxGeometry args={[0.24, 0.06, 0.04]} />
        <meshStandardMaterial color="#14141f" roughness={0.6} />
      </mesh>
      {[-0.07, 0, 0.07].map((x, i) => (
        <mesh key={i} position={[x, 0.32, 0.31]}>
          <coneGeometry args={[0.028, 0.06, 4]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} flatShading />
        </mesh>
      ))}

      {/* Stubby legs */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0.16 * s, 0.06, 0.05]} castShadow>
          <boxGeometry args={[0.14, 0.14, 0.14]} />
          <meshStandardMaterial color={c.dark} roughness={0.4} metalness={0.2} flatShading />
        </mesh>
      ))}

      {/* Arm nubs */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0.32 * s, 0.4, 0]} rotation={[0, 0, 0.4 * s]} castShadow>
          <boxGeometry args={[0.12, 0.12, 0.12]} />
          <meshStandardMaterial color={c.body} roughness={0.4} metalness={0.2} flatShading />
        </mesh>
      ))}
    </group>
  );
}
