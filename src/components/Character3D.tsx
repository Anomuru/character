import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment } from "@react-three/drei";
import { useRef, Suspense } from "react";
import type { Group } from "three";
import type { Job } from "@/lib/jobs";

function Hat({ type, color }: { type: Job["hatType"]; color: string }) {
  if (type === "none") return null;
  if (type === "chef") {
    return (
      <group position={[0, 1.95, 0]}>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.15, 24]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <sphereGeometry args={[0.5, 24, 24]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
    );
  }
  if (type === "hardhat") {
    return (
      <group position={[0, 1.95, 0]}>
        <mesh>
          <sphereGeometry args={[0.5, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, -0.02, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 0.05, 24]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
    );
  }
  // cap
  return (
    <group position={[0, 1.95, 0]}>
      <mesh>
        <sphereGeometry args={[0.45, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.35, -0.05, 0]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.35, 0.05, 0.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function CharacterModel({ job }: { job: Job }) {
  const group = useRef<Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = Math.sin(t * 0.5) * 0.3;
    group.current.position.y = Math.sin(t * 1.5) * 0.05;
  });

  return (
    <group ref={group}>
      {/* Head */}
      <mesh position={[0, 1.55, 0]} castShadow>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color="#f4c9a0" />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.13, 1.6, 0.35]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.13, 1.6, 0.35]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Smile */}
      <mesh position={[0, 1.45, 0.36]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.08, 0.015, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#7a3b2e" />
      </mesh>

      <Hat type={job.hatType} color={job.hatColor} />

      {/* Torso */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[0.9, 1.1, 0.5]} />
        <meshStandardMaterial color={job.bodyColor} />
      </mesh>
      {/* Accent stripe */}
      <mesh position={[0, 0.75, 0.26]}>
        <boxGeometry args={[0.3, 1.1, 0.01]} />
        <meshStandardMaterial color={job.accentColor} />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.6, 0.85, 0]} rotation={[0, 0, 0.2]} castShadow>
        <capsuleGeometry args={[0.13, 0.7, 8, 16]} />
        <meshStandardMaterial color={job.bodyColor} />
      </mesh>
      <mesh position={[0.6, 0.85, 0]} rotation={[0, 0, -0.2]} castShadow>
        <capsuleGeometry args={[0.13, 0.7, 8, 16]} />
        <meshStandardMaterial color={job.bodyColor} />
      </mesh>

      {/* Hands */}
      <mesh position={[-0.72, 0.4, 0]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color="#f4c9a0" />
      </mesh>
      <mesh position={[0.72, 0.4, 0]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color="#f4c9a0" />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.22, -0.15, 0]} castShadow>
        <capsuleGeometry args={[0.16, 0.7, 8, 16]} />
        <meshStandardMaterial color={job.accentColor} />
      </mesh>
      <mesh position={[0.22, -0.15, 0]} castShadow>
        <capsuleGeometry args={[0.16, 0.7, 8, 16]} />
        <meshStandardMaterial color={job.accentColor} />
      </mesh>

      {/* Shoes */}
      <mesh position={[-0.22, -0.62, 0.08]}>
        <boxGeometry args={[0.28, 0.15, 0.4]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.22, -0.62, 0.08]}>
        <boxGeometry args={[0.28, 0.15, 0.4]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
}

export function Character3D({ job, height = 360 }: { job: Job; height?: number }) {
  return (
    <div style={{ height, width: "100%" }}>
      <Canvas shadows camera={{ position: [0, 1.4, 3.8], fov: 40 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[3, 5, 3]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-3, 2, -2]} intensity={0.4} color={job.accentColor} />
          <CharacterModel job={job} />
          <ContactShadows position={[0, -0.78, 0]} opacity={0.5} scale={5} blur={2.5} />
          <Environment preset="city" />
          <OrbitControls
            enablePan={false}
            minDistance={2.5}
            maxDistance={6}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.9}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
