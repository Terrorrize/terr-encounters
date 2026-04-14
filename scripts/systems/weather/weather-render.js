/**
 * terr-encounters v0.1.0-b5
 * Function: converts raw weather state into a clean UI-ready view model for the
 * weather panel. This keeps rendering strings separate from controller logic.
 */

import { getExposureLine } from "./weather-exposure.js";
import { getMatrixAftermathLines } from "./weather-matrix.js";

export const WEATHER_RENDER_VERSION = "0.1.0-b5";

function buildTrendBlock(currentDay) {
    return Array.isArray(currentDay?.summaryLines) ? [...currentDay.summaryLines] : [];
}

function buildCurrentDayLines(state) {
    const lines = [];
    const currentDay = state?.currentDay ?? {};
    const tempC = currentDay?.tempC;
    const tempF = currentDay?.tempF;

    if (Number.isFinite(tempC) && Number.isFinite(tempF)) {
        lines.push(`${tempC}°C / ${tempF}°F`);
    }

    if (currentDay?.cloudFaceLabel) {
        lines.push(currentDay.cloudFaceLabel);
    }

    if (currentDay?.stormFlags?.thunder) {
        lines.push(currentDay.stormFlags.lightning ? "Thunderstorm risk" : "Thunder risk");
    }

    return lines;
}

function buildAftermathLines(state) {
    return getMatrixAftermathLines(state?.wordingMatrix ?? {}, state?.environment ?? {});
}

function buildMeta(state) {
    return {
        absoluteDay: Number(state?.currentDay?.absoluteDay ?? 1),
        trendDay: Number(state?.currentDay?.trendDay ?? 1),
        trendDuration: Number(state?.activeTrend?.durationDays ?? 1),
        condition: state?.activeTrend?.condition ?? "clear",
        tempBand: state?.activeTrend?.tempBand ?? "mild"
    };
}

export function renderWeatherViewModel(state) {
    const trendLines = buildTrendBlock(state?.currentDay);
    const currentDayLines = buildCurrentDayLines(state);
    const aftermathLines = buildAftermathLines(state);
    const exposureLine = getExposureLine(state?.exposure ?? {});

    return {
        meta: buildMeta(state),
        trendLines,
        currentDayLines,
        aftermathLines,
        exposureLine,
        hasExposure: Boolean(exposureLine),
        hasAftermath: aftermathLines.length > 0,
        hasCurrentDay: currentDayLines.length > 0
    };
}