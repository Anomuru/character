import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, RoundedBox } from "@react-three/drei";
import { useRef, Suspense } from "react";
import type { Group } from "three";
import type { Job, Appearance } from "@/lib/jobs";

export type BodyPart = "hat" | "head" | "torso" | "leftArm" | "rightArm" | "leftLeg" | "rightLeg";

const FALLBACK: Required<Omit<Appearance, "glasses" | "accessory" | "facialHair">> & {
  glasses: boolean;
  facialHair: "none" | "mustache" | "beard";
  accessory: "stethoscope" | "badge" | "tie" | "scarf" | "labcoat" | "none";
} = {
  gender: "male",
  skinTone: "#F0C8A0",
  hairColor: "#3a2618",
  hairStyle: "short",
  glasses: false,
  facialHair: "none",
  accessory: "none",
};

function resolve(app: Appearance | undefined) {
  return {
    gender: app?.gender ?? FALLBACK.gender,
    skinTone: app?.skinTone ?? FALLBACK.skinTone,
    hairColor: app?.hairColor ?? FALLBACK.hairColor,
    hairStyle: app?.hairStyle ?? FALLBACK.hairStyle,
    glasses: app?.glasses ?? FALLBACK.glasses,
    facialHair: app?.facialHair ?? FALLBACK.facialHair,
    accessory: app?.accessory ?? FALLBACK.accessory,
  };
}

