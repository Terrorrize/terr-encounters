// FILE: scripts/data/weather/weather-baselines.js
/**
 * terr-encounters v0.1.0-b7
 * Function: live weighted weather baselines keyed by biome -> climate ->
 * season -> phase. This revision lowers rain pressure, compresses heavy
 * precipitation, keeps the trend system intact, and improves snow/rain
 * coherence by climate and season.
 */

import {
    WEATHER_BIOMES,
    WEATHER_CLIMATES,
    WEATHER_PHASES,
    WEATHER_SEASONS,
    biomeExists,
    climateExists,
    getBiomeDefinition
} from "../weather-biomes.js";

export const WEATHER_BASELINES_VERSION = "0.1.0-b7";

export const DEFAULT_BASELINE_PATH = {
    biome: "forest",
    climate: "temperate",
    season: "spring",
    phase: "mid"
};

const DEFAULT_DURATION_WEIGHTS = {
    1: 8,
    2: 12,
    3: 14,
    4: 14,
    5: 14,
    6: 12,
    7: 10,
    8: 8,
    9: 5,
    10: 3
};

const BASE_TEMP_RANGES_C = {
    freezing: { min: -12, max: 0 },
    cold: { min: 1, max: 6 },
    cool: { min: 4, max: 9 },
    mild: { min: 7, max: 13 },
    warm: { min: 12, max: 18 },
    hot: { min: 18, max: 26 },
    severe_heat: { min: 27, max: 38 }
};

function deepClone(value) {
    if (typeof structuredClone === "function") {
        return structuredClone(value);
    }

    return JSON.parse(JSON.stringify(value));
}

function makeBaseline() {
    return {
        conditions: {
            clear: 18,
            overcast: 20,
            foggy: 10,
            rainy: 10,
            snowy: 0,
            warm: 14,
            hot: 2,
            cold: 14,
            windy: 12
        },
        tempBands: {
            freezing: 0,
            cold: 20,
            cool: 30,
            mild: 30,
            warm: 16,
            hot: 4,
            severe_heat: 0
        },
        tempMotion: {
            rising: 30,
            holding: 45,
            falling: 25
        },
        tempMotionStrength: {
            slight: 50,
            steady: 35,
            sharp: 15
        },
        precipTypes: {
            none: 40,
            rain: 46,
            snow: 0,
            sleet: 6
        },
        precipIntensity: {
            none: 0,
            light: 58,
            moderate: 28,
            hard: 10,
            severe: 4
        },
        precipPattern: {
            sporadic: 58,
            frequent: 32,
            constant: 10
        },
        windIntensity: {
            calm: 16,
            light: 36,
            moderate: 32,
            strong: 12,
            severe: 4
        },
        windPattern: {
            sporadic: 45,
            frequent: 40,
            constant: 15
        },
        durationWeights: { ...DEFAULT_DURATION_WEIGHTS },
        tempRangesC: deepClone(BASE_TEMP_RANGES_C)
    };
}

function clampWeightMap(map) {
    const next = {};
    for (const [key, value] of Object.entries(map)) {
        next[key] = Math.max(0, Math.round(Number(value) || 0));
    }
    return next;
}

function shiftTempRanges(tempRangesC, deltaC) {
    const next = {};
    for (const [band, range] of Object.entries(tempRangesC)) {
        next[band] = {
            min: Math.round(range.min + deltaC),
            max: Math.round(range.max + deltaC)
        };
    }
    return next;
}

function addMap(target, patch) {
    for (const [key, value] of Object.entries(patch)) {
        target[key] = (target[key] ?? 0) + value;
    }
}

