import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EqualizerPreset } from "../api/equalizer.ts";

export const EQ_BANDS = ["32", "64", "125", "250", "500", "1000", "2000", "4000", "8000", "16000"] as const;

export type EqBand = (typeof EQ_BANDS)[number];

const FLAT_GAINS: Record<string, number> = {
    "32": 0,
    "64": 0,
    "125": 0,
    "250": 0,
    "500": 0,
    "1000": 0,
    "2000": 0,
    "4000": 0,
    "8000": 0,
    "16000": 0,
};

interface EqualizerStore {
    enabled: boolean;
    preamp: number;
    gains: Record<string, number>;
    activePresetId: string | null;
    setEnabled: (enabled: boolean) => void;
    setPreamp: (preamp: number) => void;
    setBandGain: (band: string, db: number) => void;
    applyPreset: (preset: EqualizerPreset) => void;
    resetFlat: () => void;
}

export const useEqualizerStore = create<EqualizerStore>()(
    persist(
        (set) => ({
            enabled: true,
            preamp: 0,
            gains: { ...FLAT_GAINS },
            activePresetId: null,
            setEnabled: (enabled) => set({ enabled }),
            setPreamp: (preamp) => set({ preamp, activePresetId: null }),
            setBandGain: (band, db) =>
                set((state) => ({
                    gains: { ...state.gains, [band]: db },
                    activePresetId: null,
                })),
            applyPreset: (preset) =>
                set({
                    enabled: true,
                    preamp: Number(preset.preamp) || 0,
                    gains: { ...FLAT_GAINS, ...preset.gains },
                    activePresetId: preset.id,
                }),
            resetFlat: () =>
                set({
                    preamp: 0,
                    gains: { ...FLAT_GAINS },
                    activePresetId: null,
                }),
        }),
        {
            name: "matify-equalizer",
        }
    )
);
