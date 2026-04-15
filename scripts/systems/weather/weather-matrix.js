/**
 * terr-encounters v0.1.0-b9
 * Function: updates the wording matrix from resolved daily weather and produces
 * concise ground aftermath lines. This revision makes wet-state recovery driven
 * mostly by temperature band and sky state, clears ground in the order
 * standing water -> mud -> surface wetness -> dryness, and treats dryness as a
 * later-stage dry band instead of the direct opposite of wetness.
 */

import { getRuinsDescriptorLines } from "../../data/weather/weather-ruins.js";
import { clamp } from "./weather-utils.js";

export const WEATHER_MATRIX_VERSION = "0.1.0-b9";

function normalizeMatrix(matrix = {}) {
    return {
        wetness: clamp(Number(matrix.wetness ?? 0), 0, 5),
        mud: clamp(Number(matrix.mud ?? 0), 0, 5),
        standingWater: clamp(Number(matrix.standingWater ?? 0), 0, 5),
        snowCover: clamp(Number(matrix.snowCover ?? 0), 0, 5),
        dryness: clamp(Number(matrix.dryness ?? 0), 0, 5)
    };
}

function getDrynessCap(environment = {}) {
    switch (environment.biome) {
        case "swamp":
            return 1;
        case "coast":
        case "forest":
            return 2;
        case "tundra":
        case "mountains":
        case "plains":
        case "urban_fringe":
            return 3;
        case "hills":
            return environment.climate === "dry" ? 4 : 3;
        case "desert":
            return 5;
        default:
            return 3;
    }
}

function getDryingScore(currentDay, environment = {}) {
    const tempC = Number(currentDay?.tempC ?? 0);
    const cloudFace = currentDay?.cloudFace ?? "mixed";
    const highWind =
        currentDay?.windIntensity === "strong" || currentDay?.windIntensity === "severe";

    let score = 0;

    if (tempC <= 3) score = 0;
    else if (tempC <= 10) score = 1;
    else if (tempC <= 17) score = 2;
    else if (tempC <= 24) score = 3;
    else if (tempC <= 34) score = 4;
    else score = 5;

    if (cloudFace === "low" || cloudFace === "grey" || cloudFace === "storm") {
        score -= 1;
    } else if (cloudFace === "bright") {
        score += 1;
    }

    switch (environment.biome) {
        case "swamp":
            score -= 2;
            break;
        case "coast":
        case "forest":
            score -= 1;
            break;
        case "desert":
            score += 1;
            break;
        default:
            break;
    }

    if (environment.climate === "dry") score += 1;
    if (environment.season === "winter") score -= 1;
    if (environment.season === "summer" && environment.phase === "late") score += 1;

    if (highWind && score < 2) {
        score += 1;
    }

    return clamp(score, 0, 5);
}

function applyRain(matrix, intensity) {
    switch (intensity) {
        case "light":
            matrix.wetness += 1;
            break;
        case "moderate":
            matrix.wetness += 2;
            matrix.mud += 1;
            matrix.dryness -= 1;
            break;
        case "hard":
            matrix.wetness += 2;
            matrix.mud += 2;
            matrix.standingWater += 1;
            matrix.dryness -= 2;
            break;
        case "severe":
            matrix.wetness += 2;
            matrix.mud += 2;
            matrix.standingWater += 2;
            matrix.dryness -= 3;
            break;
        default:
            break;
    }
}

function applySnow(matrix, intensity) {
    switch (intensity) {
        case "light":
            matrix.snowCover += 1;
            matrix.dryness -= 1;
            break;
        case "moderate":
            matrix.snowCover += 2;
            matrix.dryness -= 1;
            break;
        case "hard":
            matrix.snowCover += 2;
            matrix.wetness += 1;
            matrix.dryness -= 2;
            break;
        case "severe":
            matrix.snowCover += 2;
            matrix.wetness += 1;
            matrix.dryness -= 2;
            break;
        default:
            break;
    }
}

