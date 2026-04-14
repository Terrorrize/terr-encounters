export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function deepClone(value) {
    return foundry.utils.deepClone(value);
}

export function randomInt(min, max) {
    const low = Math.ceil(Math.min(min, max));
    const high = Math.floor(Math.max(min, max));
    return Math.floor(Math.random() * (high - low + 1)) + low;
}

export function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

export function capitalize(value) {
    const text = String(value ?? "").trim();
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

export function titleCase(value) {
    return String(value ?? "")
        .replaceAll("/", " / ")
        .replaceAll("-", " ")
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : ""))
        .join(" ");
}

export function weightedPick(entries) {
    const normalized = Array.isArray(entries)
        ? entries
            .map((entry) => ({
                value: entry?.value,
                weight: Math.max(0, Number(entry?.weight) || 0)
            }))
            .filter((entry) => entry.value !== undefined && entry.value !== null && entry.weight > 0)
        : [];

    if (!normalized.length) return null;

    const total = normalized.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = randomFloat(0, total);

    for (const entry of normalized) {
        roll -= entry.weight;
        if (roll <= 0) return entry.value;
    }

    return normalized[normalized.length - 1]?.value ?? null;
}

export function chooseOne(items) {
    if (!Array.isArray(items) || !items.length) return null;
    return items[randomInt(0, items.length - 1)];
}

export function currentDateLabel() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function measureTextWidth(text, font) {
    const canvas = measureTextWidth.canvas ?? (measureTextWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    context.font = font;
    return context.measureText(text).width;
}