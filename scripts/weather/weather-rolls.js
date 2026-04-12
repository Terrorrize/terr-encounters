import { getPhaseData, getLockRange } from "../data/weather-biomes.js";
import { WEATHER_COMPATIBILITY } from "../data/weather-compatibility.js";
import { buildWeightedArrayFromMap, normalizeWeights, randomInt, upsertWeight, weightedPick } from "./weather-utils.js";

function applyTransitionBias(weightMap, currentState) {
    if (!currentState || !weightMap.has(currentState)) return;
    upsertWeight(weightMap, currentState, 2);
}

function applyCompatibility(weightMap, temperatureState) {
    if (!temperatureState) return;

    const rules = WEATHER_COMPATIBILITY[temperatureState];
    if (!rules) return;

    for (const state of rules.favor ?? []) {
        if (weightMap.has(state)) upsertWeight(weightMap, state, 2);
    }

    for (const state of rules.suppress ?? []) {
        if (weightMap.has(state)) {
            const current = weightMap.get(state) ?? 0;
            weightMap.set(state, Math.max(0, current - 2));
        }
    }
}

function asWeightMap(entries) {
    const map = new Map();
    for (const entry of normalizeWeights(entries)) {
        map.set(entry.value, (map.get(entry.value) ?? 0) + entry.weight);
    }
    return map;
}

export class WeatherRolls {
    static rollTemperature({ biome, season, phase, currentTemperatureState }) {
        const phaseData = getPhaseData(biome, season, phase);
        if (!phaseData) throw new Error(`No temperature pool for ${biome} / ${season} / ${phase}`);

        const weights = asWeightMap(phaseData.temperatureStates);
        applyTransitionBias(weights, currentTemperatureState);

        const temperatureState = weightedPick(buildWeightedArrayFromMap(weights)) ?? phaseData.temperatureStates[0]?.value;
        const [minDays, maxDays] = getLockRange(biome, "temperature", temperatureState);
        const temperatureDaysRemaining = randomInt(minDays, maxDays);

        return { temperatureState, temperatureDaysRemaining };
    }

    static rollWeather({ biome, season, phase, currentWeatherEvent, temperatureState }) {
        const phaseData = getPhaseData(biome, season, phase);
        if (!phaseData) throw new Error(`No weather pool for ${biome} / ${season} / ${phase}`);

        const weights = asWeightMap(phaseData.weatherEvents);
        applyTransitionBias(weights, currentWeatherEvent);
        applyCompatibility(weights, temperatureState);

        const weatherEvent = weightedPick(buildWeightedArrayFromMap(weights)) ?? phaseData.weatherEvents[0]?.value;
        const [minDays, maxDays] = getLockRange(biome, "weather", weatherEvent);
        const weatherDaysRemaining = randomInt(minDays, maxDays);

        return { weatherEvent, weatherDaysRemaining };
    }
}