function applySeasonPhaseAdjustments(leaf, season, phase) {
    if (season === "spring") {
        addMap(leaf.conditions, {
            rainy: 1,
            overcast: 2,
            foggy: 1,
            cold: 2,
            warm: 1,
            hot: -1,
            snowy: phase === "early" ? 2 : 0
        });

        addMap(leaf.tempBands, {
            freezing: phase === "early" ? 2 : 0,
            cold: 3,
            cool: 4,
            mild: 1,
            warm: phase === "late" ? 2 : 0,
            hot: -2
        });

        addMap(leaf.tempMotion, { rising: 12, holding: 0, falling: -6 });
        addMap(leaf.precipTypes, { none: 2, rain: 1, snow: phase === "early" ? 2 : 0, sleet: 2 });
        addMap(leaf.precipIntensity, { light: 4, moderate: 1, hard: -2, severe: -2 });
        addMap(leaf.precipPattern, { sporadic: 3, frequent: 1, constant: -2 });
    }

    if (season === "summer") {
        addMap(leaf.conditions, {
            clear: 4,
            rainy: -2,
            overcast: -1,
            foggy: -1,
            warm: 4,
            hot: 4,
            cold: -6,
            snowy: -4
        });

        addMap(leaf.tempBands, {
            freezing: -4,
            cold: -8,
            cool: phase === "early" ? 2 : -2,
            mild: 2,
            warm: 6,
            hot: 6,
            severe_heat: phase === "mid" || phase === "late" ? 3 : 1
        });

        addMap(leaf.tempMotion, { rising: phase === "early" ? 4 : -4, holding: 6, falling: phase === "late" ? 8 : -2 });
        addMap(leaf.precipTypes, { none: 5, rain: -3, snow: -6, sleet: -3 });
        addMap(leaf.precipIntensity, { light: 4, moderate: 1, hard: -2, severe: -2 });
        addMap(leaf.precipPattern, { sporadic: 4, frequent: -1, constant: -2 });
    }

    if (season === "autumn") {
        addMap(leaf.conditions, {
            clear: 2,
            rainy: 0,
            overcast: 2,
            warm: -2,
            hot: -4,
            cold: 4,
            snowy: phase === "late" ? 4 : 0
        });

        addMap(leaf.tempBands, {
            freezing: phase === "late" ? 4 : 0,
            cold: 5,
            cool: 4,
            mild: -1,
            warm: -3,
            hot: -4
        });

        addMap(leaf.tempMotion, { rising: -8, holding: 0, falling: 12 });
        addMap(leaf.precipTypes, { none: 3, rain: 0, snow: phase === "late" ? 4 : 0, sleet: 2 });
        addMap(leaf.precipIntensity, { light: 3, moderate: 1, hard: -2, severe: -2 });
        addMap(leaf.precipPattern, { sporadic: 3, frequent: 0, constant: -2 });
    }

    if (season === "winter") {
        addMap(leaf.conditions, {
            clear: 1,
            rainy: -10,
            overcast: 2,
            foggy: -1,
            warm: -8,
            hot: -10,
            cold: 10,
            snowy: 12
        });

        addMap(leaf.tempBands, {
            freezing: 12,
            cold: 8,
            cool: 0,
            mild: -6,
            warm: -8,
            hot: -8,
            severe_heat: -4
        });

        addMap(leaf.tempMotion, { rising: phase === "late" ? 6 : -4, holding: 6, falling: phase === "early" ? 6 : 0 });
        addMap(leaf.precipTypes, { none: 4, rain: -14, snow: 18, sleet: 4 });
        addMap(leaf.precipIntensity, { light: 8, moderate: 1, hard: -4, severe: -4 });
        addMap(leaf.precipPattern, { sporadic: 4, frequent: -1, constant: -3 });
    }

    if (phase === "early") {
        addMap(leaf.tempMotionStrength, { slight: 2, steady: 1, sharp: 0 });
    }

    if (phase === "mid") {
        addMap(leaf.tempMotionStrength, { slight: 0, steady: 2, sharp: 1 });
        addMap(leaf.durationWeights, { 4: 1, 5: 1, 6: 1 });
    }

    if (phase === "late") {
        addMap(leaf.tempMotionStrength, { slight: 1, steady: 1, sharp: 2 });
    }
}

