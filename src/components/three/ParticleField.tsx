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
    // Fibonacci sphere lattice: unlike random theta/phi sampling, this spreads
    // points with no clumps or gaps, so density stays even from every angle as
    // the sphere rotates/stretches instead of exposing random-noise voids.
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / Math.max(1, count - 1)) * 2;
      const ringRadius = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * i;
      const r = radius * (0.85 + random() * 0.2);
      arr[i * 3] = r * ringRadius * Math.cos(theta);
      arr[i * 3 + 1] = r * y;
      arr[i * 3 + 2] = r * ringRadius * Math.sin(theta);
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
