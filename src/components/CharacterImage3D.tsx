import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import { DoubleSide, TextureLoader, type Group } from "three";
import type { Job } from "@/lib/jobs";

function Sprite({
  imageUrl,
  damage,
  failed,
}: {
  imageUrl: string;
  damage: number;
  failed: boolean;
}) {
  const texture = useLoader(TextureLoader, imageUrl);
  const ref = useRef<Group>(null);
  const shake = useRef(0);
  const lastDamage = useRef(damage);

  useMemo(() => {
    texture.anisotropy = 8;
  }, [texture]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;

    // trigger a shake burst when damage increases
    if (damage > lastDamage.current) {
      shake.current = 0.55;
      lastDamage.current = damage;
    } else if (damage < lastDamage.current) {
      lastDamage.current = damage;
    }
    shake.current = Math.max(0, shake.current - delta * 2.5);

    const shakeOffset = Math.sin(t * 38) * shake.current * 0.12;
    ref.current.rotation.z = shakeOffset * 0.5;
    ref.current.position.x = shakeOffset * 0.6;
    ref.current.position.y = Math.sin(t * 1.5) * 0.05 + (failed ? -0.15 : 0);
    const targetScale = failed ? 0.9 : 1;
    ref.current.scale.lerp(
      ref.current.scale.clone().set(targetScale, targetScale, targetScale),
      0.15,
    );
  });

  // dim + desaturate as wrong picks accumulate
  const opacity = failed ? 0.55 : Math.max(0.7, 1 - damage * 0.08);

  return (
    <group ref={ref} position={[0, 0, 0]}>
      <mesh castShadow>
        <planeGeometry args={[3.2, 3.2]} />
        <meshBasicMaterial
          map={texture}
          transparent
          alphaTest={0.05}
          opacity={opacity}
          color={failed ? "#888" : "#fff"}
          toneMapped={false}
          side={DoubleSide}
        />
      </mesh>
    </group>
  );
}

export function CharacterImage3D({
  job,
  height = "100%",
  damage = 0,
  failed = false,
}: {
  job: Job;
  height?: number | string;
  damage?: number;
  failed?: boolean;
}) {
  const cssHeight = typeof height === "number" ? `${height}px` : height;
  if (!job.imageUrl) return null;
  return (
    <div style={{ height: cssHeight, width: "100%" }}>
      <Canvas
        shadows
        orthographic
        camera={{ position: [0, 0.3, 5], zoom: 130 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.85} />
          <directionalLight position={[3, 4, 3]} intensity={0.6} />
          <Sprite imageUrl={job.imageUrl} damage={damage} failed={failed} />
          <ContactShadows position={[0, -1.55, 0]} opacity={0.35} scale={5} blur={2.6} far={1.4} />
          <Environment preset="apartment" />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            target={[0, 0, 0]}
            minPolarAngle={Math.PI / 2.6}
            maxPolarAngle={Math.PI / 1.8}
            minAzimuthAngle={-Math.PI / 4}
            maxAzimuthAngle={Math.PI / 4}
            enableDamping
            dampingFactor={0.12}
            rotateSpeed={0.7}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
