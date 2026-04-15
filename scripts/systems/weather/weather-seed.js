/**
 * terr-encounters v0.1.0-b6
 * Function: builds a new active weather trend from biome/climate/season/phase
 * baseline tables, with light carryover from the previous trend and stronger
 * coherence between condition, precipitation, wind, and temperature.
 */

import { getBaselineLeaf, getTempRangeForBand } from "../../data/weather/weather-baselines.js";
import { createWeatherId, deepClone, weightedPick, weightedPickNumber } from "./weather-utils.js";

export const WEATHER_SEED_VERSION = "0.1.0-b6";

function cloneWeights(weights = {}) {
    return deepClone(weights);
}

function addWeight(map, key, amount) {
    if (!key || !Number.isFinite(amount) || amount === 0) return;
    map[key] = Math.max(0, Number(map[key] ?? 0) + amount);
}

function applyConditionCarryover(conditionWeights, previousTrend) {
    if (!previousTrend) return;

    addWeight(conditionWeights, previousTrend.condition, 3);

    const longRun = Number(previousTrend.durationDays ?? 0) >= 7;
    const intensePrecip =
        previousTrend.precipIntensity === "hard" || previousTrend.precipIntensity === "severe";
    const intenseWind =
        previousTrend.windIntensity === "strong" || previousTrend.windIntensity === "severe";

    if (longRun || intensePrecip || intenseWind) {
        switch (previousTrend.condition) {
            case "rainy":
                addWeight(conditionWeights, "clear", 7);
                addWeight(conditionWeights, "overcast", 4);
                addWeight(conditionWeights, "foggy", 2);
                break;
            case "snowy":
                addWeight(conditionWeights, "cold", 4);
                addWeight(conditionWeights, "clear", 4);
                addWeight(conditionWeights, "overcast", 2);
                break;
            case "hot":
                addWeight(conditionWeights, "warm", 4);
                addWeight(conditionWeights, "clear", 3);
                break;
            case "cold":
                addWeight(conditionWeights, "clear", 3);
                addWeight(conditionWeights, "overcast", 2);
                break;
            case "windy":
                addWeight(conditionWeights, "clear", 2);
                addWeight(conditionWeights, "overcast", 2);
                break;
            default:
                break;
        }

        addWeight(conditionWeights, previousTrend.condition, -5);
    }
}

function applyPrecipCarryover(precipTypeWeights, precipIntensityWeights, precipPatternWeights, previousTrend) {
    if (!previousTrend) return;

    addWeight(precipTypeWeights, previousTrend.precipType, 2);
    addWeight(precipPatternWeights, previousTrend.precipPattern, 2);

    if (previousTrend.precipIntensity === "hard" || previousTrend.precipIntensity === "severe") {
        addWeight(precipIntensityWeights, previousTrend.precipIntensity, -8);
        addWeight(precipIntensityWeights, "light", 4);
        addWeight(precipIntensityWeights, "moderate", 3);
        addWeight(precipTypeWeights, "none", 5);
    } else if (previousTrend.precipType !== "none") {
        addWeight(precipIntensityWeights, previousTrend.precipIntensity, 1);
        addWeight(precipTypeWeights, "none", 2);
    }

    if (previousTrend.precipPattern === "constant") {
        addWeight(precipPatternWeights, "constant", -6);
        addWeight(precipPatternWeights, "sporadic", 3);
        addWeight(precipPatternWeights, "frequent", 2);
    }
}

function applyWindCarryover(windIntensityWeights, windPatternWeights, previousTrend) {
    if (!previousTrend) return;

    addWeight(windIntensityWeights, previousTrend.windIntensity, 2);
    addWeight(windPatternWeights, previousTrend.windPattern, 2);

    if (previousTrend.windIntensity === "strong" || previousTrend.windIntensity === "severe") {
        addWeight(windIntensityWeights, previousTrend.windIntensity, -5);
        addWeight(windIntensityWeights, "light", 2);
        addWeight(windIntensityWeights, "moderate", 3);
    }
}

