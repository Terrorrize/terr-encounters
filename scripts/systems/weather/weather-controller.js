/**
 * terr-encounters v0.1.0-b12
 * Function: orchestrates weather state flow. It seeds trends, resolves daily
 * results, advances days, rolls new trends when needed, and exposes a stable
 * API for the rest of the weather system.
 */

import { buildActiveTrend } from "./weather-seed.js";
import { resolveTrendDay } from "./weather-daily.js";
import { updateExposure } from "./weather-exposure.js";
import { updateWordingMatrix } from "./weather-matrix.js";
import {
    createDefaultWeatherState,
    getWeatherState,
    normalizeWeatherState,
    resetWeatherState,
    setWeatherState,
    updateWeatherState
} from "./weather-state.js";
import { getAbsoluteWeatherDay, setAbsoluteWeatherDay } from "./weather-settings.js";
import { renderWeatherViewModel } from "./weather-render.js";

export const WEATHER_CONTROLLER_VERSION = "0.1.0-b12";

function buildResolvedState(state) {
    const normalized = normalizeWeatherState(state);
    const absoluteDay = Number(normalized.currentDay?.absoluteDay ?? getAbsoluteWeatherDay());
    const currentDay = resolveTrendDay(normalized.activeTrend, absoluteDay);
    const wordingMatrix = updateWordingMatrix(normalized.wordingMatrix, currentDay);
    const exposure = updateExposure(normalized.exposure, currentDay, normalized.environment);

    return {
        ...normalized,
        currentDay,
        wordingMatrix,
        exposure
    };
}

function hasRealTrend(state) {
    return Boolean(state?.activeTrend?.id);
}

function hasResolvedCurrentDay(state) {
    return Number.isFinite(state?.currentDay?.tempC) && Number.isFinite(state?.currentDay?.tempF);
}

export async function initializeWeatherState() {
    let state = getWeatherState();

    if (!hasRealTrend(state)) {
        const fresh = createDefaultWeatherState();
        fresh.activeTrend = buildActiveTrend(fresh.environment, null);
        fresh.currentDay.absoluteDay = getAbsoluteWeatherDay();
        state = buildResolvedState(fresh);
        await setWeatherState(state);
        return state;
    }

    if (!hasResolvedCurrentDay(state)) {
        state = buildResolvedState(state);
        await setWeatherState(state);
        return state;
    }

    state = normalizeWeatherState(state);
    await setWeatherState(state);
    return state;
}

export async function refreshWeatherState() {
    const state = normalizeWeatherState(getWeatherState());
    await setWeatherState(state);
    return state;
}

export async function regenerateTrend() {
    return updateWeatherState((state) => {
        const previousTrend = state.activeTrend;
        state.activeTrend = buildActiveTrend(state.environment, previousTrend);
        state.activeTrend.dayIndex = 1;
        state.currentDay.absoluteDay = getAbsoluteWeatherDay();
        return buildResolvedState(state);
    });
}

export async function advanceWeatherDay() {
    const currentAbsoluteDay = getAbsoluteWeatherDay();
    const nextAbsoluteDay = currentAbsoluteDay + 1;

    await setAbsoluteWeatherDay(nextAbsoluteDay);

    return updateWeatherState((state) => {
        const trendDay = Number(state.activeTrend?.dayIndex ?? 1);
        const duration = Number(state.activeTrend?.durationDays ?? 1);

        if (trendDay >= duration) {
            const previousTrend = state.activeTrend;
            state.activeTrend = buildActiveTrend(state.environment, previousTrend);
            state.activeTrend.dayIndex = 1;
        } else {
            state.activeTrend.dayIndex = trendDay + 1;
        }

        state.currentDay.absoluteDay = nextAbsoluteDay;
        return buildResolvedState(state);
    });
}

export async function rerollWeatherFromCurrentDay() {
    return updateWeatherState((state) => {
        const previousTrend = state.activeTrend;
        state.activeTrend = buildActiveTrend(state.environment, previousTrend);
        state.activeTrend.dayIndex = 1;
        state.currentDay.absoluteDay = getAbsoluteWeatherDay();
        return buildResolvedState(state);
    });
}

export async function resetWeatherSystem() {
    await resetWeatherState();
    await setAbsoluteWeatherDay(1);

    return updateWeatherState((state) => {
        state.activeTrend = buildActiveTrend(state.environment, null);
        state.activeTrend.dayIndex = 1;
        state.currentDay.absoluteDay = 1;
        return buildResolvedState(state);
    });
}

export function getRenderedWeatherState() {
    const state = normalizeWeatherState(getWeatherState());
    return {
        state,
        view: renderWeatherViewModel(state)
    };
}

export async function updateWeatherEnvironment(patch = {}) {
    return updateWeatherState((state) => {
        state.environment = {
            ...state.environment,
            ...patch
        };

        state.activeTrend = buildActiveTrend(state.environment, state.activeTrend);
        state.activeTrend.dayIndex = 1;
        state.currentDay.absoluteDay = getAbsoluteWeatherDay();

        return buildResolvedState(state);
    });
}