import { BIOME_DEFAULT_RUIN_FAMILIES } from "../data/weather-ruins-data.js";
import { getAvailableSeasonsForBiome, WEATHER_BIOMES } from "../data/weather-biomes.js";

const OUTPUT_LABELS = {
    ground: "Ground",
    temperature: "Temperature",
    weather: "Weather"
};

function isStarted(record) {
    return !!(
        record?.temperatureState ||
        record?.weatherEvent ||
        record?.outputGroundLine ||
        record?.outputTemperatureLine ||
        record?.outputWeatherLine
    );
}

export class WeatherRender {
    static buildTemplateData(record, environment) {
        const started = isStarted(record);
        const orderedOutput = this.getOrderedOutput(record);
        const biomeChoices = Object.keys(WEATHER_BIOMES).map(value => ({ value, label: value }));
        const seasonChoices = getAvailableSeasonsForBiome(environment.biome).map(value => ({ value, label: value }));
        const phaseChoices = ["Early", "Mid", "Late"].map(value => ({ value, label: value }));
        const manualRuinFamilyChoices = (BIOME_DEFAULT_RUIN_FAMILIES[environment.biome] ?? []).map(value => ({ value, label: value }));

        return {
            moduleId: "terr-encounters",
            hasStarted: started,
            mainButtonLabel: started ? "Next Day" : "How's My Day Going?",
            dayLabel: record.dayLabel || "",
            biome: record.biome || environment.biome || "",
            season: record.season || environment.season || "",
            phase: record.phase || environment.phase || "",
            groundState: record.groundState || "",
            temperatureState: record.temperatureState || "",
            temperatureDaysRemaining: Number.isFinite(record.temperatureDaysRemaining) ? record.temperatureDaysRemaining : 0,
            weatherEvent: record.weatherEvent || "",
            weatherDaysRemaining: Number.isFinite(record.weatherDaysRemaining) ? record.weatherDaysRemaining : 0,
            ruinModifier: record.ruinModifier || "",
            ruinFamily: record.ruinFamily || "",
            outputGroundLine: record.outputGroundLine || "",
            outputTemperatureLine: record.outputTemperatureLine || "",
            outputWeatherLine: record.outputWeatherLine || "",
            orderedOutput,
            controls: {
                biome: environment.biome,
                season: environment.season,
                phase: environment.phase,
                addRuins: !!environment.addRuins,
                ruinFrequency: environment.ruinFrequency,
                ruinStyleMode: environment.ruinStyleMode,
                manualRuinFamily: environment.manualRuinFamily
            },
            showRuins: !!environment.addRuins,
            showManualRuinFamily: !!environment.addRuins && environment.ruinStyleMode === "manual",
            hasRuinsApplied: !!record.ruinModifier && !!record.ruinFamily,
            biomeChoices,
            seasonChoices,
            phaseChoices,
            ruinFrequencyChoices: [
                { value: "faint", label: "Faint" },
                { value: "light", label: "Light" },
                { value: "mixed", label: "Mixed" }
            ],
            ruinStyleModeChoices: [
                { value: "auto", label: "Auto by Biome" },
                { value: "manual", label: "Manual" }
            ],
            manualRuinFamilyChoices
        };
    }

    static getOrderedOutput(record) {
        const lines = {
            ground: record.outputGroundLine || "",
            temperature: record.outputTemperatureLine || "",
            weather: record.outputWeatherLine || ""
        };

        const order = Array.isArray(record.outputOrder) && record.outputOrder.length === 3
            ? record.outputOrder
            : ["ground", "temperature", "weather"];

        return order
            .filter(key => ["ground", "temperature", "weather"].includes(key))
            .map(key => ({
                key,
                label: OUTPUT_LABELS[key] || key,
                text: String(lines[key] || "").trim()
            }))
            .filter(entry => entry.text.length > 0);
    }
}