function applyDurationAdjustments(durationWeights, precipPattern, windPattern, condition) {
    if (precipPattern === "constant" || windPattern === "constant") {
        addWeight(durationWeights, 8, -2);
        addWeight(durationWeights, 9, -3);
        addWeight(durationWeights, 10, -4);
        addWeight(durationWeights, 3, 2);
        addWeight(durationWeights, 4, 2);
        addWeight(durationWeights, 5, 1);
    }

    if (condition === "clear" || condition === "warm" || condition === "cold" || condition === "overcast") {
        addWeight(durationWeights, 6, 1);
        addWeight(durationWeights, 7, 1);
        addWeight(durationWeights, 8, 1);
    }
}

function enforceConditionTempBand(condition, tempBand) {
    if (condition === "hot" && (tempBand === "freezing" || tempBand === "cold" || tempBand === "cool")) {
        return "warm";
    }

    if (condition === "warm" && (tempBand === "freezing" || tempBand === "cold")) {
        return "mild";
    }

    if (condition === "cold" && (tempBand === "warm" || tempBand === "hot" || tempBand === "severe_heat")) {
        return "cool";
    }

    if (condition === "snowy" && (tempBand === "warm" || tempBand === "hot" || tempBand === "severe_heat")) {
        return "cold";
    }

    return tempBand;
}

function enforceTemperaturePrecipCoherence(tempBand, precipType, precipIntensity) {
    let nextType = precipType;
    let nextIntensity = precipIntensity;

    if (tempBand === "freezing") {
        if (nextType === "rain") nextType = "snow";
        if (nextType === "sleet") nextType = "snow";
    }

    if (tempBand === "cold") {
        if (nextType === "rain") nextType = "sleet";
    }

    if (tempBand === "warm" || tempBand === "hot" || tempBand === "severe_heat") {
        if (nextType === "snow") nextType = "rain";
        if (nextType === "sleet") nextType = "rain";
    }

    if (nextType === "none") {
        nextIntensity = "none";
    }

    return {
        precipType: nextType,
        precipIntensity: nextIntensity
    };
}

function enforceConditionPrecip(condition, tempBand, precipType, precipIntensity, precipPattern) {
    let nextType = precipType;
    let nextIntensity = precipIntensity;
    let nextPattern = precipPattern;

    if (condition === "rainy") {
        if (nextType === "none" || nextType === "snow") {
            nextType = tempBand === "freezing" || tempBand === "cold" ? "sleet" : "rain";
        }

        if (nextIntensity === "none") {
            nextIntensity = "light";
        }

        if (nextPattern === "sporadic") {
            nextPattern = "frequent";
        }
    }

    if (condition === "snowy") {
        nextType = tempBand === "warm" || tempBand === "hot" || tempBand === "severe_heat" ? "sleet" : "snow";

        if (nextIntensity === "none") {
            nextIntensity = "light";
        }

        if (nextPattern === "sporadic") {
            nextPattern = "frequent";
        }
    }

    if (condition === "clear") {
        nextType = "none";
        nextIntensity = "none";
        nextPattern = "sporadic";
    }

    if (condition === "foggy") {
        if (nextType === "snow") {
            nextType = tempBand === "freezing" ? "snow" : "none";
        }

        if (nextType !== "none" && nextIntensity !== "none") {
            if (nextIntensity === "hard" || nextIntensity === "severe") {
                nextIntensity = "light";
            }
            if (nextPattern === "constant") {
                nextPattern = "sporadic";
            }
        }
    }

    if (condition === "overcast") {
        if (nextType !== "none" && nextIntensity !== "none") {
            if (nextIntensity === "hard" || nextIntensity === "severe") {
                nextIntensity = "moderate";
            }
        }
    }

    if (nextType === "none") {
        nextIntensity = "none";
        nextPattern = "sporadic";
    }

    const tempCoherent = enforceTemperaturePrecipCoherence(tempBand, nextType, nextIntensity);

    return {
        precipType: tempCoherent.precipType,
        precipIntensity: tempCoherent.precipIntensity,
        precipPattern: nextType === "none" ? "sporadic" : nextPattern
    };
}

