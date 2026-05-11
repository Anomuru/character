import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { JOBS, type Job, type Instrument } from "@/lib/jobs";
import { Character3D, type BodyPart } from "@/components/Character3D";
import { CharacterGLB } from "@/components/CharacterGLB";
import { CharacterImage } from "@/components/CharacterImage";
import { CharacterImage3D } from "@/components/CharacterImage3D";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllAvatars } from "@/lib/avatarStore";
import {
  getAllProgress,
  recordJobResult,
  starsFromMistakes,
  clearAllProgress,
  PROGRESS_EVENT,
  type JobProgress,
} from "@/lib/progressStore";
import { InstrumentIcon, getToolColor } from "@/lib/instrument-icons";
import { playCorrect, playWrong } from "@/lib/sounds";
import { CongratulationsModal } from "@/components/CongratulationsModal";
import { GameOverModal } from "@/components/GameOverModal";
import {
  Sparkles,
  Star,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowLeft,
  Smile,
  Frown,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kasblar shaharchasi" },
      {
        name: "description",
        content:
          "Bolalar uchun 3D rol o'ynash o'yini. Kasbga mos asboblarni toping va qahramoningizni jihozlang!",
      },
    ],
  }),
  component: Index,
});

type Stage = "select" | "profile";

const NAV_STORAGE_KEY = "characterapp:nav";

function loadNav(): { stage: Stage; selectedId: string } {
  const fallback: { stage: Stage; selectedId: string } = {
    stage: "select",
    selectedId: JOBS[0].id,
  };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.sessionStorage.getItem(NAV_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as { stage?: string; selectedId?: string };
    const validJob =
      typeof parsed.selectedId === "string" && JOBS.some((j) => j.id === parsed.selectedId);
    if (parsed.stage === "profile" && validJob) {
      return { stage: "profile", selectedId: parsed.selectedId as string };
    }
    if (parsed.stage === "select" && validJob) {
      return { stage: "select", selectedId: parsed.selectedId as string };
    }
  } catch {
    // ignore parse errors and fall through
  }
  return fallback;
}

const PART_ORDER: BodyPart[] = [
  "hat",
  "leftArm",
  "rightArm",
  "leftLeg",
  "rightLeg",
  "torso",
  "head",
];

// Card tint per job — vivid pastel gradients so each profession reads as its own colour.
const JOB_TINTS: Record<string, { bg: string; ring: string; text: string }> = {
  chef: { bg: "linear-gradient(160deg,#FFE2C2,#FFD9D6)", ring: "#E06B5F", text: "#3F1A14" },
  doctor: { bg: "linear-gradient(160deg,#CDE5FA,#BFEAF2)", ring: "#3DA0B0", text: "#062F36" },
  mechanic: { bg: "linear-gradient(160deg,#FFEFB8,#FFE2C2)", ring: "#D6A325", text: "#3F2C06" },
  builder: { bg: "linear-gradient(160deg,#FFF6A8,#DDF3A8)", ring: "#88AE2D", text: "#22320A" },
  scientist: { bg: "linear-gradient(160deg,#E4D2FA,#FBD4EC)", ring: "#9258D4", text: "#260F44" },
  programmer: { bg: "linear-gradient(160deg,#DCD4FB,#CDE5FA)", ring: "#5772D4", text: "#101D4A" },
  teacher: { bg: "linear-gradient(160deg,#FFD4DC,#EDD0F5)", ring: "#D659A8", text: "#440D33" },
  police: { bg: "linear-gradient(160deg,#D2DCFC,#D6DDE5)", ring: "#3F526B", text: "#0A2944" },
};

