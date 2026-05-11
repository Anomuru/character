import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, RoundedBox } from "@react-three/drei";
import { useRef, Suspense } from "react";
import type { Group } from "three";
import type { Job } from "@/lib/jobs";

export type BodyPart = "hat" | "head" | "torso" | "leftArm" | "rightArm" | "leftLeg" | "rightLeg";

const SKIN = "#f3c6a3";
const SKIN_DARK = "#c98c66";
const HAIR = "#3a2618";

function Hat({ type, color }: { type: Job["hatType"]; color: string }) {
  if (type === "none") return null;

  if (type === "chef") {
    return (
      <group position={[0, 1.95, 0]}>
        {/* band */}
        <mesh position={[0, 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.44, 0.44, 0.18, 48]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
        {/* puffy top — three stacked spheres for depth */}
        <mesh position={[0, 0.42, 0]} castShadow>
          <sphereGeometry args={[0.42, 48, 48]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
        <mesh position={[-0.18, 0.32, 0.05]} castShadow>
          <sphereGeometry args={[0.28, 32, 32]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
        <mesh position={[0.18, 0.32, 0.05]} castShadow>
          <sphereGeometry args={[0.28, 32, 32]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
      </group>
    );
  }

  if (type === "hardhat") {
    return (
      <group position={[0, 1.95, 0]}>
        {/* dome */}
        <mesh castShadow>
          <sphereGeometry args={[0.5, 48, 48, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
        </mesh>
        {/* brim — wider in front */}
        <mesh position={[0, -0.02, 0.05]} castShadow>
          <cylinderGeometry args={[0.58, 0.58, 0.06, 48]} />
          <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
        </mesh>
        {/* center ridge */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[0.08, 0.5, 0.95]} />
          <meshStandardMaterial color={color} roughness={0.45} metalness={0.15} />
        </mesh>
      </group>
    );
  }

  // cap (with visor)
  return (
    <group position={[0, 1.95, 0]}>
      <mesh castShadow>
        <sphereGeometry args={[0.46, 48, 48, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* visor */}
      <mesh position={[0, -0.02, 0.4]} rotation={[-0.2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.34, 0.04, 24, 1, false, -Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.65} />
      </mesh>
      {/* button on top */}
      <mesh position={[0, 0.44, 0]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    </group>
  );
}

function Head({ showHair }: { showHair: boolean }) {
  return (
    <group position={[0, 1.55, 0]}>
      {/* head sphere */}
      <mesh castShadow>
        <sphereGeometry args={[0.42, 48, 48]} />
        <meshStandardMaterial color={SKIN} roughness={0.65} />
      </mesh>

      {/* hair cap (only if no hat covering it) */}
      {showHair && (
        <mesh position={[0, 0.08, -0.02]} castShadow>
          <sphereGeometry args={[0.44, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2.4]} />
          <meshStandardMaterial color={HAIR} roughness={0.85} />
        </mesh>
      )}

      {/* ears */}
      <mesh position={[-0.42, -0.02, 0]} rotation={[0, 0, 0.1]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={SKIN} roughness={0.7} />
      </mesh>
      <mesh position={[0.42, -0.02, 0]} rotation={[0, 0, -0.1]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={SKIN} roughness={0.7} />
      </mesh>

      {/* eyes — whites */}
      <mesh position={[-0.14, 0.05, 0.36]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      <mesh position={[0.14, 0.05, 0.36]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      {/* pupils */}
      <mesh position={[-0.14, 0.05, 0.42]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} />
      </mesh>
      <mesh position={[0.14, 0.05, 0.42]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} />
      </mesh>

      {/* eyebrows */}
      <mesh position={[-0.14, 0.18, 0.39]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[0.13, 0.025, 0.02]} />
        <meshStandardMaterial color={HAIR} roughness={0.85} />
      </mesh>
      <mesh position={[0.14, 0.18, 0.39]} rotation={[0, 0, -0.1]}>
        <boxGeometry args={[0.13, 0.025, 0.02]} />
        <meshStandardMaterial color={HAIR} roughness={0.85} />
      </mesh>

      {/* nose */}
      <mesh position={[0, -0.02, 0.42]}>
        <coneGeometry args={[0.05, 0.12, 16]} />
        <meshStandardMaterial color={SKIN_DARK} roughness={0.7} />
      </mesh>

      {/* mouth — smile arc */}
      <mesh position={[0, -0.2, 0.38]} rotation={[0, 0, Math.PI]} scale={[1, 0.6, 1]}>
        <torusGeometry args={[0.1, 0.022, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#5c2a1f" roughness={0.55} />
      </mesh>
      {/* lower lip highlight */}
      <mesh position={[0, -0.235, 0.39]} scale={[1.4, 0.35, 0.6]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#d18a7a" roughness={0.6} />
      </mesh>

      {/* neck */}
      <mesh position={[0, -0.38, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.18, 24]} />
        <meshStandardMaterial color={SKIN} roughness={0.7} />
      </mesh>
    </group>
  );
}

function Torso({ bodyColor, accentColor }: { bodyColor: string; accentColor: string }) {
  return (
    <group position={[0, 0.75, 0]}>
      {/* main torso — rounded */}
      <RoundedBox args={[0.95, 1.15, 0.55]} radius={0.12} smoothness={6} castShadow>
        <meshStandardMaterial color={bodyColor} roughness={0.7} />
      </RoundedBox>

      {/* shoulders */}
      <mesh position={[-0.48, 0.45, 0]} castShadow>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} />
      </mesh>
      <mesh position={[0.48, 0.45, 0]} castShadow>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} />
      </mesh>

      {/* center accent stripe */}
      <mesh position={[0, 0, 0.28]}>
        <boxGeometry args={[0.16, 1.15, 0.01]} />
        <meshStandardMaterial color={accentColor} roughness={0.5} metalness={0.15} />
      </mesh>

      {/* collar */}
      <mesh position={[0, 0.55, 0.22]}>
        <torusGeometry args={[0.18, 0.04, 12, 24, Math.PI]} />
        <meshStandardMaterial color={accentColor} roughness={0.5} />
      </mesh>

      {/* buttons down the front */}
      {[0.3, 0.05, -0.2, -0.45].map((y, i) => (
        <mesh key={i} position={[0, y, 0.29]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial color={accentColor} roughness={0.3} metalness={0.4} />
        </mesh>
      ))}

      {/* belt */}
      <mesh position={[0, -0.55, 0]}>
        <boxGeometry args={[0.98, 0.1, 0.58]} />
        <meshStandardMaterial color="#2a1f16" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0, -0.55, 0.29]}>
        <boxGeometry args={[0.16, 0.13, 0.02]} />
        <meshStandardMaterial color="#c5a14a" roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  );
}

function Arm({
  side,
  bodyColor,
  accentColor,
}: {
  side: "left" | "right";
  bodyColor: string;
  accentColor: string;
}) {
  const dir = side === "left" ? -1 : 1;
  return (
    <group position={[0.62 * dir, 0.85, 0]} rotation={[0, 0, 0.2 * -dir]}>
      {/* upper sleeve */}
      <mesh position={[0, 0, 0]} castShadow>
        <capsuleGeometry args={[0.14, 0.62, 12, 24]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} />
      </mesh>
      {/* cuff */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.155, 0.15, 0.08, 24]} />
        <meshStandardMaterial color={accentColor} roughness={0.55} />
      </mesh>
      {/* hand — elongated, fingertip shaped */}
      <group position={[0, -0.55, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.14, 24, 24]} />
          <meshStandardMaterial color={SKIN} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[0.18, 0.13, 0.16]} />
          <meshStandardMaterial color={SKIN} roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

function Leg({ side, accentColor }: { side: "left" | "right"; accentColor: string }) {
  const dir = side === "left" ? -1 : 1;
  return (
    <group position={[0.22 * dir, -0.15, 0]}>
      {/* pant leg */}
      <mesh castShadow>
        <capsuleGeometry args={[0.17, 0.72, 12, 24]} />
        <meshStandardMaterial color={accentColor} roughness={0.75} />
      </mesh>
      {/* ankle cuff */}
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.185, 0.175, 0.06, 24]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      {/* shoe — sole + body */}
      <group position={[0, -0.6, 0.05]}>
        <RoundedBox args={[0.3, 0.16, 0.45]} radius={0.06} smoothness={4} castShadow>
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
        </RoundedBox>
        {/* sole */}
        <mesh position={[0, -0.09, 0]}>
          <boxGeometry args={[0.32, 0.04, 0.46]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.6} />
        </mesh>
        {/* shoe accent — colored toe cap */}
        <mesh position={[0, 0, 0.18]}>
          <boxGeometry args={[0.26, 0.1, 0.08]} />
          <meshStandardMaterial color={accentColor} roughness={0.5} metalness={0.1} />
        </mesh>
      </group>
    </group>
  );
}

function CharacterModel({ job, hidden }: { job: Job; hidden: Set<BodyPart> }) {
  const group = useRef<Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = Math.sin(t * 0.5) * 0.3;
    group.current.position.y = Math.sin(t * 1.5) * 0.05;
  });

  const show = (p: BodyPart) => !hidden.has(p);
  const hatHidden = hidden.has("hat") || job.hatType === "none";

  return (
    <group ref={group} position={[0, -0.2, 0]} scale={0.78}>
      {show("head") && <Head showHair={hatHidden} />}
      {show("hat") && show("head") && <Hat type={job.hatType} color={job.hatColor} />}
      {show("torso") && <Torso bodyColor={job.bodyColor} accentColor={job.accentColor} />}
      {show("leftArm") && (
        <Arm side="left" bodyColor={job.bodyColor} accentColor={job.accentColor} />
      )}
      {show("rightArm") && (
        <Arm side="right" bodyColor={job.bodyColor} accentColor={job.accentColor} />
      )}
      {show("leftLeg") && <Leg side="left" accentColor={job.accentColor} />}
      {show("rightLeg") && <Leg side="right" accentColor={job.accentColor} />}
    </group>
  );
}

export function Character3D({
  job,
  height = 360,
  zoom,
  hiddenParts,
}: {
  job: Job;
  height?: number | string;
  zoom?: number;
  hiddenParts?: Set<BodyPart>;
}) {
  const cssHeight = typeof height === "number" ? `${height}px` : height;
  const numericHeight = typeof height === "number" ? height : 460;
  const computedZoom = zoom ?? Math.max(70, Math.round(numericHeight * 0.28));
  return (
    <div style={{ height: cssHeight, width: "100%" }}>
      <Canvas
        shadows
        orthographic
        camera={{ position: [0, 0.9, 5], zoom: computedZoom }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          {/* warm key light */}
          <directionalLight
            position={[3, 5, 3]}
            intensity={1.3}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0005}
          />
          {/* cool fill */}
          <directionalLight position={[-3, 2, -2]} intensity={0.5} color={job.accentColor} />
          {/* rim light from behind */}
          <directionalLight position={[0, 3, -4]} intensity={0.8} color="#ffffff" />
          {/* ambient */}
          <ambientLight intensity={0.55} />

          <CharacterModel job={job} hidden={hiddenParts ?? new Set()} />

          <ContactShadows position={[0, -0.78, 0]} opacity={0.6} scale={6} blur={3} far={1.2} />
          <Environment preset="city" />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            target={[0, 0.65, 0]}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.9}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
