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
    return items[randomInt(0, items.length - 1)];
}

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function weightedPick(entries) {
    if (!Array.isArray(entries) || entries.length === 0) return null;

    let total = 0;
    for (const entry of entries) {
        total += Math.max(0, Number(entry?.weight) || 0);
    }

    if (total <= 0) {
        return entries[entries.length - 1] ?? null;
    }

    let roll = Math.random() * total;
    for (const entry of entries) {
        roll -= Math.max(0, Number(entry?.weight) || 0);
        if (roll <= 0) return entry;
    }

    return entries[entries.length - 1] ?? null;
}

export function weightedValue(entries) {
    const picked = weightedPick(entries);
    return picked?.value ?? null;
}