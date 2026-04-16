/**
 * terr-encounters v0.1.0-b12
 * Function: owns the persistent weather state document stored in world settings.
 * This includes environment context, active trend, current day, wording matrix,
 * optional exposure data, and whether season/phase are following the calendar.
 */

import { createWeatherId, deepClone } from "./weather-utils.js";
import { getAbsoluteWeatherDay, getWeatherDefaults, isExposureEnabled } from "./weather-settings.js";

const MODULE_ID = "terr-encounters";
const WEATHER_STATE_KEY = "weatherState";

function buildDefaultEnvironment() {
    const defaults = getWeatherDefaults();

    return {
        biome: defaults.biome,
        climate: defaults.climate,
        season: defaults.season,
        phase: defaults.phase,
        ruinsEnabled: Boolean(defaults.ruinsEnabled),
        followCalendar: true
    };
}

function buildDefaultWordingMatrix() {
    return {
        wetness: 0,
        mud: 0,
        standingWater: 0,
        snowCover: 0,
        dryness: 0
    };
}

function buildDefaultExposure() {
    return {
        enabled: isExposureEnabled(),
        total: 0,
        band: "none"
    };
}

function buildDefaultCurrentDay() {
    return {
        absoluteDay: getAbsoluteWeatherDay(),
        trendDay: 1,
        tempC: null,
        tempF: null,
        precipActive: false,
        precipType: "none",
        precipIntensity: "none",
        windActive: false,
        windIntensity: "calm",
        cloudFace: "neutral",
        stormFlags: {
            thunder: false,
            lightning: false
        },
        summaryLines: []
    };
}

function buildDefaultActiveTrend() {
    return {
        id: createWeatherId("trend"),
        durationDays: 1,
        dayIndex: 1,
        condition: "clear",
        tempBand: "mild",
        seedTempC: 10,
        tempMinC: 7,
        tempMaxC: 13,
        tempMotion: "holding",
        tempMotionStrength: "slight",
        precipType: "none",
        precipIntensity: "none",
        precipPattern: "sporadic",
        windIntensity: "calm",
        windPattern: "sporadic"
    };
}

export function createDefaultWeatherState() {
    return {
        version: "0.1.0-b12",
        environment: buildDefaultEnvironment(),
        activeTrend: buildDefaultActiveTrend(),
        currentDay: buildDefaultCurrentDay(),
        wordingMatrix: buildDefaultWordingMatrix(),
        exposure: buildDefaultExposure()
    };
}

export function normalizeWeatherState(state) {
    const base = createDefaultWeatherState();
    const source = state && typeof state === "object" ? state : {};

    return {
        ...base,
        ...source,
        environment: {
            ...base.environment,
            ...(source.environment ?? {})
        },
        activeTrend: {
            ...base.activeTrend,
            ...(source.activeTrend ?? {})
        },
        currentDay: {
            ...base.currentDay,
            ...(source.currentDay ?? {}),
            stormFlags: {
                ...base.currentDay.stormFlags,
                ...(source.currentDay?.stormFlags ?? {})
            },
            summaryLines: Array.isArray(source.currentDay?.summaryLines)
                ? [...source.currentDay.summaryLines]
                : [...base.currentDay.summaryLines]
        },
        wordingMatrix: {
            ...base.wordingMatrix,
            ...(source.wordingMatrix ?? {})
        },
        exposure: {
            ...base.exposure,
            ...(source.exposure ?? {})
        }
    };
}

export async function registerWeatherState() {
    game.settings.register(MODULE_ID, WEATHER_STATE_KEY, {
        name: "Weather State",
        hint: "Persistent Terr Encounters weather state blob.",
        scope: "world",
        config: false,
        type: Object,
        default: createDefaultWeatherState()
    });
}

export function getWeatherState() {
    const stored = game.settings.get(MODULE_ID, WEATHER_STATE_KEY);
    return normalizeWeatherState(stored);
}

export async function setWeatherState(nextState) {
    const normalized = normalizeWeatherState(nextState);
    return game.settings.set(MODULE_ID, WEATHER_STATE_KEY, normalized);
}

export async function updateWeatherState(mutator) {
    const current = getWeatherState();
    const working = deepClone(current);

    const result = typeof mutator === "function" ? mutator(working) : working;
    const nextState = result && typeof result === "object" ? result : working;

    return setWeatherState(nextState);
}

export async function resetWeatherState() {
    return setWeatherState(createDefaultWeatherState());
}