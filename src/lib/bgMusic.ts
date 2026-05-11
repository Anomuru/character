// Background music controller.
// Default OFF. User toggles it on; preference persists in localStorage.
// Autoplay policy: browsers block audio until a user gesture, so we only
// call play() inside the click handler that flips the toggle on.

const KEY = "kasb-bg-music-v1";
const SRC = "/sounds/bg-music.mp3";
const VOLUME = 0.15;
export const BG_MUSIC_EVENT = "bg-music:change";

let audio: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement | null {
  if (typeof Audio === "undefined") return null;
  if (audio) return audio;
  try {
    audio = new Audio(SRC);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = VOLUME;
    return audio;
  } catch {
    return null;
  }
}

export function getBgEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setBgEnabled(on: boolean) {
  try {
    window.localStorage.setItem(KEY, on ? "1" : "0");
  } catch {
    // privacy mode / quota — UI still reflects the toggle for this tab
  }
  const a = getAudio();
  if (a) {
    if (on) {
      const p = a.play();
      if (p && typeof p.then === "function") {
        p.catch(() => {
          // autoplay blocked — clear the preference so the icon shows muted
          try {
            window.localStorage.setItem(KEY, "0");
          } catch {
            // ignore
          }
          window.dispatchEvent(new Event(BG_MUSIC_EVENT));
        });
      }
    } else {
      a.pause();
    }
  }
  window.dispatchEvent(new Event(BG_MUSIC_EVENT));
}

export function toggleBgEnabled() {
  setBgEnabled(!getBgEnabled());
}
