/**
 * terr-encounters v0.1.0-b5
 * Function: updates the optional exposure tracker from resolved daily weather.
 * Exposure is a separate hardship meter and does not affect weather generation.
 */

import { clamp } from "./weather-utils.js";

export const WEATHER_EXPOSURE_VERSION = "0.1.0-b5";

function getExposureBand(total) {
    if (total >= 65) return "severe";
    if (total >= 45) return "heavy";
    if (total >= 25) return "moderate";
    if (total >= 10) return "light";
    return "none";
}

function getTempExposureDelta(currentDay) {
    const tempC = Number(currentDay?.tempC ?? 0);

    if (tempC <= -15) return 12;
    if (tempC <= -8) return 9;
    if (tempC <= -1) return 6;
    if (tempC <= 3) return 3;
    if (tempC >= 34) return 12;
    if (tempC >= 29) return 9;
    if (tempC >= 24) return 6;
    if (tempC >= 20) return 3;

    return -4;
}

function getWetExposureDelta(currentDay) {
    if (!currentDay?.precipActive) return 0;

    if (currentDay.precipType === "rain" || currentDay.precipType === "sleet") {
        switch (currentDay.precipIntensity) {
            case "light":
                return 2;
            case "moderate":
                return 4;
            case "hard":
                return 6;
            case "severe":
                return 8;
            default:
                return 0;
        }
    }

    if (currentDay.precipType === "snow") {
        switch (currentDay.precipIntensity) {
            case "light":
                return 1;
            case "moderate":
                return 3;
            case "hard":
                return 5;
            case "severe":
                return 7;
            default:
                return 0;
        }
    }

    return 0;
}

function getWindExposureDelta(currentDay) {
    switch (currentDay?.windIntensity) {
        case "light":
            return 1;
        case "moderate":
            return 2;
        case "strong":
            return 4;
        case "severe":
            return 6;
        default:
            return 0;
    }
}

export function updateExposure(exposure, currentDay, environment = {}) {
    const enabled = Boolean(exposure?.enabled);
    const currentTotal = clamp(Number(exposure?.total ?? 0), 0, 100);

    if (!enabled) {
        return {
            enabled: false,
            total: currentTotal,
            band: getExposureBand(currentTotal)
        };
    }

    let delta = 0;
    delta += getTempExposureDelta(currentDay);
    delta += getWetExposureDelta(currentDay);
    delta += getWindExposureDelta(currentDay);

    if (environment?.sheltered === true) {
        delta -= 6;
    }

    const nextTotal = clamp(currentTotal + delta, 0, 100);

    return {
        enabled: true,
        total: nextTotal,
        band: getExposureBand(nextTotal)
    };
}

export function getExposureLine(exposure) {
    if (!exposure?.enabled) return "";
    return `Exposure: ${exposure.band} (${Number(exposure.total ?? 0)})`;
}