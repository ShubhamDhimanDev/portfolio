import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MathUtils, type Group } from "three";
import { ParticleField } from "@/components/three/ParticleField";
import { WireframeOrb } from "@/components/three/WireframeOrb";
import { pointerState, scrollState } from "@/lib/scene-tracking";

const PARTICLE_RADIUS = 2.5;
// Natural horizontal spread of the particle sphere at rest (radius * 2 * max jitter factor).
const PARTICLE_SPAN = PARTICLE_RADIUS * 2 * 1.05;
const MAX_PARTICLE_COUNT = 1800;

function SceneContent({ particleCount }: { particleCount: number }) {
  const orbGroupRef = useRef<Group>(null);
  const particleGroupRef = useRef<Group>(null);
  // Stretch the particle field (x-axis only, depth untouched) so it always
  // reaches the screen edges instead of sitting centered with visible side
  // margins. Scaling depth too would pull near-camera particles closer and
  // blow them up via perspective, so only x is scaled; particle count scales
  // alongside it to keep the same visual density instead of thinning out.
  const viewportWidth = useThree((state) => state.viewport.width);
  const spreadX = Math.max(1, (viewportWidth * 1.05) / PARTICLE_SPAN);
  const scaledParticleCount = Math.min(MAX_PARTICLE_COUNT, Math.round(particleCount * spreadX));

  useFrame((_, delta) => {
    const targetX = pointerState.y * 0.22;
    const targetY = pointerState.x * 0.32 + scrollState.progress * Math.PI * 1.4;
    const targetPosY = -scrollState.progress * 1.6;

    // Orb and particles share the same rotation/position but the particle
    // field's x-stretch is applied outside (above) this rotation - stretching
    // a sphere thins point density near its stretch-axis poles, and if that
    // stretch rotated along with the sphere those thin poles would sweep
    // across the screen as blank-looking patches. Keeping the stretch outside
    // the rotated group pins the thinning to the fixed screen edges instead.
    for (const group of [orbGroupRef.current, particleGroupRef.current]) {
      if (!group) continue;
      group.rotation.x = MathUtils.lerp(group.rotation.x, targetX, delta * 2);
      group.rotation.y = MathUtils.lerp(group.rotation.y, targetY, delta * 1.6);
      group.position.y = MathUtils.lerp(group.position.y, targetPosY, delta * 2);
    }
  });

  return (
    <>
      <group ref={orbGroupRef}>
        <WireframeOrb radius={1.4} />
      </group>
      <group scale={[spreadX, 1, 1]}>
        <group ref={particleGroupRef}>
          <ParticleField count={scaledParticleCount} radius={PARTICLE_RADIUS} />
        </group>
      </group>
    </>
  );
}

export function BackgroundScene() {
  const particleCount = useMemo(
    () => (typeof window !== "undefined" && window.innerWidth < 768 ? 420 : 850),
    [],
  );

  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 5.4], fov: 42 }}
    >
      <SceneContent particleCount={particleCount} />
    </Canvas>
  );
}
