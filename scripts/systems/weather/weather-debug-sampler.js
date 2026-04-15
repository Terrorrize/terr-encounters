/**
 * terr-encounters v0.1.0-b3
 * Function: standalone weather sampler/exporter for debugging. This file is not
 * wired into the live module. Import it manually from console to generate large
 * grouped sample sets by biome/climate/season/phase and save them using
 * Foundry's saveDataToFile utility.
 */

import { getAvailableBiomes, getAvailableClimates } from "../../data/weather/weather-baselines.js";
import { buildActiveTrend } from "./weather-seed.js";
import { resolveTrendDay } from "./weather-daily.js";
import { updateWordingMatrix } from "./weather-matrix.js";

function clone(value) {
    if (typeof structuredClone === "function") {
        return structuredClone(value);
    }

    return JSON.parse(JSON.stringify(value));
}

function normalizeEnvironment(environment = {}) {
    return {
        biome: environment.biome ?? "forest",
        climate: environment.climate ?? "temperate",
        season: environment.season ?? "spring",
        phase: environment.phase ?? "mid",
        ruinsEnabled: Boolean(environment.ruinsEnabled)
    };
}

function createEmptyMatrix() {
    return {
        wetness: 0,
        mud: 0,
        standingWater: 0,
        snowCover: 0,
        dryness: 0
    };
}

function buildTimestamp() {
    const now = new Date();
    const yyyy = String(now.getFullYear());
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const mi = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    return `${yyyy}${mm}${dd}-${hh}${mi}${ss}`;
}

function saveTextFile(text, filename) {
    foundry.utils.saveDataToFile(text, "text/plain;charset=utf-8", filename);
    return filename;
}

function saveJsonFile(data, filename) {
    foundry.utils.saveDataToFile(JSON.stringify(data, null, 2), "application/json;charset=utf-8", filename);
    return filename;
}

function sampleOne(environment, absoluteDay = 1, previousTrend = null, priorMatrix = null) {
    const trend = buildActiveTrend(environment, previousTrend);
    const currentDay = resolveTrendDay(trend, absoluteDay);
    const wordingMatrix = updateWordingMatrix(
        priorMatrix ?? createEmptyMatrix(),
        currentDay,
        environment
    );

    return {
        environment: clone(environment),
        trend: clone(trend),
        currentDay: clone(currentDay),
        wordingMatrix: clone(wordingMatrix)
    };
}

export function sampleWeatherBatch(count = 25, environment = {}) {
    const env = normalizeEnvironment(environment);
    const rows = [];

    let absoluteDay = 1;
    let previousTrend = null;
    let matrix = createEmptyMatrix();

    for (let i = 0; i < count; i += 1) {
        const entry = sampleOne(env, absoluteDay, previousTrend, matrix);
        rows.push(entry);
        absoluteDay += 1;
        previousTrend = entry.trend;
        matrix = entry.wordingMatrix;
    }

    return rows;
}

function formatEntryText(entry, index) {
    const trend = entry.trend;
    const day = entry.currentDay;
    const matrix = entry.wordingMatrix;

    return [
        `#${index + 1}`,
        `ENV ${entry.environment.biome} / ${entry.environment.climate} / ${entry.environment.season} / ${entry.environment.phase}`,
        `TREND ${trend.durationDays}d | condition=${trend.condition} | tempBand=${trend.tempBand} | precip=${trend.precipType}/${trend.precipIntensity}/${trend.precipPattern} | wind=${trend.windIntensity}/${trend.windPattern}`,
        `DAY abs=${day.absoluteDay} trendDay=${day.trendDay} | temp=${day.tempC}C/${day.tempF}F | cloud=${day.cloudFace} | precipActive=${day.precipActive} | precip=${day.precipType}/${day.precipIntensity} | wind=${day.windIntensity} | thunder=${day.stormFlags?.thunder ? "y" : "n"} | lightning=${day.stormFlags?.lightning ? "y" : "n"}`,
        `MATRIX wet=${matrix.wetness} mud=${matrix.mud} water=${matrix.standingWater} snow=${matrix.snowCover} dry=${matrix.dryness}`
    ].join("\n");
}

