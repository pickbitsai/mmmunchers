import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface OceanProps {
  width?: number;
  depth?: number;
  position?: [number, number, number];
}

export default function Ocean({ width = 60, depth = 60, position = [0, -0.5, 0] }: OceanProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.PlaneGeometry>(null);

  // Store original vertex positions for wave animation
  const originalPositions = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, depth, 64, 64);
    return new Float32Array(geo.attributes.position.array);
  }, [width, depth]);

  // Animate waves
  useFrame((state) => {
    if (!geometryRef.current) return;
    const positions = geometryRef.current.attributes.position;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < positions.count; i++) {
      const ox = originalPositions[i * 3];
      const oy = originalPositions[i * 3 + 1];

      // Layered wave effect
      const wave1 = Math.sin(ox * 0.3 + time * 0.8) * 0.15;
      const wave2 = Math.sin(oy * 0.5 + time * 1.2) * 0.1;
      const wave3 = Math.sin((ox + oy) * 0.2 + time * 0.5) * 0.08;

      positions.setZ(i, wave1 + wave2 + wave3);
    }

    positions.needsUpdate = true;
    geometryRef.current.computeVertexNormals();
  });

  return (
    <group>
      {/* Main water surface */}
      <mesh
        ref={meshRef}
        position={position}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry ref={geometryRef} args={[width, depth, 64, 64]} />
        <meshPhongMaterial
          color="#0077be"
          transparent
          opacity={0.85}
          shininess={100}
          specular={new THREE.Color("#88ccff")}
          side={THREE.DoubleSide}
          flatShading={false}
        />
      </mesh>

      {/* Deeper water layer underneath for depth effect */}
      <mesh
        position={[position[0], position[1] - 0.3, position[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial
          color="#004466"
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Distant foam / shore hints at edges */}
      <FoamRing width={width} depth={depth} position={position} />
    </group>
  );
}

function FoamRing({ width, depth, position }: { width: number; depth: number; position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
  });

  return (
    <mesh
      ref={meshRef}
      position={[position[0], position[1] + 0.01, position[2]]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <ringGeometry args={[Math.min(width, depth) * 0.4, Math.min(width, depth) * 0.5, 64]} />
      <meshBasicMaterial
        color="#e0f0ff"
        transparent
        opacity={0.15}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
