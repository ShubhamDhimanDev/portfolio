import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Points } from "three";
import { createSeededRandom } from "@/lib/utils";

interface ParticleFieldProps {
  count?: number;
  radius?: number;
}

export function ParticleField({ count = 800, radius = 2.6 }: ParticleFieldProps) {
  const pointsRef = useRef<Points>(null);

  const positions = useMemo(() => {
    const random = createSeededRandom(1337);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      const r = radius * (0.85 + random() * 0.2);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count, radius]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.045;
    pointsRef.current.rotation.x += delta * 0.012;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.026}
        color="#9c94ff"
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
