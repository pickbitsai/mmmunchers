interface ArcadeFloorProps {
  width: number;
  depth: number;
  position?: [number, number, number];
}

export default function ArcadeFloor({
  width,
  depth,
  position = [0, -0.24, 0],
}: ArcadeFloorProps) {
  const gridSize = Math.max(width, depth) + 4;
  const gridDivisions = Math.max(Math.round(gridSize / 1.5), 12);

  return (
    <group position={position}>
      <mesh receiveShadow>
        <boxGeometry args={[width + 2.2, 0.28, depth + 2.2]} />
        <meshStandardMaterial
          color="#030713"
          emissive="#071a31"
          emissiveIntensity={0.5}
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>

      <mesh position={[0, 0.17, 0]} receiveShadow>
        <boxGeometry args={[width + 1.35, 0.1, depth + 1.35]} />
        <meshStandardMaterial
          color="#071127"
          emissive="#092544"
          emissiveIntensity={0.45}
          metalness={0.35}
          roughness={0.62}
        />
      </mesh>

      <gridHelper
        args={[gridSize, gridDivisions, "#1ac8ff", "#17405e"]}
        position={[0, 0.23, 0]}
        material-transparent
        material-opacity={0.2}
      />

      <mesh position={[0, 0.25, depth / 2 + 0.72]}>
        <boxGeometry args={[width + 1.45, 0.06, 0.08]} />
        <meshBasicMaterial color="#1ac8ff" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.25, -depth / 2 - 0.72]}>
        <boxGeometry args={[width + 1.45, 0.06, 0.08]} />
        <meshBasicMaterial color="#ff2fba" toneMapped={false} />
      </mesh>
      <mesh position={[width / 2 + 0.72, 0.25, 0]}>
        <boxGeometry args={[0.08, 0.06, depth + 1.45]} />
        <meshBasicMaterial color="#ff2fba" toneMapped={false} />
      </mesh>
      <mesh position={[-width / 2 - 0.72, 0.25, 0]}>
        <boxGeometry args={[0.08, 0.06, depth + 1.45]} />
        <meshBasicMaterial color="#1ac8ff" toneMapped={false} />
      </mesh>
    </group>
  );
}
