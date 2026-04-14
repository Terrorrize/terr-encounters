import { getPhaseData, getInitialGroundState } from "../data/weather-biomes.js";
import { chooseOne } from "./weather-utils.js";

const GROUND_TRIGGER_RULES = {
    wet: {
        weather: ["drizzle", "rain", "steady rain", "light rain", "brief rain", "brief hard rain", "hard rain", "cold rain"],
        grounds: ["wet leaf litter", "damp forest floor", "runoff-softened earth", "soft black mud", "flooded low ground", "dark standing water", "wet sand", "slick tidal rock", "shallow water"]
    },
    snow: {
        weather: ["light snow", "steady snow", "blowing snow", "blizzard", "late snow", "first snow"],
        grounds: ["light snow cover", "deep snow cover", "crusted snow", "patchy snow", "drifted snow"]
    },
    thaw: {
        temperature: ["Thaw / Mild Thaw / Warm Break"],
        grounds: ["slush-softened ground", "runoff-softened earth", "dark damp ground", "wet sand", "soft black mud"]
    },
    hardCold: {
        temperature: ["Cold Snap", "Hard Cold", "Deep Cold", "Bitter Freeze", "Severe Cold"],
        grounds: ["hard frozen ground", "bare cold ground", "crusted snow", "frost-stiffened grass"]
    },
    heat: {
        temperature: ["Hot", "Heat Wave", "Dry Heat", "Harsh Dry Heat"],
        grounds: ["dry open ground", "baked ground", "cracked hardpan", "loose dust", "open dust flats"]
    },
    growth: {
        temperature: ["Mild", "Warm", "Humid Heat"],
        grounds: ["fresh undergrowth", "dense green undergrowth", "fern-thick ground", "thick grass", "tall grass", "salt grass and dune growth", "root tangles and reeds"]
    }
};

function hasRecentMatch(record, field, values) {
    const history = field === "temperature"
        ? record.recentTemperatureStates ?? []
        : record.recentWeatherEvents ?? [];

    return history.some(v => values.includes(v));
}

function filterToAvailable(availableStates, desiredStates) {
    return availableStates.filter(state => desiredStates.includes(state));
}

export class WeatherGround {
    static updateGroundState(record, environment) {
        const phaseData = getPhaseData(environment.biome, environment.season, environment.phase);
        if (!phaseData?.groundStates?.length) {
            return getInitialGroundState(environment.biome, environment.season, environment.phase);
        }

        const available = phaseData.groundStates;
        const current = record.groundState;

        const wetCandidates = filterToAvailable(available, GROUND_TRIGGER_RULES.wet.grounds);
        const snowCandidates = filterToAvailable(available, GROUND_TRIGGER_RULES.snow.grounds);
        const thawCandidates = filterToAvailable(available, GROUND_TRIGGER_RULES.thaw.grounds);
        const coldCandidates = filterToAvailable(available, GROUND_TRIGGER_RULES.hardCold.grounds);
        const heatCandidates = filterToAvailable(available, GROUND_TRIGGER_RULES.heat.grounds);
        const growthCandidates = filterToAvailable(available, GROUND_TRIGGER_RULES.growth.grounds);

        if (
            GROUND_TRIGGER_RULES.wet.weather.includes(record.weatherEvent) ||
            hasRecentMatch(record, "weather", GROUND_TRIGGER_RULES.wet.weather)
        ) {
            const next = chooseOne(wetCandidates);
            if (next) return next;
        }

        if (
            GROUND_TRIGGER_RULES.snow.weather.includes(record.weatherEvent) ||
            hasRecentMatch(record, "weather", GROUND_TRIGGER_RULES.snow.weather)
        ) {
            const next = chooseOne(snowCandidates);
            if (next) return next;
        }

        if (GROUND_TRIGGER_RULES.thaw.temperature.includes(record.temperatureState)) {
            const next = chooseOne(thawCandidates);
            if (next) return next;
        }

        if (GROUND_TRIGGER_RULES.hardCold.temperature.includes(record.temperatureState)) {
            const next = chooseOne(coldCandidates);
            if (next) return next;
        }

        if (GROUND_TRIGGER_RULES.heat.temperature.includes(record.temperatureState)) {
            const next = chooseOne(heatCandidates);
            if (next) return next;
        }

        if (GROUND_TRIGGER_RULES.growth.temperature.includes(record.temperatureState)) {
            const next = chooseOne(growthCandidates);
            if (next) return next;
        }

        if (current && available.includes(current) && Math.random() < 0.7) {
            return current;
        }

        return chooseOne(available) ?? current ?? getInitialGroundState(environment.biome, environment.season, environment.phase);
    }
}
