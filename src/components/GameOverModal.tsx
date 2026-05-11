import { useEffect } from "react";
import { Frown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playLoss } from "@/lib/sounds";

interface GameOverModalProps {
  open: boolean;
  onTryAgain: () => void;
}

export function GameOverModal({ open, onTryAgain }: GameOverModalProps) {
  useEffect(() => {
    if (!open) return;
    playLoss();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-destructive/50 bg-card p-10 text-center shadow-[0_0_60px_-15px_hsl(var(--destructive)/0.55)] animate-in zoom-in-95 fade-in duration-300">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/15">
          <Frown className="h-10 w-10 text-destructive" strokeWidth={1.5} />
        </div>
        <h2 className="mt-6 text-3xl font-bold tracking-tight">Mag'lubiyat</h2>
        <p className="mt-3 text-muted-foreground">
          Xarakteringiz parchalanib ketdi. Qaytadan urinib ko'ring va to'g'ri asboblarni tanlang.
        </p>
        <Button className="mt-8 w-full" size="lg" variant="destructive" onClick={onTryAgain}>
          Qaytadan Urinish
        </Button>
      </div>
    </div>
  );
}
