import { useEffect } from "react";
import confetti from "canvas-confetti";
import { PartyPopper } from "lucide-react";
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

    const colors = ["#f97316", "#fbbf24", "#a855f7", "#22d3ee", "#34d399"];

    confetti({
      particleCount: 140,
      spread: 110,
      origin: { y: 0.55 },
      colors,
      startVelocity: 45,
    });

    const duration = 2500;
    const end = Date.now() + duration;
    let raf = 0;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 70,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-primary/40 bg-card p-6 text-center shadow-[var(--shadow-glow)] animate-in zoom-in-95 fade-in duration-300 sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 sm:h-20 sm:w-20">
          <PartyPopper className="h-8 w-8 text-primary sm:h-10 sm:w-10" strokeWidth={1.5} />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight sm:mt-6 sm:text-3xl">
          Tabriklaymiz!
        </h2>
        <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
          Siz <span className="font-semibold text-primary">{jobTitle}</span>ning barcha asboblarini
          to'g'ri topdingiz!
        </p>
        <Button className="mt-6 w-full sm:mt-8" size="lg" onClick={onClose}>
          Davom etish
        </Button>
      </div>
    </div>
  );
}