function applySleet(matrix, intensity) {
    switch (intensity) {
        case "light":
            matrix.wetness += 1;
            matrix.mud += 1;
            matrix.dryness -= 1;
            break;
        case "moderate":
            matrix.wetness += 1;
            matrix.mud += 1;
            matrix.dryness -= 1;
            break;
        case "hard":
            matrix.wetness += 2;
            matrix.mud += 2;
            matrix.standingWater += 1;
            matrix.dryness -= 2;
            break;
        case "severe":
            matrix.wetness += 2;
            matrix.mud += 2;
            matrix.standingWater += 1;
            matrix.dryness -= 2;
            break;
        default:
            break;
    }
}

function applySnowMelt(matrix, currentDay) {
    const tempC = Number(currentDay?.tempC ?? 0);

    if (matrix.snowCover <= 0) return;

    if (tempC >= 8) {
        const melt = Math.min(2, matrix.snowCover);
        matrix.snowCover -= melt;
        matrix.wetness += 1;
    } else if (tempC >= 3) {
        const melt = Math.min(1, matrix.snowCover);
        matrix.snowCover -= melt;
        matrix.wetness += 1;
    }
}

function decayStandingWater(matrix, score, environment = {}) {
    if (matrix.standingWater <= 0) return;

    let decay = 0;

    if (score >= 3) decay = 1;
    if (score >= 5) decay = 2;

    if (environment.biome === "swamp") decay -= 1;
    if (environment.biome === "coast") decay -= 1;
    if (environment.biome === "desert") decay += 1;
    if (environment.climate === "dry") decay += 1;

    decay = Math.max(0, decay);
    matrix.standingWater -= decay;
}

function decayMud(matrix, score, environment = {}) {
    if (matrix.mud <= 0) return;
    if (matrix.standingWater > 0) return;

    let decay = 0;

    if (score >= 2) decay = 1;
    if (score >= 4) decay = 2;

    if (environment.biome === "swamp") decay -= 1;
    if (environment.biome === "forest" || environment.biome === "coast") decay -= 1;
    if (environment.biome === "desert") decay += 1;
    if (environment.climate === "dry") decay += 1;

    decay = Math.max(0, decay);
    matrix.mud -= decay;
}

function decaySurfaceWetness(matrix, score, environment = {}) {
    if (matrix.wetness <= 0) return;
    if (matrix.standingWater > 0) return;
    if (matrix.mud > 1) return;

    let decay = 0;

    if (score >= 1) decay = 1;
    if (score >= 4) decay = 2;

    if (environment.biome === "swamp") decay -= 1;
    if (environment.biome === "forest" || environment.biome === "coast") decay -= 1;
    if (environment.biome === "desert") decay += 1;
    if (environment.climate === "dry") decay += 1;

    decay = Math.max(0, decay);
    matrix.wetness -= decay;
}

function growDryness(matrix, score, environment = {}) {
    if (matrix.standingWater > 0) return;
    if (matrix.mud > 0) return;
    if (matrix.wetness > 1) return;
    if (matrix.snowCover > 0) return;

    const cap = getDrynessCap(environment);

    if (score >= 2) {
        matrix.dryness += 1;
    }

    if (score >= 5 && matrix.dryness >= 2 && cap >= 4) {
        matrix.dryness += 1;
    }

    matrix.dryness = Math.min(matrix.dryness, cap);
}

function softenDrynessAgainstWetStates(matrix) {
    if (matrix.standingWater >= 1) {
        matrix.dryness = 0;
        return;
    }

    if (matrix.mud >= 2) {
        matrix.dryness = Math.min(matrix.dryness, 0);
        return;
    }

    if (matrix.mud >= 1 || matrix.wetness >= 3) {
        matrix.dryness = Math.min(matrix.dryness, 1);
        return;
    }

    if (matrix.wetness >= 2) {
        matrix.dryness = Math.min(matrix.dryness, 2);
    }
}

