import React, { useEffect, useRef, useState } from "react";
import { EQ_BANDS } from "../../store/useEqualizerStore.ts";

interface EqCurveGraphProps {
    gains: Record<string, number>;
    enabled: boolean;
    activePresetId?: string | null;
    onChangeBand?: (band: string, db: number) => void;
}

function EqCurveGraph({ gains, enabled, activePresetId, onChangeBand }: EqCurveGraphProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const currentGainsRef = useRef<Record<string, number>>(enabled ? { ...gains } : {});
    const [displayGains, setDisplayGains] = useState<Record<string, number>>(() =>
        enabled ? { ...gains } : {}
    );

    useEffect(() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const shouldAnimate = Boolean(activePresetId) && !reduced;

        if (!shouldAnimate) {
            const next: Record<string, number> = {};
            for (const band of EQ_BANDS) {
                next[band] = enabled ? (gains[band] ?? 0) : 0;
            }
            currentGainsRef.current = next;
            setDisplayGains(next);
            return;
        }

        let rafId = 0;
        const step = () => {
            let done = true;
            const next: Record<string, number> = {};
            for (const band of EQ_BANDS) {
                const target = enabled ? (gains[band] ?? 0) : 0;
                const current = currentGainsRef.current[band] ?? 0;
                const diff = target - current;
                if (Math.abs(diff) > 0.03) {
                    done = false;
                    next[band] = current + diff * 0.22;
                } else {
                    next[band] = target;
                }
            }
            currentGainsRef.current = next;
            setDisplayGains(next);
            if (!done) {
                rafId = requestAnimationFrame(step);
            }
        };

        rafId = requestAnimationFrame(step);
        return () => cancelAnimationFrame(rafId);
    }, [gains, enabled, activePresetId]);

    const width = 800;
    const height = 220;
    const padX = 24;
    const midY = height / 2;
    const maxOffsetY = midY - 22;

    const points = EQ_BANDS.map((band, index) => {
        const db = displayGains[band] ?? 0;
        return {
            band,
            x: padX + (index / (EQ_BANDS.length - 1)) * (width - padX * 2),
            y: midY - (db / 12) * maxOffsetY,
        };
    });

    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i - 1] ?? points[i];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2] ?? p2;

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        linePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    const handleBandDrag = (band: string) => (e: React.PointerEvent<SVGCircleElement>) => {
        if (!onChangeBand || !svgRef.current) return;
        e.preventDefault();

        const updateFromPointer = (clientY: number) => {
            const rect = svgRef.current?.getBoundingClientRect();
            if (!rect) return;
            const svgY = ((clientY - rect.top) / rect.height) * height;
            const rawDb = ((midY - svgY) / maxOffsetY) * 12;
            const clampedDb = Math.max(-12, Math.min(12, Math.round(rawDb * 2) / 2));
            onChangeBand(band, clampedDb);
        };

        updateFromPointer(e.clientY);

        const onMove = (moveEvent: PointerEvent) => updateFromPointer(moveEvent.clientY);
        const onUp = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
    };

    return (
        <svg ref={svgRef} viewBox="0 0 800 220" className="w-full h-64 select-none overflow-visible">
            <defs>
                <linearGradient id="eqCurveGraphGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={enabled ? "#10b981" : "#737373"} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={enabled ? "#10b981" : "#737373"} stopOpacity={0} />
                </linearGradient>
            </defs>

            <line x1={0} x2={width} y1={midY - maxOffsetY} y2={midY - maxOffsetY} strokeDasharray="4 4" stroke="rgba(255,255,255,0.1)" />
            <line x1={0} x2={width} y1={midY} y2={midY} strokeDasharray="4 4" stroke="rgba(255,255,255,0.22)" />
            <line x1={0} x2={width} y1={midY + maxOffsetY} y2={midY + maxOffsetY} strokeDasharray="4 4" stroke="rgba(255,255,255,0.1)" />

            <path d={areaPath} fill="url(#eqCurveGraphGradient)" />
            <path
                d={linePath}
                fill="none"
                stroke={enabled ? "#34d399" : "#525252"}
                strokeWidth={2.5}
                strokeLinecap="round"
            />

            {points.map((point) => (
                <circle
                    key={point.band}
                    cx={point.x}
                    cy={point.y}
                    r={5}
                    onPointerDown={handleBandDrag(point.band)}
                    className={`transition-colors cursor-ns-resize hover:r-6 stroke-neutral-950 stroke-2 ${
                        enabled ? "fill-emerald-400" : "fill-neutral-500"
                    }`}
                />
            ))}
            {points.map((point) => (
                <text
                    key={`label-${point.band}`}
                    x={point.x}
                    y={height +10}
                    textAnchor="middle"
                    className="fill-neutral-500 text-[13px] font-medium"
                >
                    {Number(point.band) >= 1000 ? `${Number(point.band) / 1000}k` : point.band}
                </text>
            ))}
        </svg>
    );
}

export default EqCurveGraph;
