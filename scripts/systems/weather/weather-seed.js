/**
 * terr-encounters v0.1.0-b4
 * Function: builds a new active weather trend from biome/climate/season/phase
 * baseline tables, with light carryover from the previous trend.
 */

import { getBaselineLeaf, getTempRangeForBand } from "../../data/weather/weather-baselines.js";
import { createWeatherId, deepClone, weightedPick, weightedPickNumber } from "./weather-utils.js";

export const WEATHER_SEED_VERSION = "0.1.0-b4";

function cloneWeights(weights = {}) {
    return deepClone(weights);
}

function addWeight(map, key, amount) {
    if (!key || !Number.isFinite(amount) || amount === 0) return;
    map[key] = Math.max(0, Number(map[key] ?? 0) + amount);
}

function applyConditionCarryover(conditionWeights, previousTrend) {
    if (!previousTrend) return;

    addWeight(conditionWeights, previousTrend.condition, 4);

    const longRun = Number(previousTrend.durationDays ?? 0) >= 7;
    const intensePrecip =
        previousTrend.precipIntensity === "hard" || previousTrend.precipIntensity === "severe";
    const intenseWind =
        previousTrend.windIntensity === "strong" || previousTrend.windIntensity === "severe";

    if (longRun || intensePrecip || intenseWind) {
        switch (previousTrend.condition) {
            case "rainy":
                addWeight(conditionWeights, "clear", 6);
                addWeight(conditionWeights, "overcast", 3);
                break;
            case "snowy":
                addWeight(conditionWeights, "cold", 4);
                addWeight(conditionWeights, "clear", 4);
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

    addWeight(precipTypeWeights, previousTrend.precipType, 3);
    addWeight(precipPatternWeights, previousTrend.precipPattern, 2);

    if (previousTrend.precipIntensity === "hard" || previousTrend.precipIntensity === "severe") {
        addWeight(precipIntensityWeights, previousTrend.precipIntensity, -6);
        addWeight(precipIntensityWeights, "light", 2);
        addWeight(precipIntensityWeights, "moderate", 3);
        addWeight(precipTypeWeights, "none", 4);
    } else if (previousTrend.precipType !== "none") {
        addWeight(precipIntensityWeights, previousTrend.precipIntensity, 2);
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
    const tempBand = weightedPick(tempBandWeights) ?? "mild";
    const tempMotion = weightedPick(tempMotionWeights) ?? "holding";
    const tempMotionStrength = weightedPick(tempMotionStrengthWeights) ?? "slight";
    const precipType = weightedPick(precipTypeWeights) ?? "none";
    const precipIntensity =
        precipType === "none" ? "none" : (weightedPick(precipIntensityWeights) ?? "light");
    const precipPattern =
        precipType === "none" ? "sporadic" : (weightedPick(precipPatternWeights) ?? "sporadic");
    const windIntensity = weightedPick(windIntensityWeights) ?? "calm";
    const windPattern = windIntensity === "calm" ? "sporadic" : (weightedPick(windPatternWeights) ?? "sporadic");

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