const DEFAULT_TINT = {
  bg: "linear-gradient(160deg,#FFF6A8,#CDE5FA)",
  ring: "#5772D4",
  text: "#101D4A",
};

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function useProgress() {
  const [progress, setProgress] = useState<Record<string, JobProgress>>(() => getAllProgress());
  useEffect(() => {
    function onChange() {
      setProgress(getAllProgress());
    }
    window.addEventListener(PROGRESS_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return progress;
}

function StarRow({
  filled,
  total = 3,
  size = 16,
  color = "#F5B14C",
  emptyColor = "rgba(15,23,42,0.18)",
}: {
  filled: number;
  total?: number;
  size?: number;
  color?: string;
  emptyColor?: string;
}) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${filled} ${total} dan`}>
      {Array.from({ length: total }).map((_, i) => {
        const lit = i < filled;
        return (
          <Star
            key={i}
            size={size}
            strokeWidth={1.6}
            className={lit ? "" : "opacity-90"}
            style={{
              color: lit ? color : emptyColor,
              fill: lit ? color : "transparent",
            }}
          />
        );
      })}
    </div>
  );
}

function useAvatarOverrides() {
  const [overrides, setOverrides] = useState<Record<string, string>>(() => getAllAvatars());
  useEffect(() => {
    function onChange() {
      setOverrides(getAllAvatars());
    }
    window.addEventListener("avatars:change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("avatars:change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return overrides;
}

function withOverride(job: Job, overrides: Record<string, string>): Job {
  const url = overrides[job.id] ?? job.modelUrl;
  return url ? { ...job, modelUrl: url } : job;
}

function Index() {
  const initialNav = useMemo(loadNav, []);
  const [stage, setStage] = useState<Stage>(initialNav.stage);
  const [selectedId, setSelectedId] = useState<string>(initialNav.selectedId);
  const overrides = useAvatarOverrides();
  const progress = useProgress();
  const earnedStars = JOBS.reduce((sum, j) => sum + (progress[j.id]?.bestStars ?? 0), 0);
  const maxStars = JOBS.length * 3;

  useEffect(() => {
    try {
      window.sessionStorage.setItem(NAV_STORAGE_KEY, JSON.stringify({ stage, selectedId }));
    } catch {
      // ignore quota / privacy-mode errors
    }
  }, [stage, selectedId]);

  const baseJob = useMemo(() => JOBS.find((j) => j.id === selectedId)!, [selectedId]);
  const job = withOverride(baseJob, overrides);

  function pickJob(j: Job) {
    setSelectedId(j.id);
    setStage("profile");
  }

  if (stage === "profile") {
    return <Profile job={job} onBack={() => setStage("select")} />;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-10 text-center sm:mb-14">
        <Badge className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-700 shadow-sm">
          <Sparkles className="h-4 w-4" /> Bolalar uchun o&apos;yin
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight text-slate-800 sm:text-6xl md:text-7xl">
          Kasblar{" "}
          <span className="relative inline-block">
            <span className="relative z-10 text-amber-600">shaharchasi</span>
            <span
              aria-hidden
              className="absolute -bottom-1 left-0 right-0 mx-auto h-1.5 w-[80%] rounded-full bg-amber-200/50"
            />
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
          Kasbingni tanla va qahramoningga to&apos;g&apos;ri asboblarni topib ber!
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-4 py-1.5 shadow-sm">
            <Star size={18} strokeWidth={1.6} style={{ color: "#F5B14C", fill: "#F5B14C" }} />
            <span className="text-sm font-semibold text-amber-700">
              {earnedStars} / {maxStars} yulduz
            </span>
          </div>
          {earnedStars > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Barcha yulduzlarni o'chirib, qaytadan boshlaymizmi?")) {
                  clearAllProgress();
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white/80 px-4 py-1.5 text-sm font-semibold text-rose-600 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-rose-50 hover:shadow"
            >
              <RotateCcw className="h-4 w-4" />
              Qayta boshlash
            </button>
          )}
        </div>
      </header>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {JOBS.map((rawJob) => {
          const j = withOverride(rawJob, overrides);
          const tint = JOB_TINTS[j.id] ?? DEFAULT_TINT;
          const hasAvatar = Boolean(j.modelUrl);
          const jobProgress = progress[j.id];
          const stars = jobProgress?.bestStars ?? 0;
          const completed = stars > 0;
          return (
            <Card
              key={j.id}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{
                background: tint.bg,
                borderColor: `${tint.ring}55`,
                boxShadow: "0 8px 24px -16px rgba(15,23,42,0.18)",
              }}
              onClick={() => pickJob(rawJob)}
            >
              {/* status pill in the corner — stars earned or "Yangi" */}
              <div
                className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 shadow-sm transition-transform group-hover:scale-105"
                title={completed ? `${stars}/3 yulduz` : "Hali o'ynalmagan"}
              >
                {completed ? (
                  <StarRow filled={stars} total={3} size={14} color={tint.ring} />
                ) : (
                  <span
                    className="px-1 text-[11px] font-bold uppercase tracking-wide"
                    style={{ color: tint.text }}
                  >
                    Yangi
                  </span>
                )}
              </div>

              <div className="relative overflow-hidden">
                {j.imageUrl ? (
                  <CharacterImage job={j} height={280} />
                ) : hasAvatar ? (
                  <CharacterGLB job={j} height={280} />
                ) : (
                  <Character3D job={j} height={280} />
                )}
              </div>

              <div className="px-5 pb-5 pt-3 text-center">
                <p className="text-2xl font-bold tracking-tight" style={{ color: tint.text }}>
                  {j.title}
                </p>
                <div className="mt-2 flex items-center justify-center">
                  <StarRow filled={stars} total={3} size={18} color={tint.ring} />
                </div>
              </div>
            </Card>
          );
        })}
      </section>
    </main>
  );
}

function Profile({ job, onBack }: { job: Job; onBack: () => void }) {
  const tint = JOB_TINTS[job.id] ?? DEFAULT_TINT;

  const pool = useMemo(() => {
    const correctNames = new Set(job.instruments.map((i) => i.name));
    const wrongPool: Instrument[] = [];
    for (const j of JOBS) {
      if (j.id === job.id) continue;
      for (const ins of j.instruments) {
        if (!correctNames.has(ins.name) && !wrongPool.find((w) => w.name === ins.name)) {
          wrongPool.push(ins);
        }
      }
    }
    const seed = job.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const wrongs = shuffle(wrongPool, seed).slice(0, 8);
    return shuffle([...job.instruments, ...wrongs], seed + 1);
  }, [job]);

  const correctSet = useMemo(() => new Set(job.instruments.map((i) => i.name)), [job]);

  const [equipped, setEquipped] = useState<Set<string>>(new Set());
  const [wrongPicks, setWrongPicks] = useState<Set<string>>(new Set());
  const [hidden, setHidden] = useState<Set<BodyPart>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [showLoss, setShowLoss] = useState(false);
  const [feedback, setFeedback] = useState<{ name: string; kind: "ok" | "bad" } | null>(null);

  useEffect(() => {
    setEquipped(new Set());
    setWrongPicks(new Set());
    setHidden(new Set());
    setError(null);
    setFailed(false);
    setCelebrate(false);
    setShowLoss(false);
    setFeedback(null);
  }, [job.id]);

  useEffect(() => {
    if (!feedback) return;
    const t = window.setTimeout(() => setFeedback(null), 1000);
    return () => window.clearTimeout(t);
  }, [feedback]);

  const allEquipped = equipped.size === job.instruments.length;
  const progress = (equipped.size / job.instruments.length) * 100;
  const earnedStars = allEquipped ? starsFromMistakes(wrongPicks.size) : 0;

  useEffect(() => {
    if (allEquipped && !failed) {
      recordJobResult(job.id, starsFromMistakes(wrongPicks.size));
      setCelebrate(true);
    }
  }, [allEquipped, failed, job.id, wrongPicks]);

  useEffect(() => {
    if (failed) {
      setShowLoss(true);
    }
  }, [failed]);

  function pick(ins: Instrument) {
    if (failed) return;
    if (equipped.has(ins.name) || wrongPicks.has(ins.name)) return;

    if (correctSet.has(ins.name)) {
      playCorrect();
      setEquipped((prev) => new Set(prev).add(ins.name));
      setError(null);
      setFeedback({ name: ins.name, kind: "ok" });
    } else {
      playWrong();
      setWrongPicks((prev) => new Set(prev).add(ins.name));
      setFeedback({ name: ins.name, kind: "bad" });
      const nextHidden = new Set(hidden);
      const part = PART_ORDER[hidden.size];
      if (part) nextHidden.add(part);
      setHidden(nextHidden);
      setError(`Oh-oh! "${ins.name}" ${job.title} uchun mos emas.`);
      if (nextHidden.size >= PART_ORDER.length) {
        setFailed(true);
      }
    }
  }

  function reset() {
    setEquipped(new Set());
    setWrongPicks(new Set());
    setHidden(new Set());
    setError(null);
    setFailed(false);
    setShowLoss(false);
    setCelebrate(false);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-5 rounded-full bg-white/70 px-5 text-slate-700 shadow-sm hover:bg-white"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Qaytish
      </Button>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Card
          className="relative flex flex-col overflow-hidden rounded-3xl border p-0"
          style={{
            background: tint.bg,
            borderColor: `${tint.ring}55`,
            boxShadow: "0 10px 30px -18px rgba(15,23,42,0.18)",
          }}
        >
          <div className="absolute right-4 top-4 z-10">
            <div
              className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold shadow"
              style={{ color: tint.text }}
            >
              <CheckCircle2 className="h-4 w-4" style={{ color: tint.ring }} />
              {equipped.size}/{job.instruments.length}
            </div>
          </div>

          <div className="aspect-square w-full sm:aspect-auto sm:min-h-[500px] sm:flex-1">
            {job.modelUrl ? (
              <CharacterGLB
                job={job}
                height="100%"
                damage={wrongPicks.size}
                failed={failed}
              />
            ) : job.imageUrl ? (
              <CharacterImage3D
                job={job}
                height="100%"
                damage={wrongPicks.size}
                failed={failed}
              />
            ) : (
              <Character3D job={job} height="100%" zoom={150} hiddenParts={hidden} />
            )}
          </div>

          {hidden.size > 0 && (
            <div className="mx-4 mb-3 rounded-2xl border-2 border-rose-300 bg-rose-50/90 px-4 py-2 text-center text-sm font-semibold text-rose-700">
              {failed
                ? "Voy! Qahramon parchalanib ketdi. Qaytadan urinib ko'r!"
                : `${hidden.size} ta tana qismi yo'qoldi. Ehtiyot bo'l!`}
            </div>
          )}

          <div
            className="border-t px-6 py-5 text-center"
            style={{ borderColor: `${tint.ring}33`, backgroundColor: "rgba(255,255,255,0.6)" }}
          >
            <p className="text-3xl font-bold tracking-tight" style={{ color: tint.text }}>
              {job.title}
            </p>
            {/* progress bar */}
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/70">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${progress}%`,
                  background: tint.ring,
                }}
              />
            </div>
          </div>
        </Card>

        <div>
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl border-2 border-rose-300 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 shadow-sm animate-pop-in">
              <XCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {pool.map((ins) => {
              const ok = equipped.has(ins.name);
              const wrong = wrongPicks.has(ins.name);
              const color = getToolColor(ins.name);
              const disabled = ok || wrong || failed;
              const showFb = feedback?.name === ins.name;

              const baseStyle: React.CSSProperties = {
                background: color.bg,
                borderColor: ok ? color.ring : color.border,
                color: color.text,
              };
              const okStyle: React.CSSProperties = ok
                ? { boxShadow: `0 0 0 2px ${color.ring}55` }
                : {};

              return (
                <button
                  key={ins.name}
                  onClick={() => pick(ins)}
                  disabled={disabled}
                  className={`group relative flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all duration-200 sm:p-5 ${
                    disabled
                      ? wrong
                        ? "opacity-60 saturate-50"
                        : "cursor-default"
                      : "hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                  }`}
                  style={{ ...baseStyle, ...okStyle }}
                >
                  {showFb && (
                    <div
                      key={`${feedback?.kind}-${ins.name}`}
                      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center animate-feedback-pop"
                    >
                      <div
                        className="flex h-20 w-20 items-center justify-center rounded-full shadow-xl sm:h-24 sm:w-24"
                        style={{
                          backgroundColor: feedback?.kind === "ok" ? "#10B981" : "#EF4444",
                        }}
                      >
                        {feedback?.kind === "ok" ? (
                          <Smile
                            className="h-12 w-12 text-white sm:h-14 sm:w-14"
                            strokeWidth={2.2}
                          />
                        ) : (
                          <Frown
                            className="h-12 w-12 text-white sm:h-14 sm:w-14"
                            strokeWidth={2.2}
                          />
                        )}
                      </div>
                    </div>
                  )}
                  {ok && (
                    <div
                      className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full text-white shadow-md animate-pop-in"
                      style={{ backgroundColor: color.ring }}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  )}
                  {wrong && (
                    <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-white shadow-md">
                      <XCircle className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl transition-transform group-hover:rotate-[-6deg] group-hover:scale-110 sm:h-20 sm:w-20"
                    style={{ backgroundColor: "rgba(255,255,255,0.7)" }}
                  >
                    <InstrumentIcon name={ins.name} size={44} style={{ color: color.icon }} />
                  </div>

                  <div className="mt-3 text-sm font-bold sm:text-base">{ins.name}</div>
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            <Button
              variant="outline"
              onClick={reset}
              className="w-full rounded-2xl border-2 border-slate-300 bg-white text-base font-bold text-slate-700 hover:bg-slate-50"
              size="lg"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Qaytadan Boshlash
            </Button>
          </div>
        </div>
      </div>

      <CongratulationsModal
        open={celebrate}
        jobTitle={job.title}
        stars={earnedStars}
        onClose={() => {
          setCelebrate(false);
          onBack();
        }}
      />

      <GameOverModal open={showLoss} onTryAgain={reset} />
    </main>
  );
}
