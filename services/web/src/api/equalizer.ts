import { api } from "./client.ts";

export interface EqualizerPreset {
    id: string;
    name: string;
    type: string;
    preamp: string;
    gains: Record<string, number>;
    isDefault: boolean;
    createdAt: string;
}

export async function getEqualizerPresets(): Promise<EqualizerPreset[]> {
    const { data } = await api.get<{ presets: EqualizerPreset[] }>("/equalizer/presets");
    return data.presets;
}

export async function createEqualizerPreset(
    name: string,
    gains: Record<string, number>,
    preamp: number
): Promise<EqualizerPreset> {
    const { data } = await api.post<{ preset: EqualizerPreset }>("/equalizer/presets", {
        name,
        gains,
        preamp,
    });
    return data.preset;
}

export async function deleteEqualizerPreset(id: string): Promise<void> {
    await api.delete(`/equalizer/presets/${id}`);
}
