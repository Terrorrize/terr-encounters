export const MODULE_ID = "terr-encounters";

export const SETTING_KEYS = {
    season: "season",
    seasonPhase: "seasonPhase",
    biome: "biome",
    addRuins: "addRuins",
    ruinFrequency: "ruinFrequency",
    ruinStyleMode: "ruinStyleMode",
    manualRuinFamily: "manualRuinFamily",
    currentDayRecord: "currentDayRecord"
};

export const DEFAULT_SETTINGS = {
    season: "Spring",
    seasonPhase: "Early",
    biome: "Forest",
    addRuins: false,
    ruinFrequency: "mixed",
    ruinStyleMode: "auto",
    manualRuinFamily: ""
};

function registerWorldSetting(key, config) {
    game.settings.register(MODULE_ID, key, {
        scope: "world",
        config: true,
        ...config
    });
}

export function registerWeatherSettings() {
    registerWorldSetting(SETTING_KEYS.season, {
        name: "Weather Season",
        hint: "Controls the active season used by the weather engine.",
        type: String,
        choices: {
            Spring: "Spring",
            Summer: "Summer",
            Autumn: "Autumn",
            Winter: "Winter",
            "Cool Season": "Cool Season",
            "Hot Season": "Hot Season",
            "Wet Season": "Wet Season",
            "Dry Season": "Dry Season"
        },
        default: DEFAULT_SETTINGS.season
    });

    registerWorldSetting(SETTING_KEYS.seasonPhase, {
        name: "Weather Season Phase",
        hint: "Controls the active phase within the season.",
        type: String,
        choices: {
            Early: "Early",
            Mid: "Mid",
            Late: "Late"
        },
        default: DEFAULT_SETTINGS.seasonPhase
    });

    registerWorldSetting(SETTING_KEYS.biome, {
        name: "Weather Biome",
        hint: "Controls the active biome for weather generation.",
        type: String,
        choices: {
            Forest: "Forest",
            Plains: "Plains",
            Hills: "Hills",
            Mountains: "Mountains",
            Desert: "Desert",
            Tundra: "Tundra",
            "Urban Fringe": "Urban Fringe",
            "Temperate Coast": "Temperate Coast",
            "Tropical Coast": "Tropical Coast",
            "Temperate Swamp": "Temperate Swamp",
            "Tropical Swamp": "Tropical Swamp"
        },
        default: DEFAULT_SETTINGS.biome
    });

    registerWorldSetting(SETTING_KEYS.addRuins, {
        name: "Add Ruins",
        hint: "Enable optional ruin overlay on the Ground line.",
        type: Boolean,
        default: DEFAULT_SETTINGS.addRuins
    });

    registerWorldSetting(SETTING_KEYS.ruinFrequency, {
        name: "Ruin Frequency",
        hint: "Controls how often ruin modifiers appear when ruins are enabled.",
        type: String,
        choices: {
            faint: "Faint",
            light: "Light",
            mixed: "Mixed"
        },
        default: DEFAULT_SETTINGS.ruinFrequency
    });

    registerWorldSetting(SETTING_KEYS.ruinStyleMode, {
        name: "Ruin Style Mode",
        hint: "Auto by biome or choose a manual ruin family.",
        type: String,
        choices: {
            auto: "Auto by Biome",
            manual: "Manual"
        },
        default: DEFAULT_SETTINGS.ruinStyleMode
    });

    registerWorldSetting(SETTING_KEYS.manualRuinFamily, {
        name: "Manual Ruin Family",
        hint: "Used only when Ruin Style Mode is Manual.",
        type: String,
        default: DEFAULT_SETTINGS.manualRuinFamily
    });

    game.settings.register(MODULE_ID, SETTING_KEYS.currentDayRecord, {
        scope: "world",
        config: false,
        type: Object,
        default: {}
    });
}

export function getWeatherSetting(key) {
    return game.settings.get(MODULE_ID, key);
}

export async function setWeatherSetting(key, value) {
    return game.settings.set(MODULE_ID, key, value);
}

export function getWeatherEnvironment() {
    return {
        season: getWeatherSetting(SETTING_KEYS.season),
        phase: getWeatherSetting(SETTING_KEYS.seasonPhase),
        biome: getWeatherSetting(SETTING_KEYS.biome),
        addRuins: getWeatherSetting(SETTING_KEYS.addRuins),
        ruinFrequency: getWeatherSetting(SETTING_KEYS.ruinFrequency),
        ruinStyleMode: getWeatherSetting(SETTING_KEYS.ruinStyleMode),
        manualRuinFamily: getWeatherSetting(SETTING_KEYS.manualRuinFamily)
    };
}
