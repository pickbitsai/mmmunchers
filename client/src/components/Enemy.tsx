import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Box3, Group, Mesh } from "three";

interface EnemyType {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  type: "basic" | "fast" | "smart";
  lastMoveTime: number;
  isMoving: boolean;
}

interface EnemyProps {
  enemy: EnemyType;
  position: [number, number, number];
}

const TROG_MODEL = "/characters/models/trog.glb";
const ENEMY_SCALE = 0.92;

const TYPE_ACCENTS = {
  basic: "#1ac8ff",
  fast: "#ffb52e",
  smart: "#c28aff",
} as const;

export default function Enemy({ enemy, position }: EnemyProps) {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(TROG_MODEL);
  const accent = TYPE_ACCENTS[enemy.type] ?? TYPE_ACCENTS.basic;

  const model = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    clone.scale.setScalar(ENEMY_SCALE);

    // Ground the model on the tile surface regardless of how the source
    // GLB's own pivot was authored — without this the model's center
    // (not its feet) sits at the group origin and it sinks into the tile.
    const box = new Box3().setFromObject(clone);
    clone.position.y -= box.min.y;

    return clone;
  }, [scene]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (groupRef.current) {
      const speed = enemy.type === "fast" ? 5 : 3;
      groupRef.current.position.y = position[1] + Math.abs(Math.sin(t * speed)) * 0.1;
      groupRef.current.rotation.z = Math.sin(t * speed * 0.6) * 0.06;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <primitive object={model} />

      {/* Type stays readable without recoloring the approved character art. */}
      <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.54, 0.035, 8, 32]} />
        <meshBasicMaterial color={accent} transparent opacity={0.9} toneMapped={false} />
      </mesh>
    </group>
  );
}

useGLTF.preload(TROG_MODEL);