function darken(hex: string, amt = 0.7): string {
  const m = hex.replace("#", "");
  const n = parseInt(m, 16);
  const r = Math.max(0, Math.min(255, Math.round(((n >> 16) & 0xff) * amt)));
  const g = Math.max(0, Math.min(255, Math.round(((n >> 8) & 0xff) * amt)));
  const b = Math.max(0, Math.min(255, Math.round((n & 0xff) * amt)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function Hat({ type, color }: { type: Job["hatType"]; color: string }) {
  if (type === "none") return null;

  if (type === "chef") {
    return (
      <group position={[0, 1.95, 0]}>
        <mesh position={[0, 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.44, 0.44, 0.18, 48]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
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
        <mesh castShadow>
          <sphereGeometry args={[0.5, 48, 48, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
        </mesh>
        <mesh position={[0, -0.02, 0.05]} castShadow>
          <cylinderGeometry args={[0.58, 0.58, 0.06, 48]} />
          <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[0.08, 0.5, 0.95]} />
          <meshStandardMaterial color={color} roughness={0.45} metalness={0.15} />
        </mesh>
      </group>
    );
  }

  return (
    <group position={[0, 1.95, 0]}>
      <mesh castShadow>
        <sphereGeometry args={[0.46, 48, 48, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.02, 0.4]} rotation={[-0.2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.34, 0.04, 24, 1, false, -Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.44, 0]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    </group>
  );
}

function Hair({
  style,
  color,
  hatCovers,
}: {
  style: Appearance["hairStyle"];
  color: string;
  hatCovers: boolean;
}) {
  // when a hat covers the top, only render side/back hair where it would peek out
  if (style === "buzz") {
    return (
      <mesh position={[0, 0.06, -0.02]} castShadow>
        <sphereGeometry args={[0.43, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
    );
  }

  if (style === "long") {
    return (
      <group>
        {!hatCovers && (
          <mesh position={[0, 0.06, -0.02]} castShadow>
            <sphereGeometry args={[0.46, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.9]} />
            <meshStandardMaterial color={color} roughness={0.85} />
          </mesh>
        )}
        {/* hair falling down behind shoulders */}
        <mesh position={[0, -0.18, -0.18]} castShadow>
          <RoundedBox args={[0.7, 0.85, 0.22]} radius={0.18} smoothness={4}>
            <meshStandardMaterial color={color} roughness={0.85} />
          </RoundedBox>
        </mesh>
        {/* side bangs */}
        {!hatCovers && (
          <>
            <mesh position={[-0.32, -0.05, 0.18]} rotation={[0, 0, 0.3]}>
              <boxGeometry args={[0.14, 0.32, 0.18]} />
              <meshStandardMaterial color={color} roughness={0.85} />
            </mesh>
            <mesh position={[0.32, -0.05, 0.18]} rotation={[0, 0, -0.3]}>
              <boxGeometry args={[0.14, 0.32, 0.18]} />
              <meshStandardMaterial color={color} roughness={0.85} />
            </mesh>
          </>
        )}
      </group>
    );
  }

  if (style === "ponytail") {
    return (
      <group>
        {!hatCovers && (
          <mesh position={[0, 0.08, -0.02]} castShadow>
            <sphereGeometry args={[0.45, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2.1]} />
            <meshStandardMaterial color={color} roughness={0.85} />
          </mesh>
        )}
        {/* ponytail behind */}
        <mesh position={[0, -0.1, -0.42]} rotation={[0.2, 0, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.5, 12, 24]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
        {/* hair tie */}
        <mesh position={[0, 0.12, -0.42]}>
          <torusGeometry args={[0.13, 0.025, 12, 24]} />
          <meshStandardMaterial color="#E03070" roughness={0.4} />
        </mesh>
      </group>
    );
  }

  if (style === "bun") {
    return (
      <group>
        {!hatCovers && (
          <mesh position={[0, 0.08, -0.02]} castShadow>
            <sphereGeometry args={[0.45, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2.1]} />
            <meshStandardMaterial color={color} roughness={0.85} />
          </mesh>
        )}
        {/* bun on top-back */}
        <mesh position={[0, 0.42, -0.18]} castShadow>
          <sphereGeometry args={[0.22, 32, 32]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      </group>
    );
  }

  // short (default male)
  if (hatCovers) return null;
  return (
    <mesh position={[0, 0.08, -0.02]} castShadow>
      <sphereGeometry args={[0.44, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2.4]} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  );
}

function Glasses() {
  return (
    <group position={[0, 0.05, 0.4]}>
      {/* bridge */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.06, 0.02, 0.02]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* left frame */}
      <mesh position={[-0.14, 0, 0.02]}>
        <torusGeometry args={[0.085, 0.018, 12, 24]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* right frame */}
      <mesh position={[0.14, 0, 0.02]}>
        <torusGeometry args={[0.085, 0.018, 12, 24]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* lenses tint */}
      <mesh position={[-0.14, 0, 0.01]}>
        <circleGeometry args={[0.075, 24]} />
        <meshStandardMaterial color="#C8E0F0" transparent opacity={0.35} roughness={0.1} />
      </mesh>
      <mesh position={[0.14, 0, 0.01]}>
        <circleGeometry args={[0.075, 24]} />
        <meshStandardMaterial color="#C8E0F0" transparent opacity={0.35} roughness={0.1} />
      </mesh>
    </group>
  );
}

function Mustache({ color }: { color: string }) {
  return (
    <group position={[0, -0.12, 0.39]}>
      <mesh rotation={[0, 0, 0]} scale={[1.6, 0.5, 0.6]}>
        <torusGeometry args={[0.07, 0.025, 12, 24, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Beard({ color }: { color: string }) {
  return (
    <group>
      <Mustache color={color} />
      <mesh position={[0, -0.28, 0.34]} scale={[1.2, 0.8, 0.6]}>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      {/* chin-strap edges */}
      <mesh position={[-0.28, -0.18, 0.22]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.08, 0.22, 0.1]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      <mesh position={[0.28, -0.18, 0.22]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.08, 0.22, 0.1]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
    </group>
  );
}

function Head({
  appearance,
  hatCovers,
}: {
  appearance: ReturnType<typeof resolve>;
  hatCovers: boolean;
}) {
  const skin = appearance.skinTone;
  const skinShadow = darken(skin, 0.82);

  return (
    <group position={[0, 1.55, 0]}>
      <mesh castShadow>
        <sphereGeometry args={[0.42, 48, 48]} />
        <meshStandardMaterial color={skin} roughness={0.65} />
      </mesh>

      <Hair style={appearance.hairStyle} color={appearance.hairColor} hatCovers={hatCovers} />

      <mesh position={[-0.42, -0.02, 0]} rotation={[0, 0, 0.1]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={skin} roughness={0.7} />
      </mesh>
      <mesh position={[0.42, -0.02, 0]} rotation={[0, 0, -0.1]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={skin} roughness={0.7} />
      </mesh>

      <mesh position={[-0.14, 0.05, 0.36]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      <mesh position={[0.14, 0.05, 0.36]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      <mesh position={[-0.14, 0.05, 0.42]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} />
      </mesh>
      <mesh position={[0.14, 0.05, 0.42]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} />
      </mesh>

      <mesh position={[-0.14, 0.18, 0.39]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[0.13, 0.025, 0.02]} />
        <meshStandardMaterial color={appearance.hairColor} roughness={0.85} />
      </mesh>
      <mesh position={[0.14, 0.18, 0.39]} rotation={[0, 0, -0.1]}>
        <boxGeometry args={[0.13, 0.025, 0.02]} />
        <meshStandardMaterial color={appearance.hairColor} roughness={0.85} />
      </mesh>

      <mesh position={[0, -0.02, 0.42]}>
        <coneGeometry args={[0.05, 0.12, 16]} />
        <meshStandardMaterial color={skinShadow} roughness={0.7} />
      </mesh>

      {/* mouth — smile arc; women get pinker lips */}
      <mesh position={[0, -0.2, 0.38]} rotation={[0, 0, Math.PI]} scale={[1, 0.6, 1]}>
        <torusGeometry args={[0.1, 0.022, 16, 32, Math.PI]} />
        <meshStandardMaterial
          color={appearance.gender === "female" ? "#B83254" : "#5c2a1f"}
          roughness={0.55}
        />
      </mesh>
      <mesh position={[0, -0.235, 0.39]} scale={[1.4, 0.35, 0.6]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial
          color={appearance.gender === "female" ? "#E07A8A" : "#d18a7a"}
          roughness={0.6}
        />
      </mesh>

      {appearance.facialHair === "mustache" && <Mustache color={appearance.hairColor} />}
      {appearance.facialHair === "beard" && <Beard color={appearance.hairColor} />}
      {appearance.glasses && <Glasses />}

      <mesh position={[0, -0.38, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.18, 24]} />
        <meshStandardMaterial color={skin} roughness={0.7} />
      </mesh>
    </group>
  );
}

function Stethoscope() {
  return (
    <group position={[0, 1.18, 0.3]}>
      {/* tubing draped around neck */}
      <mesh position={[-0.18, -0.05, 0]} rotation={[0, 0, 0.6]}>
        <torusGeometry args={[0.22, 0.022, 12, 32, Math.PI * 0.9]} />
        <meshStandardMaterial color="#2D2D2D" roughness={0.55} />
      </mesh>
      <mesh position={[0.18, -0.05, 0]} rotation={[0, 0, -0.6]}>
        <torusGeometry args={[0.22, 0.022, 12, 32, Math.PI * 0.9]} />
        <meshStandardMaterial color="#2D2D2D" roughness={0.55} />
      </mesh>
      {/* chest piece */}
      <mesh position={[0.1, -0.45, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.04, 24]} />
        <meshStandardMaterial color="#B0B5BA" metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0.1, -0.47, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.02, 24]} />
        <meshStandardMaterial color="#2D2D2D" roughness={0.4} />
      </mesh>
    </group>
  );
}

function Badge({ color }: { color: string }) {
  return (
    <group position={[-0.28, 1.05, 0.3]}>
      <mesh rotation={[0, 0, Math.PI / 6]}>
        <octahedronGeometry args={[0.09, 0]} />
        <meshStandardMaterial color={color} metalness={0.85} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <circleGeometry args={[0.035, 24]} />
        <meshStandardMaterial color="#7F2020" metalness={0.4} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Tie({ accent }: { accent: string }) {
  return (
    <group position={[0, 1.05, 0.3]}>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.08, 0.12, 0.04]} />
        <meshStandardMaterial color={darken(accent, 0.7)} roughness={0.55} />
      </mesh>
      <mesh position={[0, -0.25, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.14, 0.5, 0.04]} />
        <meshStandardMaterial color={accent} roughness={0.55} />
      </mesh>
      <mesh position={[0, -0.52, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.13, 0.13, 0.04]} />
        <meshStandardMaterial color={accent} roughness={0.55} />
      </mesh>
    </group>
  );
}

function Scarf({ accent }: { accent: string }) {
  return (
    <group position={[0, 1.18, 0]}>
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[0.22, 0.07, 16, 32]} />
        <meshStandardMaterial color={accent} roughness={0.8} />
      </mesh>
      <mesh position={[0.14, -0.18, 0.16]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.12, 0.32, 0.05]} />
        <meshStandardMaterial color={accent} roughness={0.8} />
      </mesh>
    </group>
  );
}

function LabCoat() {
  return (
    <group position={[0, 0.75, 0.32]}>
      {/* coat panel slightly out front */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[0.92, 1.1, 0.02]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.85} />
      </mesh>
      {/* lapels */}
      <mesh position={[-0.22, 0.4, 0.02]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.18, 0.4, 0.02]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.85} />
      </mesh>
      <mesh position={[0.22, 0.4, 0.02]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.18, 0.4, 0.02]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.85} />
      </mesh>
      {/* pocket */}
      <mesh position={[0.25, -0.3, 0.03]}>
        <boxGeometry args={[0.2, 0.22, 0.02]} />
        <meshStandardMaterial color="#E8E8E8" roughness={0.85} />
      </mesh>
    </group>
  );
}

function Torso({
  bodyColor,
  accentColor,
  gender,
}: {
  bodyColor: string;
  accentColor: string;
  gender: Appearance["gender"];
}) {
  const width = gender === "female" ? 0.88 : 0.95;
  const depth = gender === "female" ? 0.5 : 0.55;

  return (
    <group position={[0, 0.75, 0]}>
      <RoundedBox args={[width, 1.15, depth]} radius={0.12} smoothness={6} castShadow>
        <meshStandardMaterial color={bodyColor} roughness={0.7} />
      </RoundedBox>

      <mesh position={[-0.46, 0.45, 0]} castShadow>
        <sphereGeometry args={[0.21, 32, 32]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} />
      </mesh>
      <mesh position={[0.46, 0.45, 0]} castShadow>
        <sphereGeometry args={[0.21, 32, 32]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} />
      </mesh>

      <mesh position={[0, 0, 0.27]}>
        <boxGeometry args={[0.16, 1.15, 0.01]} />
        <meshStandardMaterial color={accentColor} roughness={0.5} metalness={0.15} />
      </mesh>

      <mesh position={[0, 0.55, 0.22]}>
        <torusGeometry args={[0.18, 0.04, 12, 24, Math.PI]} />
        <meshStandardMaterial color={accentColor} roughness={0.5} />
      </mesh>

      {[0.3, 0.05, -0.2, -0.45].map((y, i) => (
        <mesh key={i} position={[0, y, 0.275]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial color={accentColor} roughness={0.3} metalness={0.4} />
        </mesh>
      ))}

      <mesh position={[0, -0.55, 0]}>
        <boxGeometry args={[width + 0.03, 0.1, depth + 0.03]} />
        <meshStandardMaterial color="#2a1f16" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0, -0.55, depth / 2 + 0.01]}>
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
  skin,
}: {
  side: "left" | "right";
  bodyColor: string;
  accentColor: string;
  skin: string;
}) {
  const dir = side === "left" ? -1 : 1;
  return (
    <group position={[0.62 * dir, 0.85, 0]} rotation={[0, 0, 0.2 * -dir]}>
      <mesh position={[0, 0, 0]} castShadow>
        <capsuleGeometry args={[0.14, 0.62, 12, 24]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.155, 0.15, 0.08, 24]} />
        <meshStandardMaterial color={accentColor} roughness={0.55} />
      </mesh>
      <group position={[0, -0.55, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.14, 24, 24]} />
          <meshStandardMaterial color={skin} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[0.18, 0.13, 0.16]} />
          <meshStandardMaterial color={skin} roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

function Leg({
  side,
  accentColor,
  gender,
}: {
  side: "left" | "right";
  accentColor: string;
  gender: Appearance["gender"];
}) {
  const dir = side === "left" ? -1 : 1;
  const offset = gender === "female" ? 0.2 : 0.22;
  return (
    <group position={[offset * dir, -0.15, 0]}>
      <mesh castShadow>
        <capsuleGeometry args={[0.17, 0.72, 12, 24]} />
        <meshStandardMaterial color={accentColor} roughness={0.75} />
      </mesh>
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.185, 0.175, 0.06, 24]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      <group position={[0, -0.6, 0.05]}>
        <RoundedBox args={[0.3, 0.16, 0.45]} radius={0.06} smoothness={4} castShadow>
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
        </RoundedBox>
        <mesh position={[0, -0.09, 0]}>
          <boxGeometry args={[0.32, 0.04, 0.46]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.6} />
        </mesh>
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

  const appearance = resolve(job.appearance);
  const show = (p: BodyPart) => !hidden.has(p);
  const hatHidden = hidden.has("hat") || job.hatType === "none";
  const hatCovers = !hatHidden && (job.hatType === "chef" || job.hatType === "hardhat");

  return (
    <group ref={group} position={[0, -0.2, 0]} scale={0.78}>
      {show("head") && <Head appearance={appearance} hatCovers={hatCovers} />}
      {show("hat") && show("head") && <Hat type={job.hatType} color={job.hatColor} />}
      {show("torso") && (
        <Torso
          bodyColor={job.bodyColor}
          accentColor={job.accentColor}
          gender={appearance.gender}
        />
      )}
      {show("torso") && appearance.accessory === "labcoat" && <LabCoat />}
      {show("torso") && appearance.accessory === "stethoscope" && <Stethoscope />}
      {show("torso") && appearance.accessory === "badge" && <Badge color={job.accentColor} />}
      {show("torso") && appearance.accessory === "tie" && <Tie accent={job.accentColor} />}
      {show("torso") && appearance.accessory === "scarf" && <Scarf accent={job.accentColor} />}
      {show("leftArm") && (
        <Arm
          side="left"
          bodyColor={job.bodyColor}
          accentColor={job.accentColor}
          skin={appearance.skinTone}
        />
      )}
      {show("rightArm") && (
        <Arm
          side="right"
          bodyColor={job.bodyColor}
          accentColor={job.accentColor}
          skin={appearance.skinTone}
        />
      )}
      {show("leftLeg") && (
        <Leg side="left" accentColor={job.accentColor} gender={appearance.gender} />
      )}
      {show("rightLeg") && (
        <Leg side="right" accentColor={job.accentColor} gender={appearance.gender} />
      )}
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
  const computedZoom = zoom ?? Math.max(85, Math.round(numericHeight * 0.34));
  return (
    <div style={{ height: cssHeight, width: "100%" }}>
      <Canvas
        shadows
        orthographic
        camera={{ position: [0, 0.9, 5], zoom: computedZoom }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <directionalLight
            position={[3, 5, 3]}
            intensity={1.3}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0005}
          />
          <directionalLight position={[-3, 2, -2]} intensity={0.5} color={job.accentColor} />
          <directionalLight position={[0, 3, -4]} intensity={0.8} color="#ffffff" />
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
