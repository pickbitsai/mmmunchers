import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Text } from "@react-three/drei";
import { Group } from "three";

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

// Height of the tile's top face above the cell's own position[1] —
// characters need to stand at this height, not at the group origin.
export const TILE_SURFACE_Y = 0.06;

const TILE_PALETTE = [
  { surface: "#116ca9", top: "#168dd1", accent: "#1ac8ff" },
  { surface: "#62359a", top: "#814fc2", accent: "#c28aff" },
  { surface: "#bd6815", top: "#dc8b20", accent: "#ffb52e" },
  { surface: "#3f842d", top: "#59a83a", accent: "#9be94c" },
] as const;

function getTilePalette(position: [number, number, number]) {
  const column = Math.round(position[0] / 2);
  const row = Math.round(position[2] / 2);
  const index = Math.abs(column * 3 + row * 5) % TILE_PALETTE.length;
  return TILE_PALETTE[index];
}

function getFontSize(value: string) {
  const words = value.split(" ");
  const longestWord = Math.max(...words.map((word) => word.length));
  const charWidth = 0.24;
  const maxFit = Math.floor(1.25 / charWidth);

  if (longestWord > maxFit) {
    return Math.max(1.25 / (longestWord * 0.6), 0.12);
  }

  if (value.length <= 6) return 0.4;
  if (value.length <= 10) return 0.32;
  if (value.length <= 15) return 0.25;
  return 0.2;
}

const CRUMBLE_DURATION = 0.6;
const CRUMBLE_PIECES = 9;

function MunchCrumble({ color }: { color: string }) {
  const groupRef = useRef<Group>(null);
  const startRef = useRef<number | null>(null);

  const pieces = useMemo(
    () =>
      Array.from({ length: CRUMBLE_PIECES }, (_, i) => {
        const angle = (i / CRUMBLE_PIECES) * Math.PI * 2 + (i % 3) * 0.4;
        const speed = 0.7 + ((i * 37) % 10) / 10;
        return {
          dir: [Math.cos(angle) * speed, 1.4 + ((i * 53) % 10) / 10, Math.sin(angle) * speed] as [
            number,
            number,
            number,
          ],
          spin: [1 + (i % 4), 2 + (i % 3), 1 + ((i * 2) % 4)] as [number, number, number],
          size: 0.09 + ((i * 17) % 10) / 100,
          start: [((i % 3) - 1) * 0.35, 0.02, (((i * 5) % 3) - 1) * 0.35] as [number, number, number],
        };
      }),
    [],
  );

  useFrame((state) => {
    if (!groupRef.current) return;
    if (startRef.current === null) startRef.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - startRef.current;
    const life = Math.min(t / CRUMBLE_DURATION, 1);

    groupRef.current.children.forEach((child, i) => {
      const p = pieces[i];
      child.position.set(
        p.start[0] + p.dir[0] * t,
        p.start[1] + p.dir[1] * t - 2.6 * t * t,
        p.start[2] + p.dir[2] * t,
      );
      child.rotation.x += p.spin[0] * 0.06;
      child.rotation.y += p.spin[1] * 0.06;
      const scale = Math.max(0, 1 - life);
      child.scale.setScalar(scale);
    });
  });

  return (
    <group ref={groupRef}>
      {pieces.map((p, i) => (
        <mesh key={i} position={p.start}>
          <boxGeometry args={[p.size, p.size, p.size]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

export default function GridCell({ cell, position }: GridCellProps) {
  const groupRef = useRef<Group>(null);
  const padRef = useRef<Group>(null);
  const palette = getTilePalette(position);
  const inactive = cell.isEmpty || cell.isMunched;
  const phaseOffset = position[0] * 0.7 + position[2] * 0.5;

  const wasMunchedRef = useRef(cell.isMunched);
  const [crumbling, setCrumbling] = useState(false);

  useEffect(() => {
    if (cell.isMunched && !wasMunchedRef.current) {
      setCrumbling(true);
      const timeout = window.setTimeout(() => setCrumbling(false), CRUMBLE_DURATION * 1000);
      wasMunchedRef.current = true;
      return () => window.clearTimeout(timeout);
    }
    wasMunchedRef.current = cell.isMunched;
  }, [cell.isMunched]);

  const crumbleStartRef = useRef<number | null>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    const pulse = Math.sin(state.clock.elapsedTime * 1.8 + phaseOffset);
    groupRef.current.position.y = position[1] + (inactive ? 0 : pulse * 0.025);
    const scale = inactive ? 1 : 1 + pulse * 0.006;
    groupRef.current.scale.set(scale, 1, scale);

    if (padRef.current) {
      if (crumbling) {
        if (crumbleStartRef.current === null) crumbleStartRef.current = state.clock.elapsedTime;
        const t = state.clock.elapsedTime - crumbleStartRef.current;
        const collapse = Math.max(0, 1 - t / (CRUMBLE_DURATION * 0.7));
        padRef.current.scale.set(collapse, collapse, collapse);
      } else {
        crumbleStartRef.current = null;
        padRef.current.scale.set(1, 1, 1);
      }
    }
  });

  const surface = inactive ? "#050b17" : palette.surface;
  const top = inactive ? "#091326" : palette.top;
  const accent = inactive ? "#173d59" : palette.accent;

  return (
    <group ref={groupRef} position={position}>
      <group ref={padRef}>
        {/* Flat glowing floor panel */}
        <RoundedBox
          args={[1.62, 0.07, 1.62]}
          radius={0.15}
          smoothness={4}
          position={[0, 0, 0]}
          receiveShadow
          castShadow
        >
          <meshStandardMaterial
            color={surface}
            emissive={accent}
            emissiveIntensity={inactive ? 0.08 : 0.4}
            metalness={0.4}
            roughness={0.32}
          />
        </RoundedBox>

        {/* Thin glow cap */}
        <RoundedBox
          args={[1.36, 0.025, 1.36]}
          radius={0.12}
          smoothness={4}
          position={[0, 0.0475, 0]}
        >
          <meshStandardMaterial
            color={top}
            emissive={accent}
            emissiveIntensity={inactive ? 0.06 : 0.32}
            metalness={0.2}
            roughness={0.22}
          />
        </RoundedBox>

        {!inactive && cell.value && (
          <Text
            position={[0, 0.09, 0.06]}
            fontSize={getFontSize(cell.value)}
            color="#ffffff"
            anchorX="center"
            anchorY="bottom"
            maxWidth={1.25}
            textAlign="center"
            outlineWidth={0.035}
            outlineColor="#07101f"
          >
            {cell.value}
          </Text>
        )}
      </group>

      {crumbling && <MunchCrumble color={palette.accent} />}
    </group>
  );
}
