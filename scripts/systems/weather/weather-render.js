/**
 * terr-encounters v0.1.0-b8
 * Function: converts raw weather state into a clean UI-ready view model for the
 * weather panel. Trend stays trend-level. Current Day reports the resolved
 * daily specifics: temperature, sky, precipitation, wind, and storm risk.
 */

import { getExposureLine } from "./weather-exposure.js";
import { getMatrixAftermathLines } from "./weather-matrix.js";

export const WEATHER_RENDER_VERSION = "0.1.0-b8";

function buildTrendBlock(currentDay) {
    return Array.isArray(currentDay?.summaryLines) ? [...currentDay.summaryLines] : [];
}

function getDailySkyLine(currentDay) {
    if (currentDay?.cloudFaceLabel) return currentDay.cloudFaceLabel;
    return "";
}

function getDailyPrecipLine(currentDay) {
    if (currentDay?.precipActive && currentDay?.precipType !== "none") {
        const intensityLabels = {
            light: "Light",
            moderate: "Moderate",
            hard: "Hard",
            severe: "Severe"
        };

        const typeLabels = {
            rain: "rain",
            snow: "snow",
            sleet: "sleet"
        };

        const intensity = intensityLabels[currentDay.precipIntensity] ?? "Moderate";
        const type = typeLabels[currentDay.precipType] ?? "rain";
        return `${intensity} ${type} today`;
    }

    if (currentDay?.cloudFace === "low" || currentDay?.cloudFace === "fog") {
        return "Mist / fog today";
    }

    return "No precipitation today";
}

function getDailyWindLine(currentDay) {
    const windLabels = {
        calm: "Calm air",
        light: "Light winds",
        moderate: "Moderate winds",
        strong: "Strong winds",
        severe: "Severe winds"
    };

    return windLabels[currentDay?.windIntensity] ?? "Calm air";
}

function getDailyStormLine(currentDay) {
    if (currentDay?.stormFlags?.lightning) return "Thunderstorm risk";
    if (currentDay?.stormFlags?.thunder) return "Thunder risk";
    return "";
}

function buildCurrentDayLines(state) {
    const lines = [];
    const currentDay = state?.currentDay ?? {};
    const tempC = currentDay?.tempC;
    const tempF = currentDay?.tempF;

    if (Number.isFinite(tempC) && Number.isFinite(tempF)) {
        lines.push(`${tempC}°C / ${tempF}°F`);
    }

    const skyLine = getDailySkyLine(currentDay);
    if (skyLine) lines.push(skyLine);

    const precipLine = getDailyPrecipLine(currentDay);
    if (precipLine) lines.push(precipLine);

    const windLine = getDailyWindLine(currentDay);
    if (windLine) lines.push(windLine);

    const stormLine = getDailyStormLine(currentDay);
    if (stormLine) lines.push(stormLine);

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