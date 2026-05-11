import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { JOBS, type Job, type Instrument } from "@/lib/jobs";
import { Character3D, type BodyPart } from "@/components/Character3D";
import { CharacterGLB } from "@/components/CharacterGLB";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllAvatars } from "@/lib/avatarStore";
import { InstrumentIcon } from "@/lib/instrument-icons";
import { playCorrect, playWrong } from "@/lib/sounds";
import { CongratulationsModal } from "@/components/CongratulationsModal";
import { GameOverModal } from "@/components/GameOverModal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kasblar shaharchasi" },
      {
        name: "description",
        content:
          "3D xarakter profillarini ko'rib chiqing, ish asboblarini jihozlang va bu rol o'ynash simulyatsiya o'yinida smenangizni boshlang.",
      },
    ],
  }),
  component: Index,
});

type Stage = "select" | "profile";

const PART_ORDER: BodyPart[] = [
  "hat",
  "leftArm",
  "rightArm",
  "leftLeg",
  "rightLeg",
  "torso",
  "head",
];

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
  const [stage, setStage] = useState<Stage>("select");
  const [selectedId, setSelectedId] = useState<string>(JOBS[0].id);
  const overrides = useAvatarOverrides();

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
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
      <header className="mb-8 text-center sm:mb-10 lg:mb-12">
        <Badge className="mb-3 bg-accent/20 text-accent-foreground border border-accent/40 sm:mb-4">
          Rol O'ynash Simulyatsiyasi
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Kasblar <span className="text-primary">shaharchasi</span>
        </h1>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {JOBS.map((rawJob) => {
          const j = withOverride(rawJob, overrides);
          const hasAvatar = Boolean(j.modelUrl);
          return (
            <Card
              key={j.id}
              className="group cursor-pointer overflow-hidden border-border bg-[var(--gradient-card)] p-0 transition-all hover:scale-[1.02] hover:shadow-[var(--shadow-glow)]"
              onClick={() => pickJob(rawJob)}
            >
              <div className="bg-background/30">
                {hasAvatar ? (
                  <CharacterGLB job={j} height={220} />
                ) : (
                  <Character3D job={j} height={220} />
                )}
              </div>
              <div className="p-4 text-center sm:p-5">
                <p className="text-lg font-bold text-primary sm:text-xl">{j.title}</p>
              </div>
            </Card>
          );
        })}
      </section>
    </main>
  );
}

function Profile({ job, onBack }: { job: Job; onBack: () => void }) {
  // Mixed pool: correct instruments + 4 wrong ones from other jobs, shuffled.
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

  // Reset whenever job changes
  useEffect(() => {
    setEquipped(new Set());
    setWrongPicks(new Set());
    setHidden(new Set());
    setError(null);
    setFailed(false);
    setCelebrate(false);
    setShowLoss(false);
  }, [job.id]);

  const allEquipped = equipped.size === job.instruments.length;

  // Trigger celebration the first time all correct tools are equipped
  useEffect(() => {
    if (allEquipped && !failed) {
      setCelebrate(true);
    }
  }, [allEquipped, failed]);

  // Trigger game-over modal when the character is fully broken
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
    } else {
      playWrong();
      setWrongPicks((prev) => new Set(prev).add(ins.name));
      const nextHidden = new Set(hidden);
      const part = PART_ORDER[hidden.size];
      if (part) nextHidden.add(part);
      setHidden(nextHidden);
      setError(`❌ "${ins.name}" ${job.title}ning asbobi emas!`);
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
      <Button variant="ghost" onClick={onBack} className="mb-4 sm:mb-6">
        ← Xarakterlarga Qaytish
      </Button>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
        <Card className="flex flex-col overflow-hidden border-border bg-[var(--gradient-card)] p-0">
          <div className="aspect-square w-full sm:aspect-auto sm:min-h-[500px] sm:flex-1">
            {job.modelUrl ? (
              <CharacterGLB job={job} height="100%" />
            ) : (
              <Character3D job={job} height="100%" zoom={150} hiddenParts={hidden} />
            )}
          </div>
          {hidden.size > 0 && (
            <div className="border-t border-border bg-destructive/10 px-4 py-2 text-center text-xs text-destructive">
              {failed
                ? "Xarakteringiz parchalanib ketdi! Qayta boshlang va qaytadan urinib ko'ring."
                : `${hidden.size} tana qismi yo'qoldi. Ehtiyotkorlik bilan tanlang!`}
            </div>
          )}
          <div className="border-t border-border bg-background/40 px-6 py-5 text-center">
            <p className="text-2xl font-bold tracking-tight text-primary">{job.title}</p>
          </div>
        </Card>

        <div>
          {error && (
            <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {pool.map((ins) => {
              const ok = equipped.has(ins.name);
              const wrong = wrongPicks.has(ins.name);
              return (
                <button
                  key={ins.name}
                  onClick={() => pick(ins)}
                  disabled={ok || wrong || failed}
                  className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all sm:p-6 ${
                    ok
                      ? "border-primary bg-primary/10 shadow-[var(--shadow-glow)]"
                      : wrong
                        ? "border-destructive/60 bg-destructive/10 opacity-60"
                        : "border-border bg-card/50 hover:border-primary/50 hover:bg-card/80"
                  }`}
                >
                  <InstrumentIcon
                    name={ins.name}
                    size={48}
                    className={
                      ok ? "text-primary" : wrong ? "text-destructive" : "text-foreground/80"
                    }
                  />
                  <div className="mt-3 text-sm font-semibold sm:mt-4 sm:text-base">{ins.name}</div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 sm:mt-6">
            <Button variant="outline" onClick={reset} className="w-full">
              Muammoni Qayta Boshlash
            </Button>
          </div>
        </div>
      </div>

      <CongratulationsModal
        open={celebrate}
        jobTitle={job.title}
        onClose={() => {
          setCelebrate(false);
          onBack();
        }}
      />

      <GameOverModal open={showLoss} onTryAgain={reset} />
    </main>
  );
}
