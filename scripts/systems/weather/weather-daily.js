// FILE: scripts/systems/weather/weather-daily.js
/**
 * terr-encounters v0.1.0-b6
 * Function: resolves one concrete day from the active weather trend. This
 * revision makes overcast/fog drier more often, reduces rain frequency inside
 * trends, compresses intensity toward light, and improves snow/rain coherence
 * by temperature band.
 */

import {
    getCloudFaceLabel,
    getConditionLine,
    getPrecipLine,
    getTempMotionLine,
    getWindLine
} from "../../data/weather/weather-language.js";
import { cToF, clamp, randomInt } from "./weather-utils.js";

export const WEATHER_DAILY_VERSION = "0.1.0-b6";

const PRECIP_ACTIVE_CHANCES = {
    sporadic: 25,
    frequent: 52,
    constant: 78
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

function getPrecipActiveChance(trend, resolvedTempC) {
    let chance = PRECIP_ACTIVE_CHANCES[trend.precipPattern] ?? 25;

    if (trend.condition === "rainy" || trend.condition === "snowy") chance += 12;
    if (trend.condition === "overcast") chance -= 8;
    if (trend.condition === "foggy") chance -= 14;

    if (trend.precipIntensity === "hard") chance += 3;
    if (trend.precipIntensity === "severe") chance += 6;

    if (trend.precipType === "snow") chance += 4;
    if (trend.precipType === "none") chance = 0;

    if (trend.precipPattern === "constant" && trend.condition !== "rainy" && trend.condition !== "snowy") {
        chance -= 8;
    }

    if (resolvedTempC <= 0 && trend.precipType === "rain") {
        chance -= 10;
    }

    return clamp(chance, 0, 100);
}

function getWindActiveChance(trend) {
    let chance = WIND_ACTIVE_CHANCES[trend.windPattern] ?? 35;

    if (trend.condition === "windy") chance += 15;
    if (trend.windIntensity === "strong") chance += 10;
    if (trend.windIntensity === "severe") chance += 15;

    return clamp(chance, 0, 100);
}

function normalizePrecipTypeForTemp(baseType, tempC) {
    if (baseType === "none") return "none";

    if (tempC <= 0) {
        if (baseType === "rain" || baseType === "sleet") return "snow";
        return baseType;
    }

    if (tempC <= 3) {
        if (baseType === "rain") return "sleet";
        return baseType;
    }

    if (tempC >= 8) {
        if (baseType === "snow" || baseType === "sleet") return "rain";
    }

    return baseType;
}

function resolveActualPrecipIntensity(trend, precipType, precipActive) {
    if (!precipActive || precipType === "none" || trend.precipIntensity === "none") {
        return "none";
    }

    const roll = randomInt(1, 100);
    const base = trend.precipIntensity;

    if (base === "light") {
        if (roll <= 78) return "light";
        if (roll <= 97) return "moderate";
        return "hard";
    }

    if (base === "moderate") {
        if (roll <= 58) return "light";
        if (roll <= 92) return "moderate";
        if (roll <= 99) return "hard";
        return "severe";
    }

    if (base === "hard") {
        if (roll <= 52) return "light";
        if (roll <= 84) return "moderate";
        if (roll <= 98) return "hard";
        return "severe";
    }

    if (base === "severe") {
        if (roll <= 40) return "light";
        if (roll <= 75) return "moderate";
        if (roll <= 94) return "hard";
        return "severe";
    }

    return "light";
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

function resolveCloudFace(trend, precipActive, actualPrecipIntensity, windActive) {
    if (trend.condition === "clear" && !precipActive) return "bright";
    if (trend.condition === "overcast") return actualPrecipIntensity === "hard" || actualPrecipIntensity === "severe" ? "storm" : "grey";
    if (trend.condition === "foggy") return "low";
    if (precipActive && (actualPrecipIntensity === "hard" || actualPrecipIntensity === "severe")) return "storm";
    if (windActive && (trend.windIntensity === "strong" || trend.windIntensity === "severe")) return "grey";
    return "mixed";
}

function resolveStormFlags(precipType, actualPrecipIntensity, windIntensity) {
    const thunder =
        precipType === "rain" &&
        (actualPrecipIntensity === "hard" || actualPrecipIntensity === "severe") &&
        rollPercent(windIntensity === "strong" || windIntensity === "severe" ? 40 : 28);

    const lightning = thunder && rollPercent(40);

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

    const precipBaseType = normalizePrecipTypeForTemp(trend.precipType, tempC);
    const precipActive = precipBaseType === "none" ? false : rollPercent(getPrecipActiveChance(trend, tempC));
    const windActive = trend.windIntensity === "calm" ? false : rollPercent(getWindActiveChance(trend));

    const precipIntensity = resolveActualPrecipIntensity(trend, precipBaseType, precipActive);
    const windIntensity = resolveActualWindIntensity(trend, windActive);
    const cloudFace = resolveCloudFace(trend, precipActive, precipIntensity, windActive);
    const stormFlags = resolveStormFlags(precipActive ? precipBaseType : "none", precipIntensity, windIntensity);

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
        precipType: precipActive ? precipBaseType : "none",
        precipIntensity,
        windActive,
        windIntensity,
        cloudFace,
        cloudFaceLabel: getCloudFaceLabel(cloudFace),
        stormFlags,
        summaryLines
    };
}