function reconcileContradictions(matrix, environment = {}) {
    if (matrix.snowCover >= 2) {
        matrix.standingWater = Math.max(0, matrix.standingWater - 1);
        matrix.dryness = Math.max(0, matrix.dryness - 1);
    }

    softenDrynessAgainstWetStates(matrix);

    if (matrix.wetness === 0 && matrix.standingWater === 0) {
        matrix.mud = Math.min(matrix.mud, 4);
    }

    if (matrix.wetness === 0 && matrix.mud === 0 && matrix.standingWater === 0) {
        matrix.snowCover = Math.max(0, matrix.snowCover);
    }

    const drynessCap = getDrynessCap(environment);
    matrix.dryness = Math.min(matrix.dryness, drynessCap);
}

export function updateWordingMatrix(matrix, currentDay, environment = {}) {
    const next = normalizeMatrix(matrix);

    if (currentDay?.precipActive) {
        if (currentDay.precipType === "rain") {
            applyRain(next, currentDay.precipIntensity);
        } else if (currentDay.precipType === "snow") {
            applySnow(next, currentDay.precipIntensity);
        } else if (currentDay.precipType === "sleet") {
            applySleet(next, currentDay.precipIntensity);
        }
    }

    applySnowMelt(next, currentDay);

    if (!currentDay?.precipActive) {
        const dryingScore = getDryingScore(currentDay, environment);
        decayStandingWater(next, dryingScore, environment);
        decayMud(next, dryingScore, environment);
        decaySurfaceWetness(next, dryingScore, environment);
        growDryness(next, dryingScore, environment);
    }

    reconcileContradictions(next, environment);

    return normalizeMatrix(next);
}

function buildGroundLines(matrix) {
    const lines = [];
    const wetness = Number(matrix?.wetness ?? 0);
    const mud = Number(matrix?.mud ?? 0);
    const standingWater = Number(matrix?.standingWater ?? 0);
    const snowCover = Number(matrix?.snowCover ?? 0);
    const dryness = Number(matrix?.dryness ?? 0);

    if (snowCover >= 4) {
        lines.push("Deep snow covers most surfaces.");
    } else if (snowCover >= 2) {
        lines.push("Snow cover is visible across the ground.");
    } else if (snowCover >= 1) {
        lines.push("A light dusting of snow remains.");
    }

    if (standingWater >= 4) {
        lines.push("Low ground is waterlogged.");
    } else if (standingWater >= 2) {
        lines.push("Standing water spreads across low ground.");
    } else if (standingWater >= 1) {
        lines.push("Puddles are common in low spots.");
    }

    if (mud >= 4) {
        lines.push("Deep mud dominates the ground.");
    } else if (mud >= 2) {
        lines.push("Heavy mud slows footing.");
    } else if (mud >= 1) {
        lines.push("Mud is building on softer paths.");
    }

    if (standingWater <= 1 && mud <= 1) {
        if (wetness >= 4) {
            lines.push("The ground is saturated.");
        } else if (wetness >= 2) {
            lines.push("The ground is damp underfoot.");
        } else if (wetness >= 1) {
            lines.push("The ground is lightly damp.");
        }
    }

    if (standingWater === 0 && mud === 0 && wetness <= 1) {
        if (dryness >= 5) {
            lines.push("The area feels parched.");
        } else if (dryness >= 4) {
            lines.push("The ground has baked hard.");
        } else if (dryness >= 3) {
            lines.push("The ground is notably dry.");
        } else if (dryness >= 2) {
            lines.push("The ground is dry and firm.");
        } else if (dryness >= 1) {
            lines.push("The ground is starting to firm.");
        }
    }

    return lines.slice(0, 3);
}

export function getMatrixAftermathLines(matrix, environment = {}) {
    const lines = buildGroundLines(matrix);

    if (environment.ruinsEnabled) {
        const ruinLines = getRuinsDescriptorLines(matrix);
        if (ruinLines.length) {
            lines.push(ruinLines[0]);
        }
    }

    return lines.slice(0, 4);
}