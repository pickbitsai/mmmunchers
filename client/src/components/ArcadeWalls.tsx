import { useMemo } from "react";

interface ArcadeWallsProps {
  width: number;
  depth: number;
}

interface WallBlock {
  position: [number, number, number];
  size: [number, number, number];
  accent: boolean;
  shrub: boolean;
}

const WALL_COLORS = ["#0c1b36", "#122a4d", "#0a1730"];
const ACCENT_COLORS = ["#1ac8ff", "#9be94c", "#ff2fba"];

// Deterministic pseudo-random in [0, 1) so wall layout is stable across renders.
function noise(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function buildEdgeBlocks(axis: "x" | "z", length: number, fixedOffset: number, seed: number): WallBlock[] {
  const blocks: WallBlock[] = [];
  const segmentCount = Math.max(Math.round(length / 2.4), 5);
  const segmentSize = length / segmentCount;

  for (let i = 0; i < segmentCount; i++) {
    const n = noise(seed * 13.7 + i);
    // Leave gaps so the wall reads as clustered ruins, not a solid fence.
    if (n < 0.22) continue;

    const height = 1.0 + n * 1.7;
    const along = -length / 2 + segmentSize * (i + 0.5) + (noise(seed + i * 3.1) - 0.5) * segmentSize * 0.2;

    const position: [number, number, number] =
      axis === "x" ? [along, height / 2, fixedOffset] : [fixedOffset, height / 2, along];

    const size: [number, number, number] =
      axis === "x" ? [segmentSize * 0.78, height, 1.05] : [1.05, height, segmentSize * 0.78];

    blocks.push({
      position,
      size,
      accent: noise(seed + i * 7.3) > 0.55,
      shrub: noise(seed + i * 5.9) > 0.8,
    });
  }

  return blocks;
}

export default function ArcadeWalls({ width, depth }: ArcadeWallsProps) {
  const blocks = useMemo(() => {
    const halfW = width / 2 + 1.5;
    const halfD = depth / 2 + 1.5;
    return [
      ...buildEdgeBlocks("x", width + 3, -halfD, 1),
      ...buildEdgeBlocks("x", width + 3, halfD, 2),
      ...buildEdgeBlocks("z", depth + 3, -halfW, 3),
      ...buildEdgeBlocks("z", depth + 3, halfW, 4),
    ];
  }, [width, depth]);

  return (
    <group position={[0, -0.32, 0]}>
      {blocks.map((block, i) => (
        <group key={i} position={block.position}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={block.size} />
            <meshStandardMaterial
              color={WALL_COLORS[i % WALL_COLORS.length]}
              emissive={ACCENT_COLORS[i % ACCENT_COLORS.length]}
              emissiveIntensity={0.18}
              metalness={0.35}
              roughness={0.7}
            />
          </mesh>

          {block.accent && (
            <mesh position={[0, block.size[1] * 0.32, 0]}>
              <boxGeometry args={[block.size[0] * 0.32, 0.06, block.size[2] * 0.32]} />
              <meshBasicMaterial color={ACCENT_COLORS[(i + 1) % ACCENT_COLORS.length]} toneMapped={false} />
            </mesh>
          )}

          {block.shrub && (
            <group position={[0, block.size[1] / 2 + 0.14, 0]}>
              {[0, 1, 2].map((j) => (
                <mesh
                  key={j}
                  position={[(noise(i + j * 2.2) - 0.5) * 0.5, noise(i * 3 + j) * 0.18, (noise(i + j * 4.4) - 0.5) * 0.5]}
                >
                  <boxGeometry args={[0.22, 0.22, 0.22]} />
                  <meshStandardMaterial
                    color="#173d1f"
                    emissive="#59a83a"
                    emissiveIntensity={0.35}
                    roughness={0.6}
                  />
                </mesh>
              ))}
            </group>
          )}
        </group>
      ))}
    </group>
  );
}
