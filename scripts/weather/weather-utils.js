// terr-encounters
// File: scripts/weather/weather-utils.js
// Version: 0.0.4
// Build: cleanup-pass-02
// Purpose: shared helpers for weather state, rolls, ruins, and combiner

export function deepClone(value) {
    if (value === null || value === undefined) return value;
    return foundry.utils.deepClone(value);
}

export function isoNow() {
    return new Date().toISOString();
}

export function currentDayLabel() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function toKey(...parts) {
    return parts
        .filter(part => part !== null && part !== undefined)
        .map(part => String(part).trim().toLowerCase())
        .join("::");
}

export function randomInt(min, max) {
    const low = Math.ceil(Math.min(min, max));
    const high = Math.floor(Math.max(min, max));
    return Math.floor(Math.random() * (high - low + 1)) + low;
}

export function pickOne(items) {
    if (!Array.isArray(items) || items.length === 0) return null;
    return items[randomInt(0, items.length - 1)] ?? null;
}

export function chooseOne(items) {
    return pickOne(items);
}

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function sentenceCase(value) {
    const text = String(value ?? "").trim();
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export function normalizeWeights(entries) {
    if (!Array.isArray(entries)) return [];

    return entries
        .map((entry) => {
            if (entry === null || entry === undefined) return null;

            if (typeof entry === "string") {
                return { value: entry, weight: 1 };
            }

            if (typeof entry === "object") {
                const value = entry.value ?? entry.key ?? entry.name ?? null;
                if (value === null || value === undefined || value === "") return null;

                const weight = Math.max(0, Number(entry.weight) || 0);
                return { value, weight };
            }

            return { value: String(entry), weight: 1 };
        })
        .filter((entry) => entry && entry.value !== null && entry.value !== undefined);
}

export function buildWeightedArrayFromMap(weightMap) {
    if (!(weightMap instanceof Map)) return [];

    const entries = [];
    for (const [value, weight] of weightMap.entries()) {
        const numericWeight = Math.max(0, Number(weight) || 0);
        if (numericWeight <= 0) continue;
        entries.push({ value, weight: numericWeight });
    }

    return entries;
}

export function upsertWeight(weightMap, key, amount) {
    if (!(weightMap instanceof Map)) return;
    if (key === null || key === undefined) return;

    const current = Math.max(0, Number(weightMap.get(key)) || 0);
    const next = Math.max(0, current + (Number(amount) || 0));
    weightMap.set(key, next);
}

export function weightedPick(entries) {
    const normalized = normalizeWeights(entries);
    if (normalized.length === 0) return null;

    let total = 0;
    for (const entry of normalized) {
        total += Math.max(0, Number(entry.weight) || 0);
    }

    if (total <= 0) {
        return normalized[normalized.length - 1]?.value ?? null;
    }

    let roll = Math.random() * total;
    for (const entry of normalized) {
        roll -= Math.max(0, Number(entry.weight) || 0);
        if (roll <= 0) return entry.value;
    }

    return normalized[normalized.length - 1]?.value ?? null;
}

export function weightedValue(entries) {
    return weightedPick(entries);
}