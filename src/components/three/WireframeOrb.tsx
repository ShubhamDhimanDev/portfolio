import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

interface WireframeOrbProps {
  radius?: number;
}

export function WireframeOrb({ radius = 1.4 }: WireframeOrbProps) {
  const meshRef = useRef<Mesh>(null);
  const innerRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y -= delta * 0.075;
      meshRef.current.rotation.x += delta * 0.02;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y += delta * 0.04;
      innerRef.current.rotation.z += delta * 0.015;
    }
  });

  return (
    <>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[radius, 1]} />
        <meshBasicMaterial color="#6e6bf4" wireframe transparent opacity={0.4} />
      </mesh>
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[radius * 0.62, 0]} />
        <meshBasicMaterial color="#3ddc97" wireframe transparent opacity={0.18} />
      </mesh>
    </>
  );
}
