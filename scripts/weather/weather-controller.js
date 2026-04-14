import { getWeatherEnvironment } from "./weather-settings.js";
import { WeatherState } from "./weather-state.js";
import { WeatherRolls } from "./weather-rolls.js";
import { WeatherGround } from "./weather-ground.js";
import { WeatherRuins } from "./weather-ruins.js";
import { WeatherCombiner } from "./weather-combiner.js";
import { currentDayLabel, isoNow } from "./weather-utils.js";
import { getInitialGroundState } from "../data/weather-biomes.js";

function pushHistory(history, next, max = 3) {
    const copy = Array.isArray(history) ? [...history] : [];
    if (next) copy.push(next);
    while (copy.length > max) copy.shift();
    return copy;
}

function buildEmptyRecord(environment) {
    return WeatherState.normalizeRecord({
        dayLabel: "",
        biome: environment.biome,
        season: environment.season,
        phase: environment.phase,
        groundState: getInitialGroundState(environment.biome, environment.season, environment.phase),
        temperatureState: "",
        temperatureDaysRemaining: 0,
        weatherEvent: "",
        weatherDaysRemaining: 0,
        ruinModifier: null,
        ruinFamily: null,
        outputOrder: ["ground", "temperature", "weather"],
        outputGroundLine: "",
        outputTemperatureLine: "",
        outputWeatherLine: "",
        generatedAt: "",
        recentTemperatureStates: [],
        recentWeatherEvents: [],
        lastTemperatureState: null,
        lastWeatherEvent: null
    });
}

export class WeatherController {
    static async getCurrentDay() {
        return await WeatherState.ensureCurrentDayRecord();
    }

    static isStarted(record) {
        return !!(
            record?.temperatureState ||
            record?.weatherEvent ||
            record?.outputGroundLine ||
            record?.outputTemperatureLine ||
            record?.outputWeatherLine
        );
    }

    static async resetCurrentDay() {
        const environment = WeatherState.normalizeEnvironment(getWeatherEnvironment());
        const emptyRecord = buildEmptyRecord(environment);
        await WeatherState.setCurrentDayRecord(emptyRecord);
        return emptyRecord;
    }

    static async advanceDay() {
        const current = WeatherState.getCurrentDayRecord();
        const environment = WeatherState.normalizeEnvironment(getWeatherEnvironment());
        const hasStarted = this.isStarted(current);

        let nextTemperatureState = current.temperatureState;
        let nextTemperatureDaysRemaining = hasStarted
            ? Math.max(0, (current.temperatureDaysRemaining ?? 0) - 1)
            : 0;

        let nextWeatherEvent = current.weatherEvent;
        let nextWeatherDaysRemaining = hasStarted
            ? Math.max(0, (current.weatherDaysRemaining ?? 0) - 1)
            : 0;

        if (!nextTemperatureState || nextTemperatureDaysRemaining <= 0) {
            const rolled = WeatherRolls.rollTemperature({
                biome: environment.biome,
                season: environment.season,
                phase: environment.phase,
                currentTemperatureState: hasStarted ? current.temperatureState : null
            });

            nextTemperatureState = rolled.temperatureState;
            nextTemperatureDaysRemaining = rolled.temperatureDaysRemaining;
        }

        if (!nextWeatherEvent || nextWeatherDaysRemaining <= 0) {
            const rolled = WeatherRolls.rollWeather({
                biome: environment.biome,
                season: environment.season,
                phase: environment.phase,
                currentWeatherEvent: hasStarted ? current.weatherEvent : null,
                temperatureState: nextTemperatureState
            });

            nextWeatherEvent = rolled.weatherEvent;
            nextWeatherDaysRemaining = rolled.weatherDaysRemaining;
        }

        const intermediate = {
            ...current,
            dayLabel: currentDayLabel(),
            biome: environment.biome,
            season: environment.season,
            phase: environment.phase,
            lastTemperatureState: hasStarted ? (current.temperatureState ?? null) : null,
            lastWeatherEvent: hasStarted ? (current.weatherEvent ?? null) : null,
            temperatureState: nextTemperatureState,
            temperatureDaysRemaining: nextTemperatureDaysRemaining,
            weatherEvent: nextWeatherEvent,
            weatherDaysRemaining: nextWeatherDaysRemaining,
            recentTemperatureStates: hasStarted
                ? pushHistory(current.recentTemperatureStates, nextTemperatureState)
                : [nextTemperatureState],
            recentWeatherEvents: hasStarted
                ? pushHistory(current.recentWeatherEvents, nextWeatherEvent)
                : [nextWeatherEvent]
        };

        const groundState = WeatherGround.updateGroundState(intermediate, environment);
        const ruins = WeatherRuins.resolve(environment);

        const combined = WeatherCombiner.build({
            ...intermediate,
            groundState,
            ruinModifier: ruins.ruinModifier,
            ruinFamily: ruins.ruinFamily,
            ruinDetail: ruins.ruinDetail
        });

        const finalRecord = {
            ...intermediate,
            groundState,
            ruinModifier: ruins.ruinModifier,
            ruinFamily: ruins.ruinFamily,
            ...combined,
            generatedAt: isoNow()
        };

        await WeatherState.setCurrentDayRecord(finalRecord);
        return finalRecord;
    }
}