function applyClimateAdjustments(leaf, climate, season) {
    if (climate === "tropical") {
        addMap(leaf.conditions, {
            clear: -2,
            overcast: 4,
            foggy: 2,
            rainy: 4,
            snowy: -20,
            warm: 8,
            hot: 10,
            cold: -20,
            windy: 0
        });

        addMap(leaf.tempBands, {
            freezing: -20,
            cold: -16,
            cool: -6,
            mild: 2,
            warm: 10,
            hot: 10,
            severe_heat: 8
        });

        addMap(leaf.tempMotion, { rising: -2, holding: 8, falling: -2 });
        addMap(leaf.precipTypes, { none: -8, rain: 12, snow: -20, sleet: -10 });
        addMap(leaf.precipIntensity, { light: 6, moderate: 0, hard: -4, severe: -2 });
        addMap(leaf.precipPattern, { sporadic: 4, frequent: 0, constant: -3 });
        leaf.tempRangesC = shiftTempRanges(leaf.tempRangesC, 12);

        if (season === "winter") {
            addMap(leaf.conditions, { rainy: -2, clear: 2 });
            addMap(leaf.precipTypes, { none: 4, rain: -4 });
        }
    }

    if (climate === "dry") {
        addMap(leaf.conditions, {
            clear: 8,
            overcast: -4,
            foggy: -5,
            rainy: -8,
            snowy: -4,
            warm: 2,
            hot: 5,
            cold: -1,
            windy: 4
        });

        addMap(leaf.tempBands, {
            freezing: -4,
            cold: -6,
            cool: -3,
            mild: -1,
            warm: 4,
            hot: 7,
            severe_heat: 5
        });

        addMap(leaf.tempMotionStrength, { slight: -6, steady: 2, sharp: 6 });
        addMap(leaf.precipTypes, { none: 18, rain: -18, snow: -6, sleet: -5 });
        addMap(leaf.precipIntensity, { light: 2, moderate: -2, hard: -2, severe: -2 });
        addMap(leaf.precipPattern, { sporadic: 10, frequent: -8, constant: -6 });
        addMap(leaf.windIntensity, { calm: -2, light: 0, moderate: 3, strong: 3, severe: 1 });
        leaf.tempRangesC = shiftTempRanges(leaf.tempRangesC, 5);

        if (season === "winter") {
            leaf.tempRangesC = shiftTempRanges(leaf.tempRangesC, -5);
            addMap(leaf.tempBands, { cold: 4, cool: 2, hot: -6, severe_heat: -4 });
        }
    }

    if (climate === "temperate") {
        addMap(leaf.conditions, { clear: 1, overcast: 1, rainy: -1, foggy: 1 });
        addMap(leaf.precipTypes, { none: 4, rain: -4, sleet: 0 });
        addMap(leaf.precipIntensity, { light: 4, moderate: 0, hard: -2, severe: -2 });
        addMap(leaf.precipPattern, { sporadic: 4, frequent: -1, constant: -2 });
    }

    if (climate === "continental") {
        addMap(leaf.conditions, {
            clear: 1,
            overcast: 1,
            rainy: -2,
            snowy: 6,
            warm: -1,
            hot: 2,
            cold: 8,
            windy: 2
        });

        addMap(leaf.tempBands, {
            freezing: 8,
            cold: 8,
            cool: 2,
            mild: -4,
            warm: -2,
            hot: 2,
            severe_heat: 1
        });

        addMap(leaf.tempMotionStrength, { slight: -4, steady: 2, sharp: 4 });
        addMap(leaf.precipTypes, { none: 3, rain: -8, snow: 10, sleet: 3 });
        addMap(leaf.precipIntensity, { light: 6, moderate: 0, hard: -3, severe: -3 });
        addMap(leaf.windIntensity, { calm: -1, light: 0, moderate: 2, strong: 2, severe: 1 });
        leaf.tempRangesC = shiftTempRanges(leaf.tempRangesC, -6);

        if (season === "summer") {
            leaf.tempRangesC = shiftTempRanges(leaf.tempRangesC, 7);
            addMap(leaf.tempBands, { freezing: -8, cold: -4, warm: 4, hot: 6, severe_heat: 3 });
            addMap(leaf.precipTypes, { none: 2, rain: 3, snow: -8, sleet: -4 });
        }

        if (season === "winter") {
            leaf.tempRangesC = shiftTempRanges(leaf.tempRangesC, -8);
            addMap(leaf.tempBands, { freezing: 8, cold: 6, warm: -6, hot: -8, severe_heat: -4 });
        }
    }

    if (climate === "polar") {
        addMap(leaf.conditions, {
            clear: 1,
            overcast: 3,
            foggy: 0,
            rainy: -12,
            snowy: 14,
            warm: -10,
            hot: -12,
            cold: 14,
            windy: 4
        });

        addMap(leaf.tempBands, {
            freezing: 18,
            cold: 10,
            cool: -2,
            mild: -8,
            warm: -10,
            hot: -10,
            severe_heat: -8
        });

        addMap(leaf.tempMotion, { rising: -2, holding: 8, falling: 2 });
        addMap(leaf.tempMotionStrength, { slight: 2, steady: 2, sharp: 1 });
        addMap(leaf.precipTypes, { none: 4, rain: -18, snow: 20, sleet: 2 });
        addMap(leaf.precipIntensity, { light: 8, moderate: 1, hard: -4, severe: -4 });
        addMap(leaf.windIntensity, { calm: -3, light: -1, moderate: 3, strong: 3, severe: 2 });
        leaf.tempRangesC = shiftTempRanges(leaf.tempRangesC, -14);

        if (season === "summer") {
            leaf.tempRangesC = shiftTempRanges(leaf.tempRangesC, 8);
            addMap(leaf.tempBands, { freezing: -6, cold: 4, cool: 6, mild: 2, warm: -2, hot: -6, severe_heat: -8 });
            addMap(leaf.precipTypes, { rain: 4, snow: -4, sleet: 2 });
        }
    }
}

