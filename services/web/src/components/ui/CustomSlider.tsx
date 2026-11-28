import React, { useRef } from "react";

type SliderSize = "sm" | "md";

interface CustomSliderProps {
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
    active?: boolean;
    size?: SliderSize;
    ariaLabel?: string;
    className?: string;
    ringClassName?: string;
}

const SIZE_STYLES: Record<SliderSize, { wrapper: string; track: string; thumb: string }> = {
    sm: { wrapper: "h-5", track: "h-1.5", thumb: "w-1.5 h-4 ring-[3px]" },
    md: { wrapper: "h-8", track: "h-2.5", thumb: "w-2.5 h-7 ring-[5px]" },
};

export function CustomSlider({
    value,
    min,
    max,
    step = 1,
    onChange,
    active = true,
    size = "md",
    ariaLabel,
    className = "",
    ringClassName = "ring-neutral-900",
}: CustomSliderProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const percent = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
    const s = SIZE_STYLES[size];

    const snapValue = (raw: number) => {
        const stepped = Math.round((raw - min) / step) * step + min;
        const clamped = Math.max(min, Math.min(max, stepped));
        return Number(clamped.toFixed(4));
    };

    const updateFromClientX = (clientX: number) => {
        const rect = trackRef.current?.getBoundingClientRect();
        if (!rect || rect.width === 0) return;
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        onChange(snapValue(min + ratio * (max - min)));
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault();
        trackRef.current?.focus();
        updateFromClientX(e.clientX);

        const onMove = (moveEvent: PointerEvent) => updateFromClientX(moveEvent.clientX);
        const onUp = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            onChange(snapValue(value - step));
        } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            onChange(snapValue(value + step));
        } else if (e.key === "Home") {
            e.preventDefault();
            onChange(min);
        } else if (e.key === "End") {
            e.preventDefault();
            onChange(max);
        }
    };

    return (
        <div
            ref={trackRef}
            role="slider"
            tabIndex={0}
            aria-label={ariaLabel}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            onPointerDown={handlePointerDown}
            onKeyDown={handleKeyDown}
            className={`relative flex items-center ${s.wrapper} select-none group cursor-pointer focus:outline-none ${className}`}
        >
            <div className={`w-full ${s.track} rounded-full bg-neutral-700/70 overflow-hidden pointer-events-none`}>
                <div
                    style={{ width: `${percent}%` }}
                    className={`h-full rounded-full transition-colors ${
                        active ? "bg-emerald-400" : "bg-neutral-500"
                    }`}
                />
            </div>

            <div
                style={{ left: `${percent}%` }}
                className={`pointer-events-none absolute -translate-x-1/2 ${s.thumb} rounded-full ${ringClassName} transition-transform duration-100 group-hover:scale-y-110 group-focus-visible:scale-y-110 ${
                    active ? "bg-neutral-100" : "bg-neutral-400"
                }`}
            />
        </div>
    );
}
