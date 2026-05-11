// Decorative sky: soft gradient + drifting clouds + a clickable hot-air balloon.
// Adds gentle cursor parallax so the whole sky feels alive.

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { playBalloon, playWhoosh, playChirp } from "@/lib/sounds";

// ---------- Parallax ----------
// Writes --px and --py (range ~ -1..1) onto <html> so any element can react.
function useGlobalParallax() {
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    let nextX = 0;
    let nextY = 0;

    const flush = () => {
      root.style.setProperty("--px", nextX.toFixed(3));
      root.style.setProperty("--py", nextY.toFixed(3));
      raf = 0;
    };

    const onMove = (e: PointerEvent) => {
      nextX = (e.clientX / window.innerWidth) * 2 - 1;
      nextY = (e.clientY / window.innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(flush);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
      root.style.removeProperty("--px");
      root.style.removeProperty("--py");
    };
  }, []);
}

function parallaxStyle(x: number, y: number): React.CSSProperties {
  return {
    transform: `translate(calc(var(--px, 0) * ${x}px), calc(var(--py, 0) * ${y}px))`,
    transition: "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)",
    willChange: "transform",
  };
}

// ---------- Clouds ----------
type CloudProps = {
  top: string;
  size: number;
  delay: number;
  duration: number;
  opacity?: number;
  flip?: boolean;
  parallax: number; // horizontal parallax in px
};

function Cloud({ top, size, delay, duration, opacity = 0.95, flip = false, parallax }: CloudProps) {
  // Outer wrapper handles parallax (and absolute positioning).
  // Inner element handles the drift animation. Two layers so transforms don't fight.
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        top,
        left: "-25%",
        width: `${size}px`,
        height: `${size * 0.55}px`,
        ...parallaxStyle(parallax, parallax * 0.4),
      }}
    >
      <div
        className="sky-cloud h-full w-full"
        style={{
          opacity,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
        }}
      >
        <svg
          viewBox="0 0 200 110"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
          style={flip ? { transform: "scaleX(-1)" } : undefined}
        >
          <defs>
            <radialGradient id="cloud-grad" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.98" />
              <stop offset="100%" stopColor="#DCE9F4" stopOpacity="0.92" />
            </radialGradient>
          </defs>
          <g fill="url(#cloud-grad)">
            <ellipse cx="55" cy="70" rx="42" ry="28" />
            <ellipse cx="95" cy="55" rx="48" ry="35" />
            <ellipse cx="140" cy="68" rx="40" ry="28" />
            <ellipse cx="115" cy="80" rx="55" ry="22" />
            <ellipse cx="75" cy="82" rx="40" ry="18" />
          </g>
        </svg>
      </div>
    </div>
  );
}

// ---------- Sun ----------
function Sun() {
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        top: "-60px",
        right: "-60px",
        width: "260px",
        height: "260px",
        ...parallaxStyle(-14, -10),
      }}
    >
      <svg viewBox="0 0 200 200" className="h-full w-full">
        <defs>
          <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF6D3" stopOpacity="1" />
            <stop offset="55%" stopColor="#FFE9A6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FFE9A6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sun-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE38A" stopOpacity="1" />
            <stop offset="100%" stopColor="#F6C25A" stopOpacity="1" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="95" fill="url(#sun-glow)" />
        <circle cx="100" cy="100" r="44" fill="url(#sun-core)" />
      </svg>
    </div>
  );
}