function applyBiomeAdjustments(leaf, biome) {
    const modifiers = getBiomeDefinition(biome).modifiers;

    addMap(leaf.conditions, {
        clear: modifiers.clear,
        overcast: modifiers.overcast,
        foggy: modifiers.foggy,
        rainy: modifiers.rainy,
        snowy: modifiers.snowy,
        warm: modifiers.warm,
        hot: modifiers.hot,
        cold: modifiers.cold,
        windy: modifiers.windy
    });

    addMap(leaf.precipTypes, {
        none: modifiers.precipNone,
        rain: modifiers.precipRain,
        snow: modifiers.precipSnow,
        sleet: modifiers.precipSleet
    });

    addMap(leaf.precipPattern, {
        frequent: modifiers.precipFrequent,
        constant: modifiers.precipConstant
    });

    addMap(leaf.windIntensity, {
        calm: modifiers.windCalm,
        light: modifiers.windLight,
        moderate: modifiers.windModerate,
        strong: modifiers.windStrong,
        severe: modifiers.windSevere
    });

    leaf.tempRangesC = shiftTempRanges(leaf.tempRangesC, modifiers.tempShiftC);
}

function enforceLeafCoherence(leaf) {
    const freezingColdWeight =
        Number(leaf.tempBands.freezing ?? 0) + Number(leaf.tempBands.cold ?? 0);
    const warmHotWeight =
        Number(leaf.tempBands.warm ?? 0) +
        Number(leaf.tempBands.hot ?? 0) +
        Number(leaf.tempBands.severe_heat ?? 0);

    if (freezingColdWeight >= warmHotWeight) {
        addMap(leaf.precipTypes, { rain: -6, snow: 4, sleet: 2 });
        addMap(leaf.conditions, { rainy: -3, snowy: 3 });
    }

    if (warmHotWeight >= freezingColdWeight + 8) {
        addMap(leaf.precipTypes, { snow: -8, sleet: -4, rain: 2 });
        addMap(leaf.conditions, { snowy: -6 });
    }

    if (Number(leaf.conditions.overcast ?? 0) > 0 || Number(leaf.conditions.foggy ?? 0) > 0) {
        addMap(leaf.precipIntensity, { light: 2, moderate: 1, hard: -2, severe: -2 });
        addMap(leaf.precipPattern, { sporadic: 2, frequent: 1, constant: -2 });
    }

    if (Number(leaf.conditions.rainy ?? 0) > 0) {
        addMap(leaf.precipTypes, { rain: 3, none: -2 });
    }

    if (Number(leaf.conditions.snowy ?? 0) > 0) {
        addMap(leaf.precipTypes, { snow: 4, rain: -4, none: -1 });
    }
}

function finalizeLeaf(leaf) {
    enforceLeafCoherence(leaf);

    leaf.conditions = clampWeightMap(leaf.conditions);
    leaf.tempBands = clampWeightMap(leaf.tempBands);
    leaf.tempMotion = clampWeightMap(leaf.tempMotion);
    leaf.tempMotionStrength = clampWeightMap(leaf.tempMotionStrength);
    leaf.precipTypes = clampWeightMap(leaf.precipTypes);
    leaf.precipIntensity = clampWeightMap(leaf.precipIntensity);
    leaf.precipPattern = clampWeightMap(leaf.precipPattern);
    leaf.windIntensity = clampWeightMap(leaf.windIntensity);
    leaf.windPattern = clampWeightMap(leaf.windPattern);
    leaf.durationWeights = clampWeightMap(leaf.durationWeights);

    if (leaf.precipTypes.snow === 0 && leaf.conditions.snowy > 0) {
        leaf.conditions.snowy = 0;
    }

    if (leaf.precipTypes.rain === 0 && leaf.conditions.rainy > 0) {
        leaf.conditions.rainy = Math.max(0, leaf.conditions.rainy - 6);
    }

    return leaf;
}

