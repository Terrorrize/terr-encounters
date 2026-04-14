/**
 * terr-encounters v0.1.0-b4
 * Function: updates the wording matrix from the resolved day and extracts
 * descriptive aftermath lines. This affects description only, not future trend
 * generation.
 */

import { getMatrixDescriptorLines } from "../../data/weather/weather-language.js";
import { getRuinsDescriptorLines } from "../../data/weather/weather-ruins.js";
import { clamp } from "./weather-utils.js";

export const WEATHER_MATRIX_VERSION = "0.1.0-b4";

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

    matrix.dryness -= 1;
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

    matrix.dryness -= 1;
}

function applyDrying(matrix, currentDay) {
    const warmDry = Number(currentDay.tempC ?? 0) >= 18;
    const mildDry = Number(currentDay.tempC ?? 0) >= 12;
    const brightSky = currentDay.cloudFace === "bright";
    const windy = currentDay.windIntensity === "strong" || currentDay.windIntensity === "severe";

    let dryPower = 0;

    if (warmDry) dryPower += 2;
    else if (mildDry) dryPower += 1;

    if (brightSky) dryPower += 1;
    if (windy) dryPower += 1;

    if (dryPower <= 0) return;

    matrix.wetness -= dryPower >= 2 ? 1 : 0;
    matrix.mud -= dryPower >= 3 ? 1 : 0;
    matrix.standingWater -= dryPower >= 4 ? 1 : 0;
    matrix.dryness += 1;
}

function applySnowMelt(matrix, currentDay) {
    const tempC = Number(currentDay.tempC ?? 0);

    if (tempC >= 8) {
        matrix.snowCover -= 2;
        matrix.wetness += 1;
    } else if (tempC >= 3) {
        matrix.snowCover -= 1;
        matrix.wetness += 1;
    }
}

export function updateWordingMatrix(matrix, currentDay) {
    const next = normalizeMatrix(matrix);

    if (currentDay.precipActive) {
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
    applyDrying(next, currentDay);

    return normalizeMatrix(next);
}

export function getMatrixAftermathLines(matrix, environment = {}) {
    const lines = [...getMatrixDescriptorLines(matrix)];

    if (environment.ruinsEnabled) {
        lines.push(...getRuinsDescriptorLines(matrix));
    }

    return lines;
}