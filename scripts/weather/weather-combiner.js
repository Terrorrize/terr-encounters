import { chooseOne, sentenceCase } from "./weather-utils.js";
import { GROUND_ANCHORS, TERRAIN_INTERACTIONS, WEATHER_ACTION_BY_EVENT, WEATHER_ACTIONS, WEATHER_INTENSITY, WEATHER_OPENERS } from "../data/weather-language-foundation.js";
import { GROUND_OPENERS } from "../data/weather-ground-openers.js";
import { TEMPERATURE_FEELS, TEMPERATURE_OPENERS, TEMPERATURE_TONES } from "../data/weather-compatibility.js";

const BIOME_TAILS = {
    "Forest": ["beneath the canopy", "under the trees", "in the shaded woods"],
    "Plains": ["across the open ground", "over the plain", "through the field"],
    "Hills": ["along the slopes", "over the open rises", "across the ridgelines"],
    "Mountains": ["on the exposed heights", "along the ridges", "over the upper stone"],
    "Desert": ["across the exposed flats", "over the dunes", "across the open sand"],
    "Tundra": ["across the open tundra", "over the frozen flats", "across the pale ground"],
    "Urban Fringe": ["across the open lots", "through the verge ground", "over the broken edges"],
    "Temperate Coast": ["along the shore", "off the water", "through the salt air"],
    "Tropical Coast": ["along the warm shore", "off the water", "through the coastal heat"],
    "Temperate Swamp": ["through the marsh air", "over the wet ground", "among the reeds"],
    "Tropical Swamp": ["through the swamp growth", "over the black water", "among the flooded roots"]
};

function buildGroundLine({ biome, groundState, ruinModifier, ruinFamily, ruinDetail }) {
    const opener = chooseOne(GROUND_OPENERS[groundState] ?? ["The ground lies across"]);
    const anchor = chooseOne(GROUND_ANCHORS[biome] ?? ["the ground"]);
    let line = `${opener} ${anchor}.`;

    if (ruinModifier && ruinFamily && ruinDetail) {
        line += ` ${sentenceCase(ruinDetail)} show through the ground in ${ruinModifier}.`;
    }

    return line;
}

function buildTemperatureLine({ biome, temperatureState }) {
    const tone = TEMPERATURE_TONES[temperatureState] ?? "mild";
    const opener = TEMPERATURE_OPENERS[tone] ?? "The air is";
    const feelKey = TEMPERATURE_FEELS[temperatureState]
        ? temperatureState
        : ["Thaw / Mild Thaw / Warm Break", "Cool Break"].includes(temperatureState)
            ? temperatureState
            : "Mild";

    const feel = chooseOne(TEMPERATURE_FEELS[feelKey] ?? TEMPERATURE_FEELS.Mild);
    const tail = chooseOne(BIOME_TAILS[biome] ?? []);
    return `${opener} ${feel}${tail ? ` ${tail}` : ""}.`;
}

function buildWeatherLine({ biome, weatherEvent }) {
    const opener = chooseOne(WEATHER_OPENERS[weatherEvent] ?? [sentenceCase(weatherEvent)]);
    const actionGroup = WEATHER_ACTION_BY_EVENT[weatherEvent] ?? "move";
    const action = chooseOne(WEATHER_ACTIONS[actionGroup] ?? WEATHER_ACTIONS.move);
    const terrain = chooseOne(TERRAIN_INTERACTIONS[biome] ?? ["the ground"]);
    return `${opener} ${action} ${terrain}.`;
}

function getOutputOrder(weatherEvent) {
    const intensity = WEATHER_INTENSITY[weatherEvent] ?? "quiet";
    if (intensity === "dramatic") return ["weather", "temperature", "ground"];
    return ["ground", "temperature", "weather"];
}

export class WeatherCombiner {
    static build(record) {
        const ground = buildGroundLine(record);
        const temperature = buildTemperatureLine(record);
        const weather = buildWeatherLine(record);
        const outputOrder = getOutputOrder(record.weatherEvent);

        return {
            outputOrder,
            outputGroundLine: ground,
            outputTemperatureLine: temperature,
            outputWeatherLine: weather
        };
    }
}
