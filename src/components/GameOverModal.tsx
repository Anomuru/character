import { useEffect } from "react";
import { Frown, RotateCw } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-xl animate-in zoom-in-95 fade-in duration-300 sm:p-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-rose-200 bg-rose-50 sm:h-24 sm:w-24">
          <Frown className="h-10 w-10 text-rose-500 sm:h-12 sm:w-12" strokeWidth={1.8} />
        </div>

        <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
          Oh, qaytadan!
        </h2>
        <p className="mt-3 text-base text-slate-600 sm:text-lg">
          Qahramonimiz bir oz qiynaldi. Yana bir bor urinib ko&apos;ramizmi?
        </p>

        <Button
          className="mt-7 w-full rounded-xl bg-rose-500 text-base font-semibold text-white hover:bg-rose-600"
          size="lg"
          onClick={onTryAgain}
        >
          <RotateCw className="mr-2 h-4 w-4" /> Qayta urinish
        </Button>
      </div>
    </div>
  );
}
