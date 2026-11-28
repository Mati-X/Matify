import { Volume2, VolumeX, Volume1 } from "lucide-react";
import { CustomSlider } from "../ui/CustomSlider";

interface VolumeProps {
  volume: number;
  onVolumeChange: (val: number) => void;
  isMuted: boolean;
}

export function VolumeControl({ volume, onVolumeChange, isMuted }: VolumeProps) {
  const renderVolumeIcon = () => {
    if (volume === 0 || isMuted) {
      return <VolumeX className="w-4 h-4 text-neutral-400" />;
    }
    if (volume < 0.5) {
      return <Volume1 className="w-4 h-4 text-neutral-400" />;
    }
    return <Volume2 className="w-4 h-4 text-neutral-400" />;
  };

  return (
    <div className="flex items-center justify-end gap-3 w-64 min-w-[200px]">
      {renderVolumeIcon()}
      <CustomSlider
        ariaLabel="Volume"
        size="sm"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        active={!isMuted && volume > 0}
        onChange={onVolumeChange}
        className="w-28"
        ringClassName="ring-neutral-950"
      />
      <span className="text-xs text-neutral-400 font-mono w-9 text-right">
        {Math.round(volume * 100)}%
      </span>
    </div>
  );
}
