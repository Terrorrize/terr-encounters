import { MODULE_ID, SETTING_KEYS, getWeatherEnvironment, setWeatherSetting } from "./weather-settings.js";
import { currentDayLabel, deepClone, isoNow } from "./weather-utils.js";
import { biomeSupportsSeason, getAvailableSeasonsForBiome, getInitialGroundState } from "../data/weather-biomes.js";

export const DEFAULT_CURRENT_DAY = {
    dayLabel: "",
    biome: "",
    season: "",
    phase: "",
    groundState: "",
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
    lastTemperatureState: null,
    lastWeatherEvent: null,
    recentTemperatureStates: [],
    recentWeatherEvents: []
};

export class WeatherState {
    static getCurrentDayRecord() {
        const raw = game.settings.get(MODULE_ID, SETTING_KEYS.currentDayRecord) ?? {};
        return this.normalizeRecord(raw);
    }

    static async setCurrentDayRecord(record) {
        const normalized = this.normalizeRecord(record);
        await setWeatherSetting(SETTING_KEYS.currentDayRecord, normalized);
        return normalized;
    }

    static normalizeEnvironment(environment) {
        const env = deepClone(environment);
        if (!biomeSupportsSeason(env.biome, env.season)) {
            const validSeasons = getAvailableSeasonsForBiome(env.biome);
            env.season = validSeasons[0];
        }

        if (!["Early", "Mid", "Late"].includes(env.phase)) {
            env.phase = "Early";
        }

        return env;
    }

    static normalizeRecord(record) {
        const merged = foundry.utils.mergeObject(
            deepClone(DEFAULT_CURRENT_DAY),
            deepClone(record ?? {}),
            { inplace: false, insertKeys: true, overwrite: true }
        );

        const env = this.normalizeEnvironment({
            biome: merged.biome || getWeatherEnvironment().biome,
            season: merged.season || getWeatherEnvironment().season,
            phase: merged.phase || getWeatherEnvironment().phase
        });

        merged.biome = env.biome;
        merged.season = env.season;
        merged.phase = env.phase;

        if (!merged.dayLabel) merged.dayLabel = currentDayLabel();
        if (!merged.generatedAt) merged.generatedAt = isoNow();
        if (!merged.groundState) merged.groundState = getInitialGroundState(env.biome, env.season, env.phase);
        if (!Array.isArray(merged.outputOrder) || merged.outputOrder.length !== 3) {
            merged.outputOrder = ["ground", "temperature", "weather"];
        }
        if (!Array.isArray(merged.recentTemperatureStates)) merged.recentTemperatureStates = [];
        if (!Array.isArray(merged.recentWeatherEvents)) merged.recentWeatherEvents = [];

        return merged;
    }

    static async ensureCurrentDayRecord() {
        const current = this.getCurrentDayRecord();
        const isEmpty =
            !current.temperatureState &&
            !current.weatherEvent &&
            !current.outputGroundLine &&
            !current.outputTemperatureLine &&
            !current.outputWeatherLine;

        if (!isEmpty) return current;

        const env = this.normalizeEnvironment(getWeatherEnvironment());

        const initial = this.normalizeRecord({
            biome: env.biome,
            season: env.season,
            phase: env.phase,
            groundState: getInitialGroundState(env.biome, env.season, env.phase)
        });

        await this.setCurrentDayRecord(initial);
        return initial;
    }
}
