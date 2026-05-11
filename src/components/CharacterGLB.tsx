import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, useGLTF } from "@react-three/drei";
import { Suspense, useRef } from "react";
import type { Group } from "three";
import type { Job } from "@/lib/jobs";

function Avatar({
  url,
  accentColor,
  damage,
  failed,
}: {
  url: string;
  accentColor: string;
  damage: number;
  failed: boolean;
}) {
  const { scene } = useGLTF(url);
  const group = useRef<Group>(null);
  const shake = useRef(0);
  const lastDamage = useRef(damage);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;

    if (damage > lastDamage.current) {
      shake.current = 0.55;
      lastDamage.current = damage;
    } else if (damage < lastDamage.current) {
      lastDamage.current = damage;
    }
    shake.current = Math.max(0, shake.current - delta * 2.5);

    const shakeOffset = Math.sin(t * 38) * shake.current * 0.12;
    group.current.rotation.y = Math.sin(t * 0.5) * 0.25 + shakeOffset;
    group.current.position.x = shakeOffset * 0.6;
    group.current.position.y = -0.95 + Math.sin(t * 1.5) * 0.02 + (failed ? -0.1 : 0);
  });

  return (
    <group ref={group} position={[0, -0.95, 0]}>
      <primitive object={scene} />
      <pointLight position={[0, 1.5, 1.2]} intensity={0.4} color={accentColor} />
    </group>
  );
}

export function CharacterGLB({
  job,
  height = 360,
  damage = 0,
  failed = false,
}: {
  job: Job;
  height?: number | string;
  damage?: number;
  failed?: boolean;
}) {
  if (!job.modelUrl) return null;

  const cssHeight = typeof height === "number" ? `${height}px` : height;

  return (
    <div style={{ height: cssHeight, width: "100%" }}>
      <Canvas shadows camera={{ position: [0, 1.3, 2.2], fov: 32 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.7} />
          <directionalLight
            position={[3, 5, 3]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-3, 2, -2]} intensity={0.4} color={job.accentColor} />
          <Avatar
            url={job.modelUrl}
            accentColor={job.accentColor}
            damage={damage}
            failed={failed}
          />
          <ContactShadows position={[0, -0.95, 0]} opacity={0.5} scale={5} blur={2.5} />
          <Environment preset="city" />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            target={[0, 0.9, 0]}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.9}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