function enforceConditionWind(condition, windIntensity, windPattern) {
    let nextIntensity = windIntensity;
    let nextPattern = windPattern;

    if (condition === "windy") {
        if (nextIntensity === "calm" || nextIntensity === "light") {
            nextIntensity = "moderate";
        }
        if (nextPattern === "sporadic") {
            nextPattern = "frequent";
        }
    }

    if (condition === "foggy" && nextIntensity === "severe") {
        nextIntensity = "strong";
    }

    if (nextIntensity === "calm") {
        nextPattern = "sporadic";
    }

    return {
        windIntensity: nextIntensity,
        windPattern: nextPattern
    };
}

export function buildActiveTrend(environment, previousTrend = null) {
    const leaf = getBaselineLeaf(
        environment?.biome,
        environment?.climate,
        environment?.season,
        environment?.phase
    );

    const conditionWeights = cloneWeights(leaf.conditions);
    const tempBandWeights = cloneWeights(leaf.tempBands);
    const tempMotionWeights = cloneWeights(leaf.tempMotion);
    const tempMotionStrengthWeights = cloneWeights(leaf.tempMotionStrength);
    const precipTypeWeights = cloneWeights(leaf.precipTypes);
    const precipIntensityWeights = cloneWeights(leaf.precipIntensity);
    const precipPatternWeights = cloneWeights(leaf.precipPattern);
    const windIntensityWeights = cloneWeights(leaf.windIntensity);
    const windPatternWeights = cloneWeights(leaf.windPattern);
    const durationWeights = cloneWeights(leaf.durationWeights);

    applyConditionCarryover(conditionWeights, previousTrend);
    applyPrecipCarryover(precipTypeWeights, precipIntensityWeights, precipPatternWeights, previousTrend);
    applyWindCarryover(windIntensityWeights, windPatternWeights, previousTrend);

    const condition = weightedPick(conditionWeights) ?? "clear";

    let tempBand = weightedPick(tempBandWeights) ?? "mild";
    tempBand = enforceConditionTempBand(condition, tempBand);

    const tempMotion = weightedPick(tempMotionWeights) ?? "holding";
    const tempMotionStrength = weightedPick(tempMotionStrengthWeights) ?? "slight";

    let precipType = weightedPick(precipTypeWeights) ?? "none";
    let precipIntensity =
        precipType === "none" ? "none" : (weightedPick(precipIntensityWeights) ?? "light");
    let precipPattern =
        precipType === "none" ? "sporadic" : (weightedPick(precipPatternWeights) ?? "sporadic");

    const precipResult = enforceConditionPrecip(condition, tempBand, precipType, precipIntensity, precipPattern);
    precipType = precipResult.precipType;
    precipIntensity = precipResult.precipIntensity;
    precipPattern = precipResult.precipPattern;

    let windIntensity = weightedPick(windIntensityWeights) ?? "calm";
    let windPattern = windIntensity === "calm" ? "sporadic" : (weightedPick(windPatternWeights) ?? "sporadic");

    const windResult = enforceConditionWind(condition, windIntensity, windPattern);
    windIntensity = windResult.windIntensity;
    windPattern = windResult.windPattern;

    applyDurationAdjustments(durationWeights, precipPattern, windPattern, condition);

    const durationDays = weightedPickNumber(durationWeights) ?? 3;
    const tempRange = getTempRangeForBand(leaf, tempBand);
    const seedTempC = Math.round((tempRange.min + tempRange.max) / 2);

    return {
        id: createWeatherId("trend"),
        durationDays,
        dayIndex: 1,
        condition,
        tempBand,
        seedTempC,
        tempMinC: tempRange.min,
        tempMaxC: tempRange.max,
        tempMotion,
        tempMotionStrength,
        precipType,
        precipIntensity,
        precipPattern,
        windIntensity,
        windPattern
    };
}