function buildLeaf(biome, climate, season, phase) {
    const leaf = makeBaseline();
    applySeasonPhaseAdjustments(leaf, season, phase);
    applyClimateAdjustments(leaf, climate, season);
    applyBiomeAdjustments(leaf, biome);
    return finalizeLeaf(leaf);
}

function buildWeatherBaselines() {
    const baselines = {};

    for (const biome of Object.keys(WEATHER_BIOMES)) {
        baselines[biome] = {};

        for (const climate of Object.keys(WEATHER_CLIMATES)) {
            baselines[biome][climate] = {};

            for (const season of WEATHER_SEASONS) {
                baselines[biome][climate][season] = {};

                for (const phase of WEATHER_PHASES) {
                    baselines[biome][climate][season][phase] = buildLeaf(biome, climate, season, phase);
                }
            }
        }
    }

    return baselines;
}

export const WEATHER_BASELINES = buildWeatherBaselines();

function getFallbackBiome() {
    return biomeExists(DEFAULT_BASELINE_PATH.biome) ? DEFAULT_BASELINE_PATH.biome : "forest";
}

function getFallbackClimate(biome) {
    if (climateExists(DEFAULT_BASELINE_PATH.climate) && WEATHER_BASELINES[biome]?.[DEFAULT_BASELINE_PATH.climate]) {
        return DEFAULT_BASELINE_PATH.climate;
    }

    return Object.keys(WEATHER_BASELINES[biome] ?? {})[0] ?? "temperate";
}

function getFallbackSeason(biome, climate) {
    return WEATHER_BASELINES[biome]?.[climate]?.[DEFAULT_BASELINE_PATH.season]
        ? DEFAULT_BASELINE_PATH.season
        : WEATHER_SEASONS[0];
}

function getFallbackPhase(biome, climate, season) {
    return WEATHER_BASELINES[biome]?.[climate]?.[season]?.[DEFAULT_BASELINE_PATH.phase]
        ? DEFAULT_BASELINE_PATH.phase
        : WEATHER_PHASES[0];
}

export function getDefaultDurationWeights() {
    return { ...DEFAULT_DURATION_WEIGHTS };
}

export function getBaselineLeaf(biome, climate, season, phase) {
    const resolvedBiome = WEATHER_BASELINES[biome] ? biome : getFallbackBiome();
    const resolvedClimate = WEATHER_BASELINES[resolvedBiome]?.[climate] ? climate : getFallbackClimate(resolvedBiome);
    const resolvedSeason = WEATHER_BASELINES[resolvedBiome]?.[resolvedClimate]?.[season]
        ? season
        : getFallbackSeason(resolvedBiome, resolvedClimate);
    const resolvedPhase = WEATHER_BASELINES[resolvedBiome]?.[resolvedClimate]?.[resolvedSeason]?.[phase]
        ? phase
        : getFallbackPhase(resolvedBiome, resolvedClimate, resolvedSeason);

    return WEATHER_BASELINES[resolvedBiome]?.[resolvedClimate]?.[resolvedSeason]?.[resolvedPhase] ?? makeBaseline();
}

export function getTempRangeForBand(leaf, band) {
    return leaf?.tempRangesC?.[band] ?? { min: 7, max: 13 };
}

export function getAvailableBiomes() {
    return Object.keys(WEATHER_BASELINES);
}

export function getAvailableClimates(biome) {
    const resolvedBiome = WEATHER_BASELINES[biome] ? biome : getFallbackBiome();
    return Object.keys(WEATHER_BASELINES[resolvedBiome] ?? {});
}

export function getAvailableSeasons(biome, climate) {
    const resolvedBiome = WEATHER_BASELINES[biome] ? biome : getFallbackBiome();
    const resolvedClimate = WEATHER_BASELINES[resolvedBiome]?.[climate] ? climate : getFallbackClimate(resolvedBiome);
    return Object.keys(WEATHER_BASELINES[resolvedBiome]?.[resolvedClimate] ?? {});
}

export function getAvailablePhases(biome, climate, season) {
    const resolvedBiome = WEATHER_BASELINES[biome] ? biome : getFallbackBiome();
    const resolvedClimate = WEATHER_BASELINES[resolvedBiome]?.[climate] ? climate : getFallbackClimate(resolvedBiome);
    const resolvedSeason = WEATHER_BASELINES[resolvedBiome]?.[resolvedClimate]?.[season]
        ? season
        : getFallbackSeason(resolvedBiome, resolvedClimate);

    return Object.keys(WEATHER_BASELINES[resolvedBiome]?.[resolvedClimate]?.[resolvedSeason] ?? {});
}