import type React from "react";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (value: number) => void;
}

export function ProgressBar({ currentTime, duration, onSeek }: ProgressBarProps) {
  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * duration);
  };

  return (
    <div
      onClick={handleClick}
      className="relative w-full h-1 bg-neutral-800 hover:h-2 transition-all cursor-pointer group"
    >
      <div
        className="h-full bg-white rounded-r transition-[width] duration-150"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
