import { useEffect } from "react";
import confetti from "canvas-confetti";
import { PartyPopper, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playCelebration } from "@/lib/sounds";

interface CongratulationsModalProps {
  open: boolean;
  jobTitle: string;
  onClose: () => void;
}

export function CongratulationsModal({ open, jobTitle, onClose }: CongratulationsModalProps) {
  useEffect(() => {
    if (!open) return;

    playCelebration();

    const colors = ["#f97316", "#fbbf24", "#a855f7", "#22d3ee", "#34d399", "#ec4899"];

    confetti({
      particleCount: 160,
      spread: 120,
      origin: { y: 0.55 },
      colors,
      startVelocity: 50,
    });

    const duration = 2800;
    const end = Date.now() + duration;
    let raf = 0;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 75,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 75,
        origin: { x: 1, y: 0.7 },
        colors,
      });
      if (Date.now() < end) {
        raf = requestAnimationFrame(frame);
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-xl animate-in zoom-in-95 fade-in duration-300 sm:p-10">
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
          <div className="absolute inset-0 rounded-full bg-amber-50 border border-amber-200" />
          <Trophy className="relative h-10 w-10 text-amber-600 sm:h-12 sm:w-12" strokeWidth={1.8} />
          <PartyPopper
            className="absolute -right-1.5 -top-1.5 h-6 w-6 text-amber-500"
            strokeWidth={1.8}
          />
        </div>

        <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
          Zo&apos;r ish!
        </h2>
        <p className="mt-3 text-base text-slate-600 sm:text-lg">
          Sen <span className="font-bold text-amber-700">{jobTitle}</span>ning barcha asboblarini
          topding!
        </p>

        <div className="mt-5 flex items-center justify-center gap-1.5 text-amber-400">
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className="text-2xl animate-bounce"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              ⭐
            </span>
          ))}
        </div>

        <Button
          className="mt-7 w-full rounded-xl bg-amber-600 text-base font-semibold text-white hover:bg-amber-700"
          size="lg"
          onClick={onClose}
        >
          Yana o&apos;ynash
        </Button>
      </div>
    </div>
  );
}
