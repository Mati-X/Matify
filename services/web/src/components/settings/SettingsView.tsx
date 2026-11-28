import React, { useEffect, useState } from "react";
import { RotateCcw, Save, Sliders, Trash2 } from "lucide-react";
import {
    createEqualizerPreset,
    deleteEqualizerPreset,
    type EqualizerPreset,
    getEqualizerPresets,
} from "../../api/equalizer.ts";
import { EQ_BANDS, useEqualizerStore } from "../../store/useEqualizerStore.ts";

function formatBandLabel(band: string) {
    const hz = Number(band);
    return hz >= 1000 ? `${hz / 1000}k` : `${hz}`;
}

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

                <div className="flex flex-wrap gap-2">
                    {presets.map((preset) => {
                        const isActive = activePresetId === preset.id;
                        return (
                            <div
                                key={preset.id}
                                className={`flex items-center rounded-full border transition-colors ${
                                    isActive
                                        ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                                        : "bg-neutral-900 border-white/10 text-neutral-300 hover:border-white/25"
                                }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => applyPreset(preset)}
                                    className="px-4 py-1.5 text-sm font-medium cursor-pointer"
                                >
                                    {preset.name}
                                </button>
                                {!preset.isDefault && (
                                    <button
                                        type="button"
                                        onClick={() => handleDeletePreset(preset.id)}
                                        aria-label={`Delete ${preset.name}`}
                                        className="pr-3 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        );
                    })}
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

                <div className="grid grid-cols-10 gap-2 pt-2">
                    {EQ_BANDS.map((band) => {
                        const value = gains[band] ?? 0;
                        return (
                            <div key={band} className="flex flex-col items-center gap-3">
                                <span className="text-xs tabular-nums text-neutral-400">
                                    {value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1)}
                                </span>
                                <input
                                    type="range"
                                    min={-12}
                                    max={12}
                                    step={0.5}
                                    disabled={!enabled}
                                    value={value}
                                    onChange={(e) => setBandGain(band, Number(e.target.value))}
                                    style={{ writingMode: "vertical-lr", direction: "rtl" }}
                                    className="h-44 accent-emerald-400 cursor-pointer"
                                />
                                <span className="text-xs font-medium text-neutral-300">
                                    {formatBandLabel(band)}
                                </span>
                            </div>
                        );
                    })}
                </div>
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
