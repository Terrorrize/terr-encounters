/**
 * terr-encounters v0.1.0-b3
 * Function: baseline weather tables keyed by biome -> climate -> season -> phase.
 * These tables drive weighted trend generation for condition, temperature,
 * precipitation, wind, and duration.
 */

export const WEATHER_BASELINES_VERSION = "0.1.0-b3";

export const DEFAULT_BASELINE_PATH = {
    biome: "temperate_forest",
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

function makeBaseline(overrides = {}) {
    return {
        conditions: {
            clear: 12,
            overcast: 18,
            foggy: 10,
            rainy: 20,
            snowy: 0,
            warm: 14,
            hot: 2,
            cold: 12,
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
            none: 24,
            rain: 64,
            snow: 0,
            sleet: 12
        },
        precipIntensity: {
            none: 0,
            light: 28,
            moderate: 44,
            hard: 20,
            severe: 8
        },
        precipPattern: {
            sporadic: 45,
            frequent: 40,
            constant: 15
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
        tempRangesC: {
            freezing: { min: -12, max: 0 },
            cold: { min: 1, max: 6 },
            cool: { min: 4, max: 9 },
            mild: { min: 7, max: 13 },
            warm: { min: 12, max: 18 },
            hot: { min: 18, max: 26 },
            severe_heat: { min: 27, max: 38 }
        },
        ...overrides
    };
}

export const WEATHER_BASELINES = {
    temperate_forest: {
        temperate: {
            spring: {
                early: makeBaseline({
                    conditions: { clear: 10, overcast: 20, foggy: 12, rainy: 22, snowy: 4, warm: 10, hot: 0, cold: 14, windy: 8 },
                    tempBands: { freezing: 2, cold: 22, cool: 34, mild: 26, warm: 14, hot: 2, severe_heat: 0 },
                    tempMotion: { rising: 40, holding: 40, falling: 20 },
                    precipTypes: { none: 20, rain: 58, snow: 8, sleet: 14 },
                    tempRangesC: {
                        freezing: { min: -10, max: 0 },
                        cold: { min: 0, max: 5 },
                        cool: { min: 3, max: 8 },
                        mild: { min: 6, max: 12 },
                        warm: { min: 11, max: 16 },
                        hot: { min: 16, max: 23 },
                        severe_heat: { min: 24, max: 34 }
                    }
                }),
                mid: makeBaseline(),
                late: makeBaseline({
                    conditions: { clear: 14, overcast: 16, foggy: 8, rainy: 20, snowy: 0, warm: 20, hot: 4, cold: 8, windy: 10 },
                    tempBands: { freezing: 0, cold: 10, cool: 24, mild: 34, warm: 24, hot: 8, severe_heat: 0 },
                    tempMotion: { rising: 42, holding: 38, falling: 20 },
                    precipTypes: { none: 24, rain: 66, snow: 0, sleet: 10 },
                    tempRangesC: {
                        freezing: { min: -8, max: 0 },
                        cold: { min: 2, max: 7 },
                        cool: { min: 6, max: 11 },
                        mild: { min: 10, max: 16 },
                        warm: { min: 15, max: 21 },
                        hot: { min: 20, max: 28 },
                        severe_heat: { min: 29, max: 37 }
                    }
                })
            },
            summer: {
                early: makeBaseline({
                    conditions: { clear: 16, overcast: 14, foggy: 6, rainy: 18, snowy: 0, warm: 24, hot: 8, cold: 2, windy: 12 },
                    tempBands: { freezing: 0, cold: 2, cool: 18, mild: 34, warm: 30, hot: 14, severe_heat: 2 },
                    tempMotion: { rising: 24, holding: 50, falling: 26 },
                    precipTypes: { none: 28, rain: 64, snow: 0, sleet: 8 },
                    windIntensity: { calm: 20, light: 38, moderate: 26, strong: 12, severe: 4 },
                    tempRangesC: {
                        freezing: { min: -5, max: 0 },
                        cold: { min: 5, max: 9 },
                        cool: { min: 10, max: 15 },
                        mild: { min: 14, max: 20 },
                        warm: { min: 19, max: 25 },
                        hot: { min: 24, max: 31 },
                        severe_heat: { min: 32, max: 40 }
                    }
                }),
                mid: makeBaseline({
                    conditions: { clear: 20, overcast: 10, foggy: 4, rainy: 14, snowy: 0, warm: 22, hot: 14, cold: 0, windy: 16 },
                    tempBands: { freezing: 0, cold: 0, cool: 10, mild: 28, warm: 34, hot: 22, severe_heat: 6 },
                    tempMotion: { rising: 18, holding: 56, falling: 26 },
                    tempMotionStrength: { slight: 54, steady: 32, sharp: 14 },
                    precipTypes: { none: 34, rain: 62, snow: 0, sleet: 4 },
                    precipIntensity: { none: 0, light: 24, moderate: 42, hard: 24, severe: 10 },
                    windIntensity: { calm: 20, light: 34, moderate: 28, strong: 14, severe: 4 },
                    tempRangesC: {
                        freezing: { min: -4, max: 0 },
                        cold: { min: 7, max: 10 },
                        cool: { min: 12, max: 17 },
                        mild: { min: 17, max: 22 },
                        warm: { min: 21, max: 28 },
                        hot: { min: 27, max: 34 },
                        severe_heat: { min: 35, max: 42 }
                    }
                }),
                late: makeBaseline({
                    conditions: { clear: 18, overcast: 10, foggy: 5, rainy: 14, snowy: 0, warm: 20, hot: 12, cold: 2, windy: 19 },
                    tempBands: { freezing: 0, cold: 0, cool: 12, mild: 30, warm: 32, hot: 20, severe_heat: 6 },
                    tempMotion: { rising: 10, holding: 40, falling: 50 },
                    precipTypes: { none: 30, rain: 62, snow: 0, sleet: 8 }
                })
            },
            autumn: {
                early: makeBaseline({
                    conditions: { clear: 16, overcast: 16, foggy: 10, rainy: 20, snowy: 0, warm: 16, hot: 2, cold: 10, windy: 10 },
                    tempBands: { freezing: 0, cold: 10, cool: 22, mild: 34, warm: 24, hot: 10, severe_heat: 0 },
                    tempMotion: { rising: 10, holding: 36, falling: 54 },
                    precipTypes: { none: 24, rain: 66, snow: 0, sleet: 10 }
                }),
                mid: makeBaseline({
                    conditions: { clear: 12, overcast: 20, foggy: 12, rainy: 20, snowy: 4, warm: 10, hot: 0, cold: 12, windy: 10 },
                    tempBands: { freezing: 2, cold: 18, cool: 32, mild: 30, warm: 16, hot: 2, severe_heat: 0 },
                    tempMotion: { rising: 8, holding: 34, falling: 58 },
                    precipTypes: { none: 22, rain: 58, snow: 6, sleet: 14 }
                }),
                late: makeBaseline({
                    conditions: { clear: 10, overcast: 18, foggy: 12, rainy: 18, snowy: 10, warm: 4, hot: 0, cold: 18, windy: 10 },
                    tempBands: { freezing: 10, cold: 28, cool: 30, mild: 20, warm: 10, hot: 2, severe_heat: 0 },
                    tempMotion: { rising: 6, holding: 32, falling: 62 },
                    precipTypes: { none: 20, rain: 42, snow: 20, sleet: 18 },
                    tempRangesC: {
                        freezing: { min: -14, max: 0 },
                        cold: { min: -1, max: 4 },
                        cool: { min: 2, max: 7 },
                        mild: { min: 5, max: 11 },
                        warm: { min: 10, max: 16 },
                        hot: { min: 16, max: 23 },
                        severe_heat: { min: 24, max: 32 }
                    }
                })
            },
            winter: {
                early: makeBaseline({
                    conditions: { clear: 10, overcast: 18, foggy: 10, rainy: 8, snowy: 24, warm: 0, hot: 0, cold: 20, windy: 10 },
                    tempBands: { freezing: 24, cold: 30, cool: 24, mild: 12, warm: 10, hot: 0, severe_heat: 0 },
                    tempMotion: { rising: 10, holding: 44, falling: 46 },
                    precipTypes: { none: 20, rain: 12, snow: 52, sleet: 16 },
                    precipIntensity: { none: 0, light: 32, moderate: 40, hard: 20, severe: 8 },
                    tempRangesC: {
                        freezing: { min: -22, max: -1 },
                        cold: { min: -4, max: 2 },
                        cool: { min: 1, max: 5 },
                        mild: { min: 4, max: 9 },
                        warm: { min: 8, max: 14 },
                        hot: { min: 15, max: 22 },
                        severe_heat: { min: 23, max: 30 }
                    }
                }),
                mid: makeBaseline({
                    conditions: { clear: 10, overcast: 20, foggy: 10, rainy: 2, snowy: 30, warm: 0, hot: 0, cold: 18, windy: 10 },
                    tempBands: { freezing: 34, cold: 30, cool: 20, mild: 10, warm: 6, hot: 0, severe_heat: 0 },
                    tempMotion: { rising: 12, holding: 52, falling: 36 },
                    precipTypes: { none: 18, rain: 4, snow: 62, sleet: 16 },
                    windIntensity: { calm: 14, light: 30, moderate: 34, strong: 16, severe: 6 },
                    tempRangesC: {
                        freezing: { min: -28, max: -3 },
                        cold: { min: -8, max: 0 },
                        cool: { min: -1, max: 4 },
                        mild: { min: 3, max: 8 },
                        warm: { min: 7, max: 12 },
                        hot: { min: 13, max: 20 },
                        severe_heat: { min: 21, max: 28 }
                    }
                }),
                late: makeBaseline({
                    conditions: { clear: 10, overcast: 20, foggy: 12, rainy: 6, snowy: 22, warm: 2, hot: 0, cold: 18, windy: 10 },
                    tempBands: { freezing: 24, cold: 28, cool: 24, mild: 14, warm: 10, hot: 0, severe_heat: 0 },
                    tempMotion: { rising: 30, holding: 42, falling: 28 },
                    precipTypes: { none: 20, rain: 10, snow: 54, sleet: 16 }
                })
            }
        }
    }
};

export function getDefaultDurationWeights() {
    return { ...DEFAULT_DURATION_WEIGHTS };
}

export function getBaselineLeaf(biome, climate, season, phase) {
    const biomeNode = WEATHER_BASELINES[biome] ?? WEATHER_BASELINES[DEFAULT_BASELINE_PATH.biome];
    const climateNode = biomeNode?.[climate] ?? biomeNode?.[DEFAULT_BASELINE_PATH.climate];
    const seasonNode = climateNode?.[season] ?? climateNode?.[DEFAULT_BASELINE_PATH.season];
    const leaf = seasonNode?.[phase] ?? seasonNode?.[DEFAULT_BASELINE_PATH.phase];

    return leaf ?? makeBaseline();
}

export function getTempRangeForBand(leaf, band) {
    return leaf?.tempRangesC?.[band] ?? { min: 7, max: 13 };
}