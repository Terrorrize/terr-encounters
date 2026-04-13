import { BIOME_DEFAULT_RUIN_FAMILIES } from "../data/weather-ruins-data.js";
import { getAvailableSeasonsForBiome, WEATHER_BIOMES } from "../data/weather-biomes.js";

function titleCase(value) {
    return String(value ?? "")
        .replaceAll("/", " / ")
        .replaceAll("-", " ")
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .map(part => part ? part.charAt(0).toUpperCase() + part.slice(1) : "")
        .join(" ");
}

function weatherLabel(eventName) {
    const map = {
        "clear/fair": "Clear / Fair",
        "cloud cover": "High Thin Clouds",
        "mist/fog": "Mist / Fog",
        "freezing fog": "Freezing Fog",
        "sea mist": "Sea Mist",
        "thaw mist": "Thaw Mist",
        "light snow": "Light Snow",
        "steady snow": "Steady Snow",
        "hard wind": "Strong Wind",
        "dry wind": "Dry Wind",
        "sea breeze": "Sea Breeze",
        "brief hard rain": "Hard Rain",
        "storm squall": "Storm Squall",
        "cold squall": "Cold Squall",
        "humid haze": "Humid Haze",
        "heat haze": "Heat Haze",
        "hot still air": "Still Heat",
        "warm still air": "Still Warmth",
        "stagnant still air": "Stagnant Air",
        "furnace still air": "Furnace Heat",
        "blowing dust": "Blowing Dust",
        "dust wall": "Dust Wall",
        "sand-lifting gusts": "Sand Gusts",
        "ice-crystal drift": "Ice Crystal Drift"
    };

    return map[eventName] ?? titleCase(eventName);
}

function temperatureTypeLabel(stateName) {
    const map = {
        "Mild": "Mild",
        "Warm": "Warm",
        "Hot": "Heat",
        "Heat Wave": "Extreme Heat",
        "Humid Heat": "Wet Heat",
        "Dry Heat": "Dry Heat",
        "Harsh Dry Heat": "Dry Heat",
        "Chill": "Chill",
        "Cold": "Cold",
        "Cold Snap": "Snap Cold",
        "Hard Cold": "Dry Cold",
        "Deep Cold": "Dry Cold",
        "Bitter Freeze": "Dry Cold",
        "Severe Cold": "Dry Cold",
        "Thaw / Mild Thaw / Warm Break": "Thaw",
        "Cool Break": "Cool Break"
    };

    return map[stateName] ?? titleCase(stateName);
}

function baseTemperatureForState(stateName) {
    const map = {
        "Mild": 12,
        "Warm": 22,
        "Hot": 30,
        "Heat Wave": 38,
        "Humid Heat": 31,
        "Dry Heat": 34,
        "Harsh Dry Heat": 40,
        "Chill": 7,
        "Cold": 0,
        "Cold Snap": -10,
        "Hard Cold": -18,
        "Deep Cold": -28,
        "Bitter Freeze": -36,
        "Severe Cold": -42,
        "Thaw / Mild Thaw / Warm Break": 4,
        "Cool Break": 15
    };

    return map[stateName] ?? 10;
}

function seasonOffsetForEnvironment(environment) {
    const season = String(environment.season ?? "");
    const phase = String(environment.phase ?? "");
    const biome = String(environment.biome ?? "");

    const phaseOffset = phase === "Early" ? -2 : phase === "Late" ? 2 : 0;

    if (biome === "Desert") {
        const desertSeason = season === "Hot Season" ? 12 : 0;
        return desertSeason + phaseOffset;
    }

    if (biome === "Tropical Coast" || biome === "Tropical Swamp") {
        const tropicalSeason = season === "Dry Season" ? 10 : 8;
        return tropicalSeason + phaseOffset;
    }

    const temperateMap = {
        "Spring": 2,
        "Summer": 10,
        "Autumn": 0,
        "Winter": -10
    };

    return (temperateMap[season] ?? 0) + phaseOffset;
}

function biomeOffset(environment) {
    const biome = String(environment.biome ?? "");

    const map = {
        "Forest": 0,
        "Plains": 1,
        "Hills": -2,
        "Mountains": -10,
        "Desert": 8,
        "Tundra": -10,
        "Urban Fringe": 1,
        "Temperate Coast": 2,
        "Tropical Coast": 8,
        "Temperate Swamp": 3,
        "Tropical Swamp": 9
    };

    return map[biome] ?? 0;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function formatTemperature(stateName, environment) {
    const c = clamp(
        Math.round(baseTemperatureForState(stateName) + seasonOffsetForEnvironment(environment) + biomeOffset(environment)),
        -50,
        50
    );

    const f = Math.round((c * 9 / 5) + 32);
    return `${c}C / ${f}F`;
}

function buildGroundBits(record) {
    const bits = [];

    if (record.groundState) {
        bits.push(titleCase(record.groundState));
    }

    if (record.ruinModifier && record.ruinModifier !== "none") {
        bits.push(titleCase(record.ruinModifier));
    }

    if (record.ruinFamily) {
        bits.push(titleCase(record.ruinFamily));
    }

    return bits;
}

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
        const biomeChoices = Object.keys(WEATHER_BIOMES).map(value => ({ value, label: value }));
        const seasonChoices = getAvailableSeasonsForBiome(environment.biome).map(value => ({ value, label: value }));
        const phaseChoices = ["Early", "Mid", "Late"].map(value => ({ value, label: value }));
        const manualRuinFamilyChoices = (BIOME_DEFAULT_RUIN_FAMILIES[environment.biome] ?? []).map(value => ({ value, label: value }));

        const groundBits = started ? buildGroundBits(record) : [];
        const totalLock = (Number(record.temperatureDaysRemaining) || 0) + (Number(record.weatherDaysRemaining) || 0);
        const currentLock = Math.max(Number(record.temperatureDaysRemaining) || 0, Number(record.weatherDaysRemaining) || 0);

        return {
            moduleId: "terr-encounters",
            hasStarted: started,
            mainButtonLabel: started ? "Next Day" : "How's My Day Going?",
            controls: {
                biome: environment.biome,
                season: environment.season,
                phase: environment.phase,
                addRuins: !!environment.addRuins,
                ruinFrequency: environment.ruinFrequency,
                ruinStyleMode: environment.ruinStyleMode,
                manualRuinFamily: environment.manualRuinFamily
            },
            displayDayCounter: started ? `Day ${currentLock}/${totalLock}` : "Day 0/0",
            displayTemperatureState: titleCase(record.temperatureState || "—"),
            displayWeatherLabel: weatherLabel(record.weatherEvent || ""),
            displayTemperatureValue: started ? formatTemperature(record.temperatureState, environment) : "—",
            displayTemperatureType: started ? temperatureTypeLabel(record.temperatureState) : "",
            groundBits,
            showRuins: !!environment.addRuins,
            showManualRuinFamily: !!environment.addRuins && environment.ruinStyleMode === "manual",
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
}