/**
 * terr-encounters v0.1.0-b11
 * Function: registers world and client weather settings used by the controller,
 * UI, and optional exposure tracking.
 */

const MODULE_ID = "terr-encounters";

export const WEATHER_SETTING_KEYS = {
    ENABLED: "weatherEnabled",
    PANEL_OPEN: "weatherPanelOpen",
    EXPOSURE_ENABLED: "weatherExposureEnabled",
    DEFAULT_BIOME: "weatherDefaultBiome",
    DEFAULT_CLIMATE: "weatherDefaultClimate",
    DEFAULT_SEASON: "weatherDefaultSeason",
    DEFAULT_PHASE: "weatherDefaultPhase",
    DEFAULT_RUINS_ENABLED: "weatherDefaultRuinsEnabled",
    ABSOLUTE_DAY: "weatherAbsoluteDay"
};

export function registerWeatherSettings() {
    game.settings.register(MODULE_ID, WEATHER_SETTING_KEYS.ENABLED, {
        name: "Enable Weather System",
        hint: "Master toggle for the Terr Encounters weather system.",
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    });

    game.settings.register(MODULE_ID, WEATHER_SETTING_KEYS.EXPOSURE_ENABLED, {
        name: "Enable Exposure Tracker",
        hint: "Turns on the optional exposure hardship tracker.",
        scope: "world",
        config: true,
        type: Boolean,
        default: false
    });

    game.settings.register(MODULE_ID, WEATHER_SETTING_KEYS.DEFAULT_BIOME, {
        name: "Default Biome",
        hint: "Default biome used when a new weather state is created.",
        scope: "world",
        config: true,
        type: String,
        default: "temperate_forest"
    });

    game.settings.register(MODULE_ID, WEATHER_SETTING_KEYS.DEFAULT_CLIMATE, {
        name: "Default Climate",
        hint: "Default climate used when a new weather state is created.",
        scope: "world",
        config: true,
        type: String,
        default: "temperate"
    });

    game.settings.register(MODULE_ID, WEATHER_SETTING_KEYS.DEFAULT_SEASON, {
        name: "Default Season",
        hint: "Default season used when a new weather state is created.",
        scope: "world",
        config: true,
        type: String,
        default: "spring"
    });

    game.settings.register(MODULE_ID, WEATHER_SETTING_KEYS.DEFAULT_PHASE, {
        name: "Default Phase",
        hint: "Default seasonal phase used when a new weather state is created.",
        scope: "world",
        config: true,
        type: String,
        default: "mid"
    });

    game.settings.register(MODULE_ID, WEATHER_SETTING_KEYS.DEFAULT_RUINS_ENABLED, {
        name: "Default Ruins Flavor",
        hint: "Default ruins flavor flag used when a new weather state is created.",
        scope: "world",
        config: true,
        type: Boolean,
        default: false
    });

    game.settings.register(MODULE_ID, WEATHER_SETTING_KEYS.ABSOLUTE_DAY, {
        name: "Absolute Weather Day",
        hint: "Persistent day counter for the weather system.",
        scope: "world",
        config: false,
        type: Number,
        default: 1
    });

    game.settings.register(MODULE_ID, WEATHER_SETTING_KEYS.PANEL_OPEN, {
        name: "Weather Panel Open",
        hint: "Remembers whether the weather panel is open for this user.",
        scope: "client",
        config: false,
        type: Boolean,
        default: false
    });
}

export function isWeatherEnabled() {
    return game.settings.get(MODULE_ID, WEATHER_SETTING_KEYS.ENABLED);
}

export function isExposureEnabled() {
    return game.settings.get(MODULE_ID, WEATHER_SETTING_KEYS.EXPOSURE_ENABLED);
}

export function getWeatherDefaults() {
    return {
        biome: game.settings.get(MODULE_ID, WEATHER_SETTING_KEYS.DEFAULT_BIOME),
        climate: game.settings.get(MODULE_ID, WEATHER_SETTING_KEYS.DEFAULT_CLIMATE),
        season: game.settings.get(MODULE_ID, WEATHER_SETTING_KEYS.DEFAULT_SEASON),
        phase: game.settings.get(MODULE_ID, WEATHER_SETTING_KEYS.DEFAULT_PHASE),
        ruinsEnabled: game.settings.get(MODULE_ID, WEATHER_SETTING_KEYS.DEFAULT_RUINS_ENABLED)
    };
}

export function getAbsoluteWeatherDay() {
    return game.settings.get(MODULE_ID, WEATHER_SETTING_KEYS.ABSOLUTE_DAY);
}

export async function setAbsoluteWeatherDay(day) {
    return game.settings.set(MODULE_ID, WEATHER_SETTING_KEYS.ABSOLUTE_DAY, Number(day) || 1);
}

export function getWeatherPanelOpen() {
    return game.settings.get(MODULE_ID, WEATHER_SETTING_KEYS.PANEL_OPEN);
}

export async function setWeatherPanelOpen(isOpen) {
    return game.settings.set(MODULE_ID, WEATHER_SETTING_KEYS.PANEL_OPEN, Boolean(isOpen));
}