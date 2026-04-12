import { getWeatherEnvironment } from "./weather-settings.js";
import { WeatherState } from "./weather-state.js";
import { WeatherRolls } from "./weather-rolls.js";
import { WeatherGround } from "./weather-ground.js";
import { WeatherRuins } from "./weather-ruins.js";
import { WeatherCombiner } from "./weather-combiner.js";
import { currentDayLabel, isoNow } from "./weather-utils.js";

function pushHistory(history, next, max = 3) {
    const copy = Array.isArray(history) ? [...history] : [];
    if (next) copy.push(next);
    while (copy.length > max) copy.shift();
    return copy;
}

export class WeatherController {
    static async getCurrentDay() {
        const record = await WeatherState.ensureCurrentDayRecord();
        return record;
    }

    static async rebuildCurrentDay() {
        const current = WeatherState.getCurrentDayRecord();
        const environment = WeatherState.normalizeEnvironment(getWeatherEnvironment());

        const ruins = WeatherRuins.resolve(environment);
        const rebuilt = {
            ...current,
            biome: environment.biome,
            season: environment.season,
            phase: environment.phase,
            ruinModifier: ruins.ruinModifier,
            ruinFamily: ruins.ruinFamily
        };

        const output = WeatherCombiner.build({
            ...rebuilt,
            ruinDetail: ruins.ruinDetail
        });

        const next = {
            ...rebuilt,
            ...output,
            generatedAt: isoNow()
        };

        await WeatherState.setCurrentDayRecord(next);
        return next;
    }

    static async advanceDay() {
        const current = WeatherState.getCurrentDayRecord();
        const environment = WeatherState.normalizeEnvironment(getWeatherEnvironment());

        let nextTemperatureState = current.temperatureState;
        let nextTemperatureDaysRemaining = Math.max(0, (current.temperatureDaysRemaining ?? 0) - 1);

        let nextWeatherEvent = current.weatherEvent;
        let nextWeatherDaysRemaining = Math.max(0, (current.weatherDaysRemaining ?? 0) - 1);

        if (!nextTemperatureState || nextTemperatureDaysRemaining <= 0) {
            const rolled = WeatherRolls.rollTemperature({
                biome: environment.biome,
                season: environment.season,
                phase: environment.phase,
                currentTemperatureState: current.temperatureState
            });

            nextTemperatureState = rolled.temperatureState;
            nextTemperatureDaysRemaining = rolled.temperatureDaysRemaining;
        }

        if (!nextWeatherEvent || nextWeatherDaysRemaining <= 0) {
            const rolled = WeatherRolls.rollWeather({
                biome: environment.biome,
                season: environment.season,
                phase: environment.phase,
                currentWeatherEvent: current.weatherEvent,
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
            lastTemperatureState: current.temperatureState ?? null,
            lastWeatherEvent: current.weatherEvent ?? null,
            temperatureState: nextTemperatureState,
            temperatureDaysRemaining: nextTemperatureDaysRemaining,
            weatherEvent: nextWeatherEvent,
            weatherDaysRemaining: nextWeatherDaysRemaining,
            recentTemperatureStates: pushHistory(current.recentTemperatureStates, nextTemperatureState),
            recentWeatherEvents: pushHistory(current.recentWeatherEvents, nextWeatherEvent)
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