export function sampleWeatherText(count = 25, environment = {}) {
    const rows = sampleWeatherBatch(count, environment);
    return rows.map((entry, index) => formatEntryText(entry, index)).join("\n\n");
}

function normalizeList(value, fallback) {
    if (Array.isArray(value) && value.length > 0) {
        return [...value];
    }

    return [...fallback];
}

export function sampleAllBiomeClimateBatches(options = {}) {
    const biomes = normalizeList(options.biomes, getAvailableBiomes());
    const seasons = normalizeList(options.seasons, ["spring"]);
    const phases = normalizeList(options.phases, ["mid"]);
    const countPerSet = Math.max(1, Number(options.countPerSet ?? 25) || 25);
    const ruinsEnabled = Boolean(options.ruinsEnabled);

    const report = [];

    for (const biome of biomes) {
        const climates = normalizeList(options.climates, getAvailableClimates(biome));

        for (const climate of climates) {
            for (const season of seasons) {
                for (const phase of phases) {
                    const environment = normalizeEnvironment({
                        biome,
                        climate,
                        season,
                        phase,
                        ruinsEnabled
                    });

                    const rows = sampleWeatherBatch(countPerSet, environment);

                    report.push({
                        environment,
                        count: countPerSet,
                        rows
                    });
                }
            }
        }
    }

    return report;
}

export function sampleAllBiomeClimateText(options = {}) {
    const groups = sampleAllBiomeClimateBatches(options);

    return groups.map((group) => {
        const header = [
            "============================================================",
            `ENVIRONMENT ${group.environment.biome} / ${group.environment.climate} / ${group.environment.season} / ${group.environment.phase}`,
            `COUNT ${group.count}`,
            "============================================================"
        ].join("\n");

        const body = group.rows.map((entry, index) => formatEntryText(entry, index)).join("\n\n");
        return `${header}\n${body}`;
    }).join("\n\n\n");
}

export function exportAllBiomeClimateText(options = {}) {
    const text = sampleAllBiomeClimateText(options);
    const filename = options.filename || `weather-samples-${buildTimestamp()}.txt`;
    return saveTextFile(text, filename);
}

export function exportAllBiomeClimateJson(options = {}) {
    const data = sampleAllBiomeClimateBatches(options);
    const filename = options.filename || `weather-samples-${buildTimestamp()}.json`;
    return saveJsonFile(data, filename);
}

export async function sampleCurrentEnvironmentText(count = 25) {
    const environment =
        globalThis.TerrEncounters?.api?.weather?.getState?.().state?.environment ??
        {
            biome: "forest",
            climate: "temperate",
            season: "spring",
            phase: "mid",
            ruinsEnabled: false
        };

    return sampleWeatherText(count, environment);
}

export async function exportCurrentEnvironmentText(count = 100) {
    const environment =
        globalThis.TerrEncounters?.api?.weather?.getState?.().state?.environment ??
        {
            biome: "forest",
            climate: "temperate",
            season: "spring",
            phase: "mid",
            ruinsEnabled: false
        };

    const text = sampleWeatherText(count, environment);
    const filename = `weather-current-env-${buildTimestamp()}.txt`;
    return saveTextFile(text, filename);
}

export async function exportCurrentEnvironmentJson(count = 100) {
    const environment =
        globalThis.TerrEncounters?.api?.weather?.getState?.().state?.environment ??
        {
            biome: "forest",
            climate: "temperate",
            season: "spring",
            phase: "mid",
            ruinsEnabled: false
        };

    const data = sampleWeatherBatch(count, environment);
    const filename = `weather-current-env-${buildTimestamp()}.json`;
    return saveJsonFile(data, filename);
}