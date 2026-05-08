import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { JOBS, type Job, type Instrument } from "@/lib/jobs";
import { Character3D, type BodyPart } from "@/components/Character3D";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kasb Sarguzashti 3D — Kasbni Tanla, Kunni Yasha" },
      {
        name: "description",
        content:
          "3D xarakter profillarini ko'rib chiqing, ish asboblarini jihozlang va bu rol o'ynash simulyatsiya o'yinida smenangizni boshlang.",
      },
    ],
  }),
  component: Index,
});

type Stage = "select" | "profile" | "playing";

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

function Index() {
  const [stage, setStage] = useState<Stage>("select");
  const [selectedId, setSelectedId] = useState<string>(JOBS[0].id);

  const job = useMemo(() => JOBS.find((j) => j.id === selectedId)!, [selectedId]);

  function pickJob(j: Job) {
    setSelectedId(j.id);
    setStage("profile");
  }

  if (stage === "playing") {
    return <Playing job={job} onExit={() => setStage("select")} />;
  }

  if (stage === "profile") {
    return (
      <Profile
        job={job}
        onBack={() => setStage("select")}
        onStart={() => setStage("playing")}
      />
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <header className="mb-12 text-center">
        <Badge className="mb-4 bg-accent/20 text-accent-foreground border border-accent/40">
          Rol O'ynash Simulyatsiyasi
        </Badge>
        <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
          Kasb <span className="text-primary">Sarguzashti</span> 3D
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Xarakter profillarini ko'rib chiqing, to'g'ri ish asboblarini jihozlang va o'zingiz tanlagan har qanday kasbda bir kunni boshlang.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {JOBS.map((j) => (
          <Card
            key={j.id}
            className="group cursor-pointer overflow-hidden border-border bg-[var(--gradient-card)] p-0 transition-all hover:scale-[1.02] hover:shadow-[var(--shadow-glow)]"
            onClick={() => pickJob(j)}
          >
            <div className="bg-background/30">
              <Character3D job={j} height={260} />
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{j.name}</h3>
                <span className="text-2xl">{j.toolEmoji}</span>
              </div>
              <p className="text-sm font-medium text-primary">{j.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{j.tagline}</p>
              <Button className="mt-4 w-full" variant="default">
                Profilni Ko'rish
              </Button>
            </div>
          </Card>
        ))}
      </section>
    </main>
  );
}

function Profile({
  job,
  onBack,
  onStart,
}: {
  job: Job;
  onBack: () => void;
  onStart: () => void;
}) {
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
    const wrongs = shuffle(wrongPool, seed).slice(0, 4);
    return shuffle([...job.instruments, ...wrongs], seed + 1);
  }, [job]);

  const correctSet = useMemo(
    () => new Set(job.instruments.map((i) => i.name)),
    [job],
  );

  const [equipped, setEquipped] = useState<Set<string>>(new Set());
  const [wrongPicks, setWrongPicks] = useState<Set<string>>(new Set());
  const [hidden, setHidden] = useState<Set<BodyPart>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  // Reset whenever job changes
  useEffect(() => {
    setEquipped(new Set());
    setWrongPicks(new Set());
    setHidden(new Set());
    setError(null);
    setFailed(false);
  }, [job.id]);

  const allEquipped = equipped.size === job.instruments.length;

  function pick(ins: Instrument) {
    if (failed) return;
    if (equipped.has(ins.name) || wrongPicks.has(ins.name)) return;

    if (correctSet.has(ins.name)) {
      setEquipped((prev) => new Set(prev).add(ins.name));
      setError(null);
    } else {
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
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        ← Xarakterlarga Qaytish
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="overflow-hidden border-border bg-[var(--gradient-card)] p-0">
          <Character3D job={job} height={460} hiddenParts={hidden} />
          {hidden.size > 0 && (
            <div className="border-t border-border bg-destructive/10 px-4 py-2 text-center text-xs text-destructive">
              {failed
                ? "Xarakteringiz parchalanib ketdi! Qayta boshlang va qaytadan urinib ko'ring."
                : `${hidden.size} tana qismi yo'qoldi. Ehtiyotkorlik bilan tanlang!`}
            </div>
          )}
        </Card>

        <div>
          <Badge className="mb-3 bg-primary/20 text-primary border border-primary/40">
            {job.title}
          </Badge>
          <h2 className="text-4xl font-bold">{job.name}</h2>
          <p className="mt-2 text-lg text-muted-foreground">{job.description}</p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {(["skill", "speed", "creativity"] as const).map((k) => (
              <div key={k} className="rounded-lg border border-border bg-card/50 p-3">
                <div className="text-xs uppercase text-muted-foreground">
                  {k === "skill" ? "mahorat" : k === "speed" ? "tezlik" : "ijodkorlik"}
                </div>
                <div className="text-2xl font-bold text-primary">{job.stats[k]}</div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${job.stats[k]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Jihozlar Muammosi</h3>
              <span className="text-sm text-muted-foreground">
                {equipped.size}/{job.instruments.length} to'g'ri
              </span>
            </div>
            <p className="mb-3 text-sm text-muted-foreground">
              Asboblar boshqa ishlardan olingan narsalar bilan aralashtirilgan. Faqat {job.title}{" "}
              haqiqatda foydalanadigan narsalarni tanlang — noto'g'ri tanlovlar xarakteringizni parchalaydi!
            </p>

            {error && (
              <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {pool.map((ins) => {
                const ok = equipped.has(ins.name);
                const wrong = wrongPicks.has(ins.name);
                return (
                  <button
                    key={ins.name}
                    onClick={() => pick(ins)}
                    disabled={ok || wrong || failed}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      ok
                        ? "border-primary bg-primary/10 shadow-[var(--shadow-glow)]"
                        : wrong
                          ? "border-destructive/60 bg-destructive/10 opacity-60"
                          : "border-border bg-card/50 hover:border-primary/50"
                    }`}
                  >
                    <div className="text-3xl">{ins.emoji}</div>
                    <div className="mt-2 text-sm font-medium">{ins.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {ok ? "✓ Jihozlangan" : wrong ? "✗ Noto'g'ri asbob" : "Jihozlash uchun bosing"}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={reset} className="flex-1">
                Muammoni Qayta Boshlash
              </Button>
              <Button
                className="flex-1"
                size="lg"
                disabled={!allEquipped || failed}
                onClick={onStart}
              >
                {failed
                  ? "Xarakter buzilgan — qayta boshlang"
                  : allEquipped
                    ? "Smenani Boshlash →"
                    : "To'g'ri asboblarni tanlang"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Playing({ job, onExit }: { job: Job; onExit: () => void }) {
  const [score, setScore] = useState(0);
  const [task, setTask] = useState(0);

  const tasks = job.instruments.map((i) => `${i.name}dan foydalaning ${i.emoji}`);

  function doTask() {
    setScore((s) => s + 10 + Math.floor(Math.random() * 15));
    setTask((t) => (t + 1) % tasks.length);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={onExit}>← Smenani Tugatish</Button>
        <div className="rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
          Ball: {score}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="overflow-hidden border-border bg-[var(--gradient-card)] p-0">
          <Character3D job={job} height={420} />
        </Card>

        <div>
          <h2 className="text-3xl font-bold">{job.name} smenada</h2>
          <p className="mt-1 text-muted-foreground">{job.title}</p>

          <Card className="mt-6 border-border bg-card/60 p-6">
            <div className="text-sm uppercase text-muted-foreground">Joriy vazifa</div>
            <div className="mt-2 text-2xl font-bold">{tasks[task]}</div>
            <Button className="mt-6 w-full" size="lg" onClick={doTask}>
              Vazifani Bajarish
            </Button>
          </Card>

          <div className="mt-6 grid grid-cols-5 gap-2">
            {job.instruments.map((i) => (
              <div
                key={i.name}
                className="rounded-lg border border-border bg-card/50 p-3 text-center text-2xl"
                title={i.name}
              >
                {i.emoji}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
