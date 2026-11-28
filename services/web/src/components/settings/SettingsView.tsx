import React, { useEffect, useState } from "react";
import { RotateCcw, Save, Sliders, Trash2 } from "lucide-react";
import {
    createEqualizerPreset,
    deleteEqualizerPreset,
    type EqualizerPreset,
    getEqualizerPresets,
} from "../../api/equalizer.ts";
import { useEqualizerStore } from "../../store/useEqualizerStore.ts";
import EqCurveGraph from "./EqCurveGraph.tsx";

export default function SettingsView() {
    const enabled = useEqualizerStore((s) => s.enabled);
    const preamp = useEqualizerStore((s) => s.preamp);
    const gains = useEqualizerStore((s) => s.gains);
    const activePresetId = useEqualizerStore((s) => s.activePresetId);
    const setEnabled = useEqualizerStore((s) => s.setEnabled);
    const setPreamp = useEqualizerStore((s) => s.setPreamp);
    const setBandGain = useEqualizerStore((s) => s.setBandGain);
    const applyPreset = useEqualizerStore((s) => s.applyPreset);
    const resetFlat = useEqualizerStore((s) => s.resetFlat);

    const [presets, setPresets] = useState<EqualizerPreset[]>([]);
    const [presetName, setPresetName] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getEqualizerPresets().then(setPresets).catch(() => {});
    }, []);

    const handleSavePreset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!presetName.trim()) return;
        setSaving(true);
        try {
            const created = await createEqualizerPreset(presetName.trim(), gains, preamp);
            setPresets((prev) => [...prev, created]);
            applyPreset(created);
            setPresetName("");
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePreset = async (id: string) => {
        await deleteEqualizerPreset(id);
        setPresets((prev) => prev.filter((p) => p.id !== id));
        if (activePresetId === id) {
            resetFlat();
        }
    };

    return (
        <div className="flex flex-col flex-1 min-w-0 p-8 max-w-4xl gap-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-4xl font-black text-white">Settings</h1>
                    <p className="text-sm text-neutral-400 mt-1">
                        Audio playback & 10-band Web Audio Equalizer
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setEnabled(!enabled)}
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
                        enabled
                            ? "bg-emerald-500 text-black hover:bg-emerald-400"
                            : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                    }`}
                >
                    {enabled ? "EQ Enabled" : "EQ Bypassed"}
                </button>
            </div>

            <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-emerald-400" />
                        Presets
                    </h2>
                    <button
                        type="button"
                        onClick={resetFlat}
                        className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset Flat
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <select
                        name="preset"
                        aria-label="Equalizer preset"
                        value={activePresetId ?? ""}
                        onChange={(e) => {
                            const selected = presets.find((p) => p.id === e.target.value);
                            if (selected) applyPreset(selected);
                        }}
                        className="matify-select min-w-56 px-4 py-2 rounded-xl bg-neutral-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-400 cursor-pointer"
                    >
                        <option value="" disabled>Custom</option>
                        {presets.map((preset) => (
                            <option key={preset.id} value={preset.id}>
                                {preset.name}
                            </option>
                        ))}
                    </select>
                    {(() => {
                        const activePreset = presets.find((p) => p.id === activePresetId);
                        if (!activePreset || activePreset.isDefault) return null;
                        return (
                            <button
                                type="button"
                                onClick={() => handleDeletePreset(activePreset.id)}
                                aria-label={`Delete ${activePreset.name}`}
                                className="p-2 rounded-xl bg-neutral-900 border border-white/10 text-neutral-400 hover:text-red-400 hover:border-red-400/40 transition-colors cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        );
                    })()}
                </div>
            </section>

            <section className={`flex flex-col gap-6 p-6 rounded-2xl bg-neutral-900/70 border border-white/10 transition-opacity ${enabled ? "opacity-100" : "opacity-50"}`}>
                <div className="flex items-center justify-between gap-6">
                    <span className="text-sm font-semibold text-neutral-300 w-24">Preamp</span>
                    <input
                        type="range"
                        min={-12}
                        max={12}
                        step={0.5}
                        disabled={!enabled}
                        value={preamp}
                        onChange={(e) => setPreamp(Number(e.target.value))}
                        className="flex-1 accent-emerald-400 cursor-pointer"
                    />
                    <span className="text-sm tabular-nums text-neutral-300 w-16 text-right">
                        {preamp > 0 ? `+${preamp.toFixed(1)}` : preamp.toFixed(1)} dB
                    </span>
                </div>
                <EqCurveGraph
                    gains={gains}
                    enabled={enabled}
                    activePresetId={activePresetId}
                    onChangeBand={setBandGain}
                />

            </section>

            <form onSubmit={handleSavePreset} className="flex items-center gap-3">
                <input
                    type="text"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="Save current curve as preset..."
                    className="flex-1 max-w-sm px-4 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-400"
                />
                <button
                    type="submit"
                    disabled={saving || !presetName.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-neutral-200 disabled:opacity-40 transition-colors cursor-pointer"
                >
                    <Save className="w-4 h-4" />
                    Save Preset
                </button>
            </form>
        </div>
    );
}
