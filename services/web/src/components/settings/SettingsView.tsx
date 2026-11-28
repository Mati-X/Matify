import React, { useEffect, useState } from "react";
import { RotateCcw, Save, Sliders, Trash2 } from "lucide-react";
import {
    createEqualizerPreset,
    deleteEqualizerPreset,
    type EqualizerPreset,
    getEqualizerPresets,
} from "../../api/equalizer.ts";
import { useEqualizerStore } from "../../store/useEqualizerStore.ts";
import { CustomSelect } from "../ui/CustomSelect.tsx";
import { CustomSlider } from "../ui/CustomSlider.tsx";
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
        <div className="flex flex-col flex-1 w-full min-w-0">
            <div className="flex items-center justify-between border-b border-white/10 px-8 pt-8 pb-6">
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

            <div className="w-full max-w-5xl mx-auto px-10 py-10 flex flex-col gap-8">
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
                    <CustomSelect
                        ariaLabel="Equalizer preset"
                        value={activePresetId ?? ""}
                        placeholder="Custom"
                        options={presets.map((preset) => ({
                            value: preset.id,
                            label: preset.name,
                        }))}
                        onChange={(presetId) => {
                            const selected = presets.find((p) => p.id === presetId);
                            if (selected) applyPreset(selected);
                        }}
                        className="min-w-64"
                    />
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

            <section className={`flex flex-col gap-6 p-7 rounded-2xl bg-neutral-900/70 border border-white/10 transition-opacity ${enabled ? "opacity-100" : "opacity-60"}`}>
                <div className="flex items-center justify-between gap-6">
                    <span className="text-sm font-semibold text-neutral-300 w-20">Preamp</span>
                    <CustomSlider
                        ariaLabel="Preamp"
                        min={-12}
                        max={12}
                        step={0.5}
                        value={preamp}
                        active={enabled}
                        onChange={(val) => {
                            if (!enabled) setEnabled(true);
                            setPreamp(val);
                        }}
                        className="flex-1"
                    />
                    <span className="text-xs font-medium tabular-nums text-neutral-200 bg-neutral-950 border border-white/10 px-3 py-1.5 rounded-lg w-20 text-center">
                        {preamp > 0 ? `+${preamp.toFixed(1)}` : preamp.toFixed(1)} dB
                    </span>
                </div>
                <EqCurveGraph
                    gains={gains}
                    enabled={enabled}
                    activePresetId={activePresetId}
                    onChangeBand={(band, db) => {
                        if (!enabled) setEnabled(true);
                        setBandGain(band, db);
                    }}
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
        </div>
    );
}
