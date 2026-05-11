import type { Job } from "@/lib/jobs";

export function CharacterImage({
  job,
  height = 280,
  className,
}: {
  job: Job;
  height?: number | string;
  className?: string;
}) {
  const cssHeight = typeof height === "number" ? `${height}px` : height;
  if (!job.imageUrl) return null;
  return (
    <div
      className={`relative flex items-center justify-center ${className ?? ""}`}
      style={{ height: cssHeight, width: "100%" }}
    >
      <img
        src={job.imageUrl}
        alt={job.title}
        loading="lazy"
        decoding="async"
        className="character-float h-full w-auto max-w-full object-contain drop-shadow-lg"
        draggable={false}
      />
    </div>
  );
}
