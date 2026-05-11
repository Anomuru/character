import { useEffect, useState } from "react";
import { Music, VolumeX } from "lucide-react";
import { BG_MUSIC_EVENT, getBgEnabled, toggleBgEnabled } from "@/lib/bgMusic";

export function MusicToggle() {
  const [on, setOn] = useState<boolean>(false);

  useEffect(() => {
    setOn(getBgEnabled());
    const sync = () => setOn(getBgEnabled());
    window.addEventListener(BG_MUSIC_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(BG_MUSIC_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={toggleBgEnabled}
      aria-pressed={on}
      aria-label={on ? "Musiqani o'chirish" : "Musiqani yoqish"}
      title={on ? "Musiqani o'chirish" : "Musiqani yoqish"}
      className="fixed right-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-amber-200 bg-white/90 text-amber-700 shadow-md backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white hover:text-amber-600 hover:shadow-lg active:translate-y-0 active:scale-95 sm:h-12 sm:w-12"
    >
      {on ? (
        <Music className="h-5 w-5" strokeWidth={2.2} />
      ) : (
        <VolumeX className="h-5 w-5" strokeWidth={2.2} />
      )}
    </button>
  );
}
