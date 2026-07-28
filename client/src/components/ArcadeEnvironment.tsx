import { useMemo } from "react";
import { BufferAttribute, BufferGeometry } from "three";

const SKYLINE = [
  { x: -30, width: 4.5, height: 9, color: "#08162d" },
  { x: -25, width: 3.2, height: 13, color: "#0a1834" },
  { x: -21, width: 4.2, height: 7, color: "#071225" },
  { x: -16, width: 5.2, height: 16, color: "#0b1730" },
  { x: -10.5, width: 3.8, height: 10, color: "#08152c" },
  { x: -6, width: 4.6, height: 18, color: "#091831" },
  { x: -1, width: 4, height: 12, color: "#071328" },
  { x: 4, width: 5.2, height: 15, color: "#0a1731" },
  { x: 10, width: 4.5, height: 8, color: "#071225" },
  { x: 15, width: 4.2, height: 17, color: "#0b1832" },
  { x: 20, width: 5.2, height: 11, color: "#08152b" },
  { x: 26, width: 4.8, height: 14, color: "#09162e" },
  { x: 31, width: 4.2, height: 8, color: "#071225" },
];

export default function ArcadeEnvironment() {
  const starGeometry = useMemo(() => {
    const positions: number[] = [];

    for (let i = 0; i < 90; i++) {
      const x = ((i * 37) % 97) / 97 * 64 - 32;
      const y = ((i * 53) % 89) / 89 * 22 + 2;
      const z = -18 - ((i * 17) % 9);
      positions.push(x, y, z);
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
    return geometry;
  }, []);

  return (
    <group>
      <points geometry={starGeometry}>
        <pointsMaterial
          color="#8ae6ff"
          size={0.08}
          transparent
          opacity={0.7}
          sizeAttenuation
          toneMapped={false}
        />
      </points>

      <group position={[0, -1.5, -24]}>
        {SKYLINE.map((building, index) => (
          <group key={building.x} position={[building.x, building.height / 2, 0]}>
            <mesh>
              <boxGeometry args={[building.width, building.height, 2]} />
              <meshStandardMaterial
                color={building.color}
                emissive={index % 2 === 0 ? "#06172a" : "#15071b"}
                emissiveIntensity={0.45}
                roughness={0.82}
              />
            </mesh>

            {[0.18, 0.43, 0.68].map((heightRatio, windowIndex) => (
              <mesh
                key={heightRatio}
                position={[
                  windowIndex % 2 === 0 ? -building.width * 0.2 : building.width * 0.2,
                  building.height * (heightRatio - 0.5),
                  1.02,
                ]}
              >
                <boxGeometry args={[0.16, 0.35, 0.03]} />
                <meshBasicMaterial
                  color={(index + windowIndex) % 3 === 0 ? "#ff2fba" : "#1ac8ff"}
                  toneMapped={false}
                />
              </mesh>
            ))}
          </group>
        ))}

        <mesh position={[0, 0.2, 1.2]}>
          <boxGeometry args={[70, 0.06, 0.08]} />
          <meshBasicMaterial color="#1ac8ff" toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
