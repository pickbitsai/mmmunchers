import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Box3, Group, Mesh } from "three";

interface PlayerProps {
  position: [number, number, number];
}

const GLIMMER_MODEL = "/characters/models/glimmer.glb";
const PLAYER_SCALE = 1.05;

export default function Player({ position }: PlayerProps) {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(GLIMMER_MODEL);

  const model = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    clone.scale.setScalar(PLAYER_SCALE);

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
      // Keep Glimmer's friendly hop while preserving the Meshy-authored shape.
      groupRef.current.position.y = position[1] + Math.sin(t * 4) * 0.06;
      groupRef.current.rotation.z = Math.sin(t * 2) * 0.05;
      const squash = 1 + Math.sin(t * 4) * 0.04;
      groupRef.current.scale.set(2 - squash, squash, 2 - squash);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <primitive object={model} />
    </group>
  );
}

useGLTF.preload(GLIMMER_MODEL);
