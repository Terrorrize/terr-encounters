/**
 * terr-encounters v0.1.0-b6
 * Function: updates the wording matrix from the resolved day and extracts
 * descriptive aftermath lines. Drying and descriptor selection now enforce
 * exclusivity so wet and dry extremes do not present together.
 */

import { getRuinsDescriptorLines } from "../../data/weather/weather-ruins.js";
import { clamp } from "./weather-utils.js";

export const WEATHER_MATRIX_VERSION = "0.1.0-b6";

function normalizeMatrix(matrix = {}) {
    return {
        wetness: clamp(Number(matrix.wetness ?? 0), 0, 5),
        mud: clamp(Number(matrix.mud ?? 0), 0, 5),
        standingWater: clamp(Number(matrix.standingWater ?? 0), 0, 5),
        snowCover: clamp(Number(matrix.snowCover ?? 0), 0, 5),
        dryness: clamp(Number(matrix.dryness ?? 0), 0, 5)
    };
}

function applyRain(matrix, intensity) {
    switch (intensity) {
        case "light":
            matrix.wetness += 1;
            break;
        case "moderate":
            matrix.wetness += 2;
            matrix.mud += 1;
            break;
        case "hard":
            matrix.wetness += 2;
            matrix.mud += 2;
            matrix.standingWater += 1;
            break;
        case "severe":
            matrix.wetness += 2;
            matrix.mud += 2;
            matrix.standingWater += 2;
            break;
        default:
            break;
    }

    matrix.dryness -= 2;
}

function applySnow(matrix, intensity) {
    switch (intensity) {
        case "light":
            matrix.snowCover += 1;
            break;
        case "moderate":
            matrix.snowCover += 2;
            break;
        case "hard":
        case "severe":
            matrix.snowCover += 2;
            matrix.wetness += 1;
            break;
        default:
            break;
    }

    matrix.dryness -= 1;
}

function applySleet(matrix, intensity) {
    matrix.wetness += 1;
    matrix.mud += 1;

    if (intensity === "hard" || intensity === "severe") {
        matrix.standingWater += 1;
    }

    matrix.dryness -= 2;
}

function getDryBias(environment = {}) {
    let dryBias = 0;

    switch (environment.climate) {
        case "dry":
            dryBias += 2;
            break;
        case "tropical":
            dryBias -= 1;
            break;
        case "continental":
            dryBias += 0;
            break;
        case "polar":
            dryBias -= 3;
            break;
        default:
            break;
    }

    switch (environment.biome) {
        case "desert":
        case "plains":
        case "hills":
        case "urban_fringe":
            dryBias += 1;
            break;
        case "swamp":
            dryBias -= 2;
            break;
        case "forest":
        case "coast":
        case "mountains":
        case "tundra":
        default:
            break;
    }

    switch (environment.season) {
        case "summer":
            dryBias += 1;
            break;
        case "winter":
            dryBias -= 2;
            break;
        default:
            break;
    }

    if (environment.season === "summer" && environment.phase === "late") {
        dryBias += 1;
    }

    return dryBias;
}

function applySnowMelt(matrix, currentDay) {
    const tempC = Number(currentDay?.tempC ?? 0);

    if (tempC >= 8) {
        matrix.snowCover -= 2;
        matrix.wetness += 1;
    } else if (tempC >= 3) {
        matrix.snowCover -= 1;
        matrix.wetness += 1;
    }
}

function applyDrying(matrix, currentDay, environment = {}) {
    const tempC = Number(currentDay?.tempC ?? 0);
    const brightSky = currentDay?.cloudFace === "bright";
    const mixedSky = currentDay?.cloudFace === "mixed";
    const breezy = currentDay?.windIntensity === "moderate";
    const windy = currentDay?.windIntensity === "strong" || currentDay?.windIntensity === "severe";
    const dryBias = getDryBias(environment);

    let dryPower = 0;

    if (tempC >= 24) dryPower += 3;
    else if (tempC >= 18) dryPower += 2;
    else if (tempC >= 12) dryPower += 1;

    if (brightSky) dryPower += 2;
    else if (mixedSky) dryPower += 1;

    if (windy) dryPower += 2;
    else if (breezy) dryPower += 1;

    dryPower += dryBias;

    if (dryPower <= 0) return;

    matrix.dryness += 1;

    if (dryPower >= 2) {
        matrix.wetness -= 1;
    }

    if (dryPower >= 3) {
        matrix.standingWater -= 1;
    }

    if (dryPower >= 4) {
        matrix.mud -= 1;
    }

    if (dryPower >= 5) {
        matrix.wetness -= 1;
        matrix.standingWater -= 1;
    }

    if (dryPower >= 6) {
        matrix.mud -= 1;
    }
}

function reconcileContradictions(matrix, environment = {}) {
    if (matrix.standingWater >= 3) {
        matrix.dryness = Math.min(matrix.dryness, 1);
    } else if (matrix.standingWater >= 1) {
        matrix.dryness = Math.min(matrix.dryness, 2);
    }

    if (matrix.mud >= 3) {
        matrix.dryness = Math.min(matrix.dryness, 2);
    } else if (matrix.mud >= 1) {
        matrix.dryness = Math.min(matrix.dryness, 3);
    }

    if (matrix.dryness >= 3) {
        matrix.wetness -= 1;
    }

    if (matrix.dryness >= 4) {
        matrix.standingWater -= 1;
        matrix.mud -= 1;
    }

    if ((environment.climate === "dry" || environment.biome === "desert" || environment.biome === "hills") && matrix.dryness >= 2) {
        matrix.standingWater -= 1;
    }

    if (matrix.snowCover >= 2) {
        matrix.dryness = Math.max(0, matrix.dryness - 1);
    }
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
    } else {
        next.dryness += 1;
    }

    applySnowMelt(next, currentDay);
    applyDrying(next, currentDay, environment);
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
        if (dryness >= 4) {
            lines.push("Dry conditions dominate the area.");
        } else if (dryness >= 2) {
            lines.push("The air and ground are starting to dry.");
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