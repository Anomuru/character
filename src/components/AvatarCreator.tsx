import { useEffect, useMemo, useState } from "react";
import { JOBS, type Job } from "@/lib/jobs";
import { setAvatarUrl, getAllAvatars, clearAvatarUrl } from "@/lib/avatarStore";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onClose: () => void;
  initialJobId?: string;
};

const RPM_URL = "https://readyplayer.me/avatar";

function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  // Accept full GLB URL or just the avatar ID
  if (trimmed.startsWith("http") && trimmed.endsWith(".glb")) return trimmed;
  if (/^[a-f0-9]{18,32}$/i.test(trimmed)) {
    return `https://models.readyplayer.me/${trimmed}.glb`;
  }
  // If user pasted a URL like https://readyplayer.me/gallery/xxxx, extract id
  const idMatch = trimmed.match(/([a-f0-9]{18,32})/i);
  if (idMatch) return `https://models.readyplayer.me/${idMatch[1]}.glb`;
  return null;
}

export function AvatarCreator({ open, onClose, initialJobId }: Props) {
  const [selectedJob, setSelectedJob] = useState<Job>(
    JOBS.find((j) => j.id === initialJobId) ?? JOBS[0],
  );
  const [input, setInput] = useState("");
  const [overrides, setOverrides] = useState<Record<string, string>>(() => getAllAvatars());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function refresh() {
      setOverrides(getAllAvatars());
    }
    window.addEventListener("avatars:change", refresh);
    return () => window.removeEventListener("avatars:change", refresh);
  }, []);

  useEffect(() => {
    if (initialJobId) {
      const job = JOBS.find((j) => j.id === initialJobId);
      if (job) {
        setSelectedJob(job);
        setInput(getAllAvatars()[job.id] ?? "");
        setError(null);
      }
    }
  }, [initialJobId, open]);

  const previewUrl = useMemo(() => normalizeUrl(input), [input]);

  function save() {
    const url = normalizeUrl(input);
    if (!url) {
      setError("URL noto'g'ri. To'liq .glb havolasini joylashtiring.");
      return;
    }
    setAvatarUrl(selectedJob.id, url);
    setError(null);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border bg-background/60 p-4">
          <div>
            <h2 className="text-lg font-bold">Avatar Yaratuvchisi</h2>
            <p className="text-xs text-muted-foreground">
              Ready Player Me-da avatar yarating va URL'ni shu yerga joylashtiring.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Yopish
          </Button>
        </div>

        <div className="overflow-y-auto p-6">
          <ol className="mb-6 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li>
              <a
                href={RPM_URL}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-primary underline"
              >
                readyplayer.me/avatar
              </a>{" "}
              ni yangi varaqda oching
            </li>
            <li>Tanlangan kasbga mos kiyim, soch va aksessuarlar bilan avatar yarating</li>
            <li>
              "Next" → "Use as your avatar" → menyudan{" "}
              <span className="font-mono text-foreground">.glb</span> URL'ni nusxalang
            </li>
            <li>Pastdagi maydonga joylashtiring va saqlang</li>
          </ol>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">Kasbni Tanlang</label>
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={selectedJob.id}
              onChange={(e) => {
                const job = JOBS.find((j) => j.id === e.target.value);
                if (job) {
                  setSelectedJob(job);
                  setInput(overrides[job.id] ?? "");
                  setError(null);
                }
              }}
            >
              {JOBS.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                  {overrides[j.id] ? " ✓" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-2">
            <label className="mb-1 block text-sm font-medium">
              Avatar URL ({selectedJob.title})
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(null);
              }}
              placeholder="https://models.readyplayer.me/abc123.glb"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono"
            />
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
            {previewUrl && !error && (
              <p className="mt-1 text-xs text-muted-foreground">
                ✓ Saqlash uchun tayyor: <span className="font-mono">{previewUrl}</span>
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={save} disabled={!previewUrl} className="flex-1">
              Saqlash
            </Button>
            {overrides[selectedJob.id] && (
              <Button
                variant="outline"
                onClick={() => {
                  clearAvatarUrl(selectedJob.id);
                  setInput("");
                }}
              >
                O'chirish
              </Button>
            )}
          </div>

          <div className="mt-6 rounded-lg border border-border bg-background/40 p-4">
            <h3 className="mb-2 text-sm font-semibold">Saqlangan Avatarlar</h3>
            <ul className="space-y-1 text-xs">
              {JOBS.map((j) => (
                <li key={j.id} className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">{j.title}</span>
                  <span className={overrides[j.id] ? "text-primary" : "text-muted-foreground/50"}>
                    {overrides[j.id] ? "✓ saqlangan" : "— yo'q"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