// ---------- Hot-air balloon ----------
function HotAirBalloon() {
  const [poppedAt, setPoppedAt] = useState<number>(0);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height * 0.3) / window.innerHeight;

    confetti({
      particleCount: 55,
      spread: 80,
      origin: { x, y },
      colors: ["#FFD37A", "#F4A258", "#7DBFE5", "#A6D8B7", "#E89BA4"],
      startVelocity: 30,
      scalar: 0.85,
      ticks: 120,
    });

    playBalloon();
    setPoppedAt(Date.now());
  };

  return (
    <div
      className="pointer-events-none fixed bottom-[12%] left-[3%] z-30 hidden xl:block"
      style={parallaxStyle(22, 16)}
    >
      <button
        onClick={handleClick}
        aria-label="Sharchani bos"
        className="sky-balloon-bob pointer-events-auto block cursor-pointer transition-transform hover:scale-[1.06] active:scale-95"
        style={{ width: 110, height: 170, background: "transparent", border: 0, padding: 0 }}
      >
        <svg viewBox="0 0 120 180" className="h-full w-full drop-shadow-md">
          <defs>
            <linearGradient id="balloon-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F6A26A" />
              <stop offset="55%" stopColor="#EC8857" />
              <stop offset="100%" stopColor="#C76A3F" />
            </linearGradient>
            <pattern id="basket-weave" patternUnits="userSpaceOnUse" width="6" height="6">
              <rect width="6" height="6" fill="#8B5E34" />
              <path d="M0 3 H6 M3 0 V6" stroke="rgba(0,0,0,0.18)" strokeWidth="0.8" />
            </pattern>
          </defs>

          {/* envelope */}
          <path
            d="M60 8 C18 8 4 50 4 80 C4 105 28 125 60 125 C92 125 116 105 116 80 C116 50 102 8 60 8 Z"
            fill="url(#balloon-grad)"
          />
          {/* highlight stripe */}
          <path
            d="M60 8 C42 50 42 90 60 125"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="6"
            fill="none"
          />
          {/* shadow stripe */}
          <path
            d="M60 8 C78 50 78 90 60 125"
            stroke="rgba(0,0,0,0.08)"
            strokeWidth="6"
            fill="none"
          />
          {/* ropes */}
          <line x1="35" y1="120" x2="44" y2="148" stroke="#7A4B2A" strokeWidth="1.6" />
          <line x1="85" y1="120" x2="76" y2="148" stroke="#7A4B2A" strokeWidth="1.6" />
          <line x1="58" y1="124" x2="58" y2="148" stroke="#7A4B2A" strokeWidth="1.6" />
          {/* basket */}
          <rect x="40" y="148" width="40" height="22" rx="3" fill="url(#basket-weave)" />
          <rect x="40" y="148" width="40" height="3" fill="rgba(0,0,0,0.18)" />
        </svg>
      </button>

      {/* sparkle ring on pop */}
      {poppedAt > 0 && (
        <div
          key={poppedAt}
          className="sky-sparkle pointer-events-none absolute inset-0"
          aria-hidden
        >
          <svg
            viewBox="-50 -50 100 100"
            className="absolute left-1/2 top-[18%] h-32 w-32 -translate-x-1/2 -translate-y-1/2"
          >
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              const x = Math.cos(angle) * 32;
              const y = Math.sin(angle) * 32;
              return (
                <circle key={i} cx={x} cy={y} r="3" fill={i % 2 === 0 ? "#F6C25A" : "#7DBFE5"} />
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}

// ---------- Paper plane ----------
const PLANE_GLIDE_MS = 28_000; // must match the .sky-plane-glide animation duration

function PaperPlane() {
  const [trickAt, setTrickAt] = useState<number>(0);
  const timersRef = useRef<{ timeout?: number; interval?: number }>({});

  // Ambient whoosh on every flight pass — fires once mid-flight, then every cycle.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (prefersReduced) return;

    timersRef.current.timeout = window.setTimeout(() => {
      if (!document.hidden) playWhoosh();
      timersRef.current.interval = window.setInterval(() => {
        if (!document.hidden) playWhoosh();
      }, PLANE_GLIDE_MS);
    }, 12_000); // wait until plane is visible mid-flight

    return () => {
      const { timeout, interval } = timersRef.current;
      if (timeout) clearTimeout(timeout);
      if (interval) clearInterval(interval);
      timersRef.current = {};
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 28,
      spread: 60,
      origin: { x, y },
      colors: ["#FFFFFF", "#DCEBF8", "#7DBFE5", "#FFD37A"],
      startVelocity: 22,
      scalar: 0.7,
      ticks: 90,
    });

    playWhoosh();
    setTrickAt(Date.now());
  };

  return (
    // Outer: glides across the sky (no parallax — looks weird mid-flight).
    <div
      className="sky-plane-glide pointer-events-none fixed left-0 top-[14%] z-20 hidden md:block"
      aria-hidden="false"
    >
      <button
        key={trickAt /* restart trick animation on each click */}
        onClick={handleClick}
        aria-label="Qog'oz samolyot"
        className={`pointer-events-auto block cursor-pointer transition-transform hover:scale-110 active:scale-95 ${
          trickAt ? "sky-plane-trick" : ""
        }`}
        style={{ width: 86, height: 86, background: "transparent", border: 0, padding: 0 }}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-sm">
          <defs>
            <linearGradient id="plane-light" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E2EAF3" />
            </linearGradient>
            <linearGradient id="plane-shadow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#B9C5D3" />
              <stop offset="100%" stopColor="#8FA0B4" />
            </linearGradient>
          </defs>
          {/* tail fold (back) */}
          <polygon points="14,52 50,68 50,84" fill="url(#plane-shadow)" />
          {/* under wing */}
          <polygon points="14,52 50,68 86,52 50,30" fill="url(#plane-shadow)" />
          {/* top wing */}
          <polygon points="14,52 50,30 86,52 50,40" fill="url(#plane-light)" />
          {/* center crease */}
          <line x1="50" y1="30" x2="50" y2="84" stroke="rgba(0,0,0,0.18)" strokeWidth="1" />
        </svg>
      </button>
    </div>
  );
}

// ---------- Bird ----------
function Bird() {
  const [twirlAt, setTwirlAt] = useState<number>(0);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 24,
      spread: 50,
      origin: { x, y },
      colors: ["#F6C25A", "#FFB257", "#FFFFFF", "#E89BA4"],
      startVelocity: 18,
      scalar: 0.65,
      ticks: 80,
      shapes: ["circle"],
    });

    playChirp();
    setTwirlAt(Date.now());
  };

  return (
    <div
      className="pointer-events-none fixed right-[10%] top-[28%] z-20 hidden md:block"
      style={parallaxStyle(-18, 14)}
    >
      <div className="sky-bird-drift">
        <button
          key={twirlAt}
          onClick={handleClick}
          aria-label="Qushni bos"
          className={`pointer-events-auto block cursor-pointer transition-transform hover:scale-110 active:scale-90 ${
            twirlAt ? "sky-plane-trick" : ""
          }`}
          style={{ width: 64, height: 56, background: "transparent", border: 0, padding: 0 }}
        >
          <svg viewBox="0 0 80 70" className="h-full w-full drop-shadow-sm">
            <defs>
              <linearGradient id="bird-body" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFD37A" />
                <stop offset="100%" stopColor="#F6A553" />
              </linearGradient>
            </defs>
            {/* upper wing (flaps up) */}
            <g className="sky-bird-wing-up">
              <path d="M40 28 Q22 6 4 18 Q22 22 38 32 Z" fill="url(#bird-body)" />
              <path d="M40 28 Q58 6 76 18 Q58 22 42 32 Z" fill="url(#bird-body)" />
            </g>
            {/* body */}
            <ellipse cx="40" cy="38" rx="14" ry="11" fill="url(#bird-body)" />
            {/* lower wing (flaps down, slight delay implied by shape) */}
            <g className="sky-bird-wing-down" style={{ animationDelay: "180ms" }}>
              <path d="M40 40 Q26 52 14 48 Q28 44 38 40 Z" fill="#E89540" />
              <path d="M40 40 Q54 52 66 48 Q52 44 42 40 Z" fill="#E89540" />
            </g>
            {/* head */}
            <circle cx="54" cy="32" r="7" fill="url(#bird-body)" />
            {/* eye */}
            <circle cx="56" cy="31" r="1.4" fill="#2a2a2a" />
            {/* beak */}
            <polygon points="61,31 67,33 61,35" fill="#D77B2C" />
            {/* tail */}
            <polygon points="26,38 14,34 18,40 14,44" fill="#E89540" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ---------- Public ----------
export function SkyBackground() {
  useGlobalParallax();

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #6FB1E3 0%, #95C9EC 45%, #CFE3F3 100%)",
        }}
      >
        <div
          className="absolute inset-x-0 bottom-0 h-1/3"
          style={{
            background:
              "linear-gradient(180deg, transparent, rgba(255,255,255,0.35) 60%, rgba(255,255,255,0.55))",
          }}
        />

        <Sun />

        <Cloud top="8%" size={260} delay={0} duration={70} opacity={0.95} parallax={28} />
        <Cloud top="20%" size={180} delay={18} duration={55} opacity={0.85} parallax={22} flip />
        <Cloud top="34%" size={320} delay={6} duration={90} opacity={0.9} parallax={36} />
        <Cloud top="48%" size={210} delay={30} duration={65} opacity={0.78} parallax={18} flip />
        <Cloud top="62%" size={280} delay={12} duration={80} opacity={0.7} parallax={26} />
        <Cloud top="76%" size={200} delay={42} duration={60} opacity={0.6} parallax={14} flip />
        <Cloud top="88%" size={260} delay={22} duration={75} opacity={0.5} parallax={10} />
      </div>

      {/* Interactive layer — lives above the -z-10 visuals but below modals (z-50) */}
      <PaperPlane />
      <Bird />
      <HotAirBalloon />
    </>
  );
}
