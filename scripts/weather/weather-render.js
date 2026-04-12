export class WeatherRender {
    static buildTemplateData(record, environment) {
        const orderedOutput = this.getOrderedOutput(record);

        return {
            moduleId: "terr-encounters",
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
            hasRuinsApplied: !!record.ruinModifier && !!record.ruinFamily
        };
    }

    static getOrderedOutput(record) {
        const map = {
            ground: record.outputGroundLine || "",
            temperature: record.outputTemperatureLine || "",
            weather: record.outputWeatherLine || ""
        };

        const order = Array.isArray(record.outputOrder) && record.outputOrder.length === 3
            ? record.outputOrder
            : ["ground", "temperature", "weather"];

        return order
            .map(key => ({
                key,
                label: this.labelForKey(key),
                text: map[key] || ""
            }))
            .filter(entry => !!entry.text);
    }

    static labelForKey(key) {
        switch (key) {
            case "ground":
                return "Ground";
            case "temperature":
                return "Temperature";
            case "weather":
                return "Weather";
            default:
                return key;
        }
    }
}
