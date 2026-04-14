// FILE: scripts/systems/weather/weather-daily.js
/**
 * terr-encounters v0.1.0-b5
 * Function: resolves one concrete day from the active weather trend. This turns
 * the trend packet into an exact day with temperature, precip/wind activation,
 * cloud face, storm flags, and summary lines.
 */

import {
    getCloudFaceLabel,
    getConditionLine,
    getPrecipLine,
    getTempMotionLine,
    getWindLine
} from "../../data/weather/weather-language.js";
import { cToF, clamp, randomInt } from "./weather-utils.js";

export const WEATHER_DAILY_VERSION = "0.1.0-b5";

const PRECIP_ACTIVE_CHANCES = {
    sporadic: 45,
    frequent: 70,
    constant: 95
};

const WIND_ACTIVE_CHANCES = {
    sporadic: 35,
    frequent: 70,
    constant: 95
};

const TEMP_DRIFT_TOTALS = {
    slight: [1, 2],
    steady: [2, 4],
    sharp: [4, 6]
};

function rollPercent(chance) {
    return randomInt(1, 100) <= chance;
}

function getProgress(dayIndex, durationDays) {
    if (durationDays <= 1) return 0;
    return clamp((dayIndex - 1) / (durationDays - 1), 0, 1);
}

function getDriftTotal(strength) {
    const range = TEMP_DRIFT_TOTALS[strength] ?? TEMP_DRIFT_TOTALS.slight;
    return randomInt(range[0], range[1]);
}

function resolveTemperatureC(trend) {
    const progress = getProgress(Number(trend.dayIndex ?? 1), Number(trend.durationDays ?? 1));
    const wobble = randomInt(-1, 1);

    if (trend.tempMotion === "holding") {
        return clamp(trend.seedTempC + wobble, trend.tempMinC, trend.tempMaxC);
    }

    const driftTotal = getDriftTotal(trend.tempMotionStrength);
    const signedDrift = Math.round(driftTotal * progress) * (trend.tempMotion === "rising" ? 1 : -1);

    return clamp(trend.seedTempC + signedDrift + wobble, trend.tempMinC, trend.tempMaxC);
}

function getPrecipActiveChance(trend) {
    let chance = PRECIP_ACTIVE_CHANCES[trend.precipPattern] ?? 45;

    if (trend.condition === "rainy" || trend.condition === "snowy") chance += 10;
    if (trend.precipIntensity === "hard") chance += 5;
    if (trend.precipIntensity === "severe") chance += 10;

    return clamp(chance, 0, 100);
}

function getWindActiveChance(trend) {
    let chance = WIND_ACTIVE_CHANCES[trend.windPattern] ?? 35;

    if (trend.condition === "windy") chance += 15;
    if (trend.windIntensity === "strong") chance += 10;
    if (trend.windIntensity === "severe") chance += 15;

    return clamp(chance, 0, 100);
}

function resolveActualPrecipIntensity(trend, precipActive) {
    if (!precipActive || trend.precipType === "none" || trend.precipIntensity === "none") {
        return "none";
    }

    const order = ["light", "moderate", "hard", "severe"];
    const index = Math.max(0, order.indexOf(trend.precipIntensity));
    const shift = randomInt(-1, 1);
    return order[clamp(index + shift, 0, order.length - 1)];
}

function resolveActualWindIntensity(trend, windActive) {
    if (!windActive || trend.windIntensity === "calm") {
        return "calm";
    }

    const order = ["light", "moderate", "strong", "severe"];
    const index = Math.max(0, order.indexOf(trend.windIntensity));
    const shift = randomInt(-1, 1);
    return order[clamp(index + shift, 0, order.length - 1)];
}

function resolveCloudFace(trend, precipActive, windActive) {
    if (trend.condition === "clear" && !precipActive) return "bright";
    if (trend.condition === "overcast") return "grey";
    if (trend.condition === "foggy") return "low";
    if (precipActive && (trend.precipIntensity === "hard" || trend.precipIntensity === "severe")) return "storm";
    if (windActive && (trend.windIntensity === "strong" || trend.windIntensity === "severe")) return "grey";
    return "mixed";
}

function resolveStormFlags(trend, precipActive) {
    const thunder =
        precipActive &&
        trend.precipType === "rain" &&
        (trend.precipIntensity === "hard" || trend.precipIntensity === "severe") &&
        rollPercent(35);

    const lightning = thunder && rollPercent(45);

    return { thunder, lightning };
}

export function resolveTrendDay(activeTrend, absoluteDay) {
    const trend = {
        ...activeTrend,
        dayIndex: Number(activeTrend?.dayIndex ?? 1),
        durationDays: Number(activeTrend?.durationDays ?? 1)
    };

    const tempC = resolveTemperatureC(trend);
    const tempF = cToF(tempC);
    const precipActive = trend.precipType === "none" ? false : rollPercent(getPrecipActiveChance(trend));
    const windActive = trend.windIntensity === "calm" ? false : rollPercent(getWindActiveChance(trend));
    const precipIntensity = resolveActualPrecipIntensity(trend, precipActive);
    const windIntensity = resolveActualWindIntensity(trend, windActive);
    const cloudFace = resolveCloudFace(trend, precipActive, windActive);
    const stormFlags = resolveStormFlags(trend, precipActive);

    const summaryLines = [
        `${trend.durationDays} Days`,
        getConditionLine(trend.condition, trend.tempBand),
        getPrecipLine(trend.precipType, trend.precipIntensity, trend.precipPattern),
        getTempMotionLine(trend.tempMotion, trend.tempMotionStrength),
        getWindLine(trend.windIntensity, trend.windPattern)
    ];

    return {
        absoluteDay: Number(absoluteDay ?? 1),
        trendDay: trend.dayIndex,
        tempC,
        tempF,
        precipActive,
        precipType: precipActive ? trend.precipType : "none",
        precipIntensity,
        windActive,
        windIntensity,
        cloudFace,
        cloudFaceLabel: getCloudFaceLabel(cloudFace),
        stormFlags,
        summaryLines
    };
}