/**
 * terr-encounters v0.1.0-b2
 * Function: shared weather helpers for weighted rolls, clamping, random ranges,
 * ids, deep cloning, and temperature conversion.
 */

export const WEATHER_UTILS_VERSION = "0.1.0-b2";

export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function randomInt(min, max) {
    const low = Math.ceil(Math.min(min, max));
    const high = Math.floor(Math.max(min, max));
    return Math.floor(Math.random() * (high - low + 1)) + low;
}

export function randomFloat(min, max) {
    const low = Math.min(min, max);
    const high = Math.max(min, max);
    return Math.random() * (high - low) + low;
}

export function cToF(celsius) {
    return Math.round((celsius * 9) / 5 + 32);
}

export function fToC(fahrenheit) {
    return Math.round(((fahrenheit - 32) * 5) / 9);
}

export function roundTo(value, places = 0) {
    const factor = 10 ** places;
    return Math.round(value * factor) / factor;
}

export function pickOne(items = []) {
    if (!Array.isArray(items) || items.length === 0) return null;
    return items[randomInt(0, items.length - 1)];
}

export function weightedPick(weightMap = {}) {
    const entries = Object.entries(weightMap).filter(([, weight]) => Number(weight) > 0);

    if (!entries.length) return null;

    const total = entries.reduce((sum, [, weight]) => sum + Number(weight), 0);
    let roll = randomFloat(0, total);

    for (const [key, weight] of entries) {
        roll -= Number(weight);
        if (roll <= 0) {
            return key;
        }
    }

    return entries[entries.length - 1][0];
}

export function weightedPickNumber(weightMap = {}) {
    const result = weightedPick(weightMap);
    return result === null ? null : Number(result);
}

export function deepClone(value) {
    if (typeof structuredClone === "function") {
        return structuredClone(value);
    }

    return JSON.parse(JSON.stringify(value));
}

export function mergeObjectsShallow(base = {}, extra = {}) {
    return {
        ...base,
        ...extra
    };
}

export function createWeatherId(prefix = "weather") {
    const stamp = Date.now().toString(36);
    const rand = Math.random().toString(36).slice(2, 8);
    return `${prefix}-${stamp}-${rand}`;
}

export function safeGetProperty(object, path, fallback = null) {
    if (!object || !path) return fallback;

    const keys = Array.isArray(path) ? path : String(path).split(".");
    let current = object;

    for (const key of keys) {
        if (current == null || !(key in current)) {
            return fallback;
        }
        current = current[key];
    }

    return current;
}

export function ensureNumber(value, fallback = 0) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
}

export function normalizeWeightMap(weightMap = {}) {
    const normalized = {};
    for (const [key, value] of Object.entries(weightMap)) {
        const weight = ensureNumber(value, 0);
        if (weight > 0) {
            normalized[key] = weight;
        }
    }
    return normalized;
}