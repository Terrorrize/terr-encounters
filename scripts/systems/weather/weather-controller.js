/**
 * terr-encounters v0.1.0-b15
 * Function: orchestrates weather state flow. It seeds trends, resolves daily
 * results, advances days, rolls new trends when needed, and now applies a
 * light calendar-driven season/phase model using 30-day months and 3-month
 * seasons unless the GM manually overrides season/phase.
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

export const WEATHER_CONTROLLER_VERSION = "0.1.0-b15";

const DAYS_PER_MONTH = 30;
const MONTHS_PER_SEASON = 3;
const DAYS_PER_SEASON = DAYS_PER_MONTH * MONTHS_PER_SEASON;
const SEASON_ORDER = ["spring", "summer", "autumn", "winter"];
const PHASE_ORDER = ["early", "mid", "late"];

function getCalendarSeasonPhase(absoluteDay) {
    const safeDay = Math.max(1, Number(absoluteDay) || 1);
    const zeroBasedDay = safeDay - 1;
    const monthIndex = Math.floor(zeroBasedDay / DAYS_PER_MONTH);
    const seasonIndex = Math.floor(monthIndex / MONTHS_PER_SEASON) % SEASON_ORDER.length;
    const phaseIndex = monthIndex % MONTHS_PER_SEASON;

    return {
        season: SEASON_ORDER[seasonIndex],
        phase: PHASE_ORDER[phaseIndex],
        monthNumber: monthIndex + 1,
        dayOfMonth: (zeroBasedDay % DAYS_PER_MONTH) + 1,
        dayOfSeason: (zeroBasedDay % DAYS_PER_SEASON) + 1
    };
}

function syncEnvironmentToCalendar(state, absoluteDay) {
    const normalized = normalizeWeatherState(state);
    const followCalendar = normalized.environment?.followCalendar !== false;

    if (!followCalendar) {
        normalized.environment.followCalendar = false;
        return normalized;
    }

    const calendar = getCalendarSeasonPhase(absoluteDay);

    normalized.environment = {
        ...normalized.environment,
        season: calendar.season,
        phase: calendar.phase,
        followCalendar: true
    };

    return normalized;
}

function buildResolvedState(state) {
    const absoluteDay = Number(state?.currentDay?.absoluteDay ?? getAbsoluteWeatherDay());
    const calendarSynced = syncEnvironmentToCalendar(state, absoluteDay);
    const normalized = normalizeWeatherState(calendarSynced);
    const currentDay = resolveTrendDay(normalized.activeTrend, absoluteDay);
    const wordingMatrix = updateWordingMatrix(normalized.wordingMatrix, currentDay, normalized.environment);
    const exposure = updateExposure(normalized.exposure, currentDay, normalized.environment);
    const calendar = getCalendarSeasonPhase(absoluteDay);

    return {
        ...normalized,
        currentDay,
        wordingMatrix,
        exposure,
        calendar
    };
}

function hasRealTrend(state) {
    return Boolean(state?.activeTrend?.id);
}

function hasResolvedCurrentDay(state) {
    return Number.isFinite(state?.currentDay?.tempC) && Number.isFinite(state?.currentDay?.tempF);
}

function forceOpeningAdventureSeed(state) {
    state.environment = {
        ...state.environment,
        season: "spring",
        phase: "late",
        followCalendar: true
    };

    state.activeTrend = {
        id: `trend-opening-${Date.now()}`,
        durationDays: 3,
        dayIndex: 1,
        condition: "clear",
        tempBand: "warm",
        seedTempC: 18,
        tempMinC: 15,
        tempMaxC: 21,
        tempMotion: "holding",
        tempMotionStrength: "slight",
        precipType: "none",
        precipIntensity: "none",
        precipPattern: "sporadic",
        windIntensity: "calm",
        windPattern: "sporadic"
    };

    state.currentDay.absoluteDay = 1;
    state.wordingMatrix = {
        wetness: 0,
        mud: 0,
        standingWater: 0,
        snowCover: 0,
        dryness: 0
    };

    return state;
}

export async function initializeWeatherState() {
    let state = getWeatherState();

    if (!hasRealTrend(state)) {
        const fresh = createDefaultWeatherState();
        forceOpeningAdventureSeed(fresh);
        state = buildResolvedState(fresh);
        await setWeatherState(state);
        return state;
    }

    if (!hasResolvedCurrentDay(state)) {
        state = buildResolvedState(state);
        await setWeatherState(state);
        return state;
    }

    state = buildResolvedState(state);
    await setWeatherState(state);
    return state;
}

export async function refreshWeatherState() {
    const state = buildResolvedState(getWeatherState());
    await setWeatherState(state);
    return state;
}

export async function regenerateTrend() {
    return updateWeatherState((state) => {
        const absoluteDay = getAbsoluteWeatherDay();
        const synced = syncEnvironmentToCalendar(state, absoluteDay);
        const previousTrend = synced.activeTrend;

        synced.activeTrend = buildActiveTrend(synced.environment, previousTrend);
        synced.activeTrend.dayIndex = 1;
        synced.currentDay.absoluteDay = absoluteDay;

        return buildResolvedState(synced);
    });
}

export async function advanceWeatherDay() {
    const currentAbsoluteDay = getAbsoluteWeatherDay();
    const nextAbsoluteDay = currentAbsoluteDay + 1;

    await setAbsoluteWeatherDay(nextAbsoluteDay);

    return updateWeatherState((state) => {
        const synced = syncEnvironmentToCalendar(state, nextAbsoluteDay);
        const trendDay = Number(synced.activeTrend?.dayIndex ?? 1);
        const duration = Number(synced.activeTrend?.durationDays ?? 1);

        if (trendDay >= duration) {
            const previousTrend = synced.activeTrend;
            synced.activeTrend = buildActiveTrend(synced.environment, previousTrend);
            synced.activeTrend.dayIndex = 1;
        } else {
            synced.activeTrend.dayIndex = trendDay + 1;
        }

        synced.currentDay.absoluteDay = nextAbsoluteDay;
        return buildResolvedState(synced);
    });
}

export async function rerollWeatherFromCurrentDay() {
    return updateWeatherState((state) => {
        const absoluteDay = getAbsoluteWeatherDay();
        const synced = syncEnvironmentToCalendar(state, absoluteDay);
        const previousTrend = synced.activeTrend;

        synced.activeTrend = buildActiveTrend(synced.environment, previousTrend);
        synced.activeTrend.dayIndex = 1;
        synced.currentDay.absoluteDay = absoluteDay;

        return buildResolvedState(synced);
    });
}

export async function resetWeatherSystem() {
    await resetWeatherState();
    await setAbsoluteWeatherDay(1);

    return updateWeatherState((state) => {
        forceOpeningAdventureSeed(state);
        return buildResolvedState(state);
    });
}

export function getRenderedWeatherState() {
    const state = buildResolvedState(getWeatherState());
    return {
        state,
        view: renderWeatherViewModel(state)
    };
}

export async function updateWeatherEnvironment(patch = {}) {
    return updateWeatherState((state) => {
        const currentAbsoluteDay = getAbsoluteWeatherDay();
        const synced = syncEnvironmentToCalendar(state, currentAbsoluteDay);

        const nextEnvironment = {
            ...synced.environment,
            ...patch
        };

        const manuallyChangedSeasonOrPhase =
            Object.prototype.hasOwnProperty.call(patch, "season") ||
            Object.prototype.hasOwnProperty.call(patch, "phase");

        if (manuallyChangedSeasonOrPhase) {
            nextEnvironment.followCalendar = false;
        } else if (Object.prototype.hasOwnProperty.call(patch, "followCalendar")) {
            nextEnvironment.followCalendar = Boolean(patch.followCalendar);
        }

        synced.environment = nextEnvironment;

        if (synced.environment.followCalendar !== false) {
            synced.environment = syncEnvironmentToCalendar(synced, currentAbsoluteDay).environment;
        }

        synced.activeTrend = buildActiveTrend(synced.environment, synced.activeTrend);
        synced.activeTrend.dayIndex = 1;
        synced.currentDay.absoluteDay = currentAbsoluteDay;

        return buildResolvedState(synced);
    });
}