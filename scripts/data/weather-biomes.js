// FILE: scripts/data/weather-biomes.js
/**
 * terr-encounters v0.1.0-b1
 * Function: biome and climate source-of-truth data. This file defines the
 * supported biome roster, the supported climate roster, and helper accessors
 * used by the weather baseline layer.
 */

export const WEATHER_BIOMES_VERSION = "0.1.0-b1";

export const WEATHER_BIOMES = {
    forest: {
        label: "Forest",
        tags: ["canopy", "sheltered", "wet"],
        modifiers: {
            clear: -2,
            overcast: 2,
            foggy: 4,
            rainy: 4,
            snowy: 2,
            windy: -2,
            warm: 0,
            hot: -1,
            cold: 1,
            precipNone: -4,
            precipRain: 4,
            precipSnow: 2,
            precipSleet: 1,
            precipFrequent: 3,
            precipConstant: 1,
            windCalm: 2,
            windLight: 2,
            windModerate: -1,
            windStrong: -2,
            windSevere: -2,
            tempShiftC: -1
        }
    },

    plains: {
        label: "Plains",
        tags: ["open", "windy", "exposed"],
        modifiers: {
            clear: 3,
            overcast: 0,
            foggy: -2,
            rainy: 0,
            snowy: 1,
            windy: 5,
            warm: 1,
            hot: 1,
            cold: 0,
            precipNone: 2,
            precipRain: 0,
            precipSnow: 1,
            precipSleet: 0,
            precipFrequent: -1,
            precipConstant: -1,
            windCalm: -2,
            windLight: 1,
            windModerate: 2,
            windStrong: 3,
            windSevere: 1,
            tempShiftC: 0
        }
    },

    hills: {
        label: "Hills",
        tags: ["rolling", "breezy"],
        modifiers: {
            clear: 1,
            overcast: 1,
            foggy: 0,
            rainy: 1,
            snowy: 1,
            windy: 3,
            warm: 0,
            hot: 0,
            cold: 1,
            precipNone: 0,
            precipRain: 1,
            precipSnow: 1,
            precipSleet: 1,
            precipFrequent: 0,
            precipConstant: 0,
            windCalm: -1,
            windLight: 1,
            windModerate: 1,
            windStrong: 2,
            windSevere: 1,
            tempShiftC: -1
        }
    },

    mountains: {
        label: "Mountains",
        tags: ["high", "cold", "windy"],
        modifiers: {
            clear: 2,
            overcast: 1,
            foggy: 1,
            rainy: 0,
            snowy: 5,
            windy: 6,
            warm: -2,
            hot: -3,
            cold: 5,
            precipNone: 1,
            precipRain: -2,
            precipSnow: 5,
            precipSleet: 2,
            precipFrequent: 1,
            precipConstant: 0,
            windCalm: -3,
            windLight: 0,
            windModerate: 2,
            windStrong: 3,
            windSevere: 2,
            tempShiftC: -6
        }
    },

    desert: {
        label: "Desert",
        tags: ["arid", "open", "harsh"],
        modifiers: {
            clear: 8,
            overcast: -4,
            foggy: -4,
            rainy: -6,
            snowy: -5,
            windy: 4,
            warm: 2,
            hot: 5,
            cold: -2,
            precipNone: 12,
            precipRain: -8,
            precipSnow: -6,
            precipSleet: -4,
            precipFrequent: -6,
            precipConstant: -5,
            windCalm: -2,
            windLight: 0,
            windModerate: 2,
            windStrong: 2,
            windSevere: 1,
            tempShiftC: 5
        }
    },

    tundra: {
        label: "Tundra",
        tags: ["open", "cold", "snow"],
        modifiers: {
            clear: 1,
            overcast: 2,
            foggy: 0,
            rainy: -3,
            snowy: 7,
            windy: 5,
            warm: -4,
            hot: -5,
            cold: 8,
            precipNone: 2,
            precipRain: -5,
            precipSnow: 8,
            precipSleet: 2,
            precipFrequent: 1,
            precipConstant: 0,
            windCalm: -3,
            windLight: -1,
            windModerate: 2,
            windStrong: 3,
            windSevere: 2,
            tempShiftC: -8
        }
    },

    coast: {
        label: "Coast",
        tags: ["maritime", "wet", "wind"],
        modifiers: {
            clear: -1,
            overcast: 3,
            foggy: 5,
            rainy: 4,
            snowy: 0,
            windy: 4,
            warm: 0,
            hot: -1,
            cold: 0,
            precipNone: -2,
            precipRain: 4,
            precipSnow: 0,
            precipSleet: 2,
            precipFrequent: 3,
            precipConstant: 1,
            windCalm: -2,
            windLight: 1,
            windModerate: 2,
            windStrong: 2,
            windSevere: 1,
            tempShiftC: 0
        }
    },

    swamp: {
        label: "Swamp",
        tags: ["wet", "still", "fog"],
        modifiers: {
            clear: -2,
            overcast: 2,
            foggy: 7,
            rainy: 5,
            snowy: 0,
            windy: -3,
            warm: 1,
            hot: 1,
            cold: -1,
            precipNone: -4,
            precipRain: 5,
            precipSnow: 0,
            precipSleet: 1,
            precipFrequent: 4,
            precipConstant: 1,
            windCalm: 4,
            windLight: 1,
            windModerate: -2,
            windStrong: -2,
            windSevere: -2,
            tempShiftC: 1
        }
    },

    urban_fringe: {
        label: "Urban Fringe",
        tags: ["mixed", "edge", "settled"],
        modifiers: {
            clear: 2,
            overcast: 0,
            foggy: -1,
            rainy: 0,
            snowy: 0,
            windy: 2,
            warm: 1,
            hot: 1,
            cold: -1,
            precipNone: 1,
            precipRain: 0,
            precipSnow: 0,
            precipSleet: 0,
            precipFrequent: -1,
            precipConstant: -1,
            windCalm: -1,
            windLight: 1,
            windModerate: 1,
            windStrong: 1,
            windSevere: 0,
            tempShiftC: 1
        }
    }
};

export const WEATHER_CLIMATES = {
    tropical: {
        label: "Tropical",
        family: "hot"
    },
    dry: {
        label: "Dry",
        family: "dry"
    },
    temperate: {
        label: "Temperate",
        family: "middle"
    },
    continental: {
        label: "Continental",
        family: "cold"
    },
    polar: {
        label: "Polar",
        family: "extreme_cold"
    }
};

export const WEATHER_SEASONS = ["spring", "summer", "autumn", "winter"];
export const WEATHER_PHASES = ["early", "mid", "late"];

export function getAvailableBiomeKeys() {
    return Object.keys(WEATHER_BIOMES);
}

export function getAvailableClimateKeys() {
    return Object.keys(WEATHER_CLIMATES);
}

export function getBiomeDefinition(biome) {
    return WEATHER_BIOMES[biome] ?? WEATHER_BIOMES.forest;
}

export function getClimateDefinition(climate) {
    return WEATHER_CLIMATES[climate] ?? WEATHER_CLIMATES.temperate;
}

export function biomeExists(biome) {
    return Object.prototype.hasOwnProperty.call(WEATHER_BIOMES, biome);
}

export function climateExists(climate) {
    return Object.prototype.hasOwnProperty.call(WEATHER_CLIMATES, climate);
}