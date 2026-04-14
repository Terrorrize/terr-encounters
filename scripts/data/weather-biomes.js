import { toKey } from "../weather/weather-utils.js";

const SHARED_LOCKS = {
    temperature: {
        default: [1, 3],
        "Cold Snap": [2, 4],
        "Hard Cold": [2, 4],
        "Deep Cold": [2, 5],
        "Bitter Freeze": [3, 6],
        "Severe Cold": [3, 6],
        "Heat Wave": [3, 7],
        "Humid Heat": [3, 7],
        "Dry Heat": [3, 7],
        "Harsh Dry Heat": [3, 7],
        "Thaw / Mild Thaw / Warm Break": [1, 3],
        "Cool Break": [1, 2]
    },
    weather: {
        default: [1, 2],
        "clear/fair": [1, 3],
        "cloud cover": [1, 2],
        "mist/fog": [1, 2],
        "fog": [1, 2],
        "freezing fog": [1, 2],
        "sea mist": [1, 2],
        "thaw mist": [1, 2],
        "drizzle": [1, 2],
        "rain": [1, 2],
        "steady rain": [1, 3],
        "light rain": [1, 2],
        "brief rain": [1, 1],
        "brief hard rain": [1, 1],
        "wind": [1, 2],
        "hard wind": [1, 2],
        "dry wind": [1, 3],
        "sea breeze": [1, 3],
        "light snow": [1, 2],
        "steady snow": [1, 3],
        "blowing snow": [1, 2],
        "blizzard": [1, 2],
        "sleet": [1, 1],
        "thunderstorm": [1, 1],
        "storm squall": [1, 1],
        "cold squall": [1, 1],
        "humid haze": [1, 3],
        "heat haze": [1, 3],
        "dust wall": [1, 1],
        "blowing dust": [1, 2],
        "ice-crystal drift": [1, 2]
    }
};

function entry(value, weight = 1) {
    return { value, weight };
}

function buildPhaseData(groundStates, temperatureStates, weatherEvents) {
    return { groundStates, temperatureStates, weatherEvents };
}

function profile(definition) {
    return {
        seasonType: definition.seasonType,
        seasons: definition.seasons,
        locks: foundry.utils.deepClone(SHARED_LOCKS)
    };
}

const FOREST = profile({
    seasonType: "temperate",
    seasons: {
        Spring: {
            Early: buildPhaseData(
                ["thawing ground", "wet leaf litter", "lingering frost pockets", "runoff-softened earth", "moss-darkened roots and stone", "bare patches under the trees"],
                [entry("Chill", 4), entry("Mild", 3), entry("Cold Snap", 2), entry("Thaw / Mild Thaw / Warm Break", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("mist/fog", 2), entry("drizzle", 3), entry("rain", 3), entry("wind", 2), entry("sleet", 1), entry("late snow", 1)]
            ),
            Mid: buildPhaseData(
                ["wet leaf litter", "fresh undergrowth", "moss-darkened roots and stone", "runoff-softened earth", "damp forest floor", "thickening green beneath the trees"],
                [entry("Chill", 3), entry("Mild", 4), entry("Warm", 2), entry("Cold Snap", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("mist/fog", 2), entry("drizzle", 2), entry("rain", 3), entry("wind", 2), entry("thunderstorm", 1), entry("sleet", 1)]
            ),
            Late: buildPhaseData(
                ["fresh undergrowth", "moss-darkened roots and stone", "damp forest floor", "thick green beneath the trees", "fern-thick ground", "soft leaf litter under new growth"],
                [entry("Mild", 4), entry("Warm", 3), entry("Hot", 1), entry("Cool Break", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("mist/fog", 1), entry("drizzle", 2), entry("rain", 2), entry("thunderstorm", 2), entry("wind", 2), entry("warm still air", 1)]
            )
        },
        Summer: {
            Early: buildPhaseData(
                ["dense green undergrowth", "fern-thick ground", "shaded damp pockets", "overgrown forest floor", "moss-darkened roots and stone", "soft summer leaf litter"],
                [entry("Mild", 2), entry("Warm", 4), entry("Hot", 2), entry("Cool Break", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("mist/fog", 1), entry("light rain", 2), entry("steady rain", 2), entry("thunderstorm", 2), entry("wind", 2), entry("humid haze", 1)]
            ),
            Mid: buildPhaseData(
                ["dense green undergrowth", "dry needle floor", "fern-thick ground", "shaded damp pockets", "overgrown forest floor", "sun-baked clearings"],
                [entry("Warm", 4), entry("Hot", 3), entry("Heat Wave", 2), entry("Humid Heat", 2)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("mist/fog", 1), entry("steady rain", 1), entry("thunderstorm", 2), entry("wind", 2), entry("humid haze", 2), entry("heat haze", 1)]
            ),
            Late: buildPhaseData(
                ["dry needle floor", "dense green undergrowth", "sun-baked clearings", "shaded damp pockets", "overgrown forest floor", "drying brush beneath the trees"],
                [entry("Warm", 3), entry("Hot", 3), entry("Heat Wave", 2), entry("Dry Heat", 2)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("light rain", 1), entry("thunderstorm", 2), entry("dry wind", 2), entry("humid haze", 1), entry("heat haze", 1)]
            )
        },
        Autumn: {
            Early: buildPhaseData(
                ["fallen leaves beginning to gather", "damp leaf litter", "thinning undergrowth", "bare root and stone", "cool darkening forest floor", "early leaf fall"],
                [entry("Mild", 3), entry("Chill", 3), entry("Warm", 1), entry("Cool Break", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("mist/fog", 2), entry("drizzle", 2), entry("steady rain", 2), entry("wind", 2), entry("thunderstorm", 1)]
            ),
            Mid: buildPhaseData(
                ["fallen leaves", "damp leaf litter", "bare root and stone", "wet rot underfoot", "thinning brush", "early frost on leaves"],
                [entry("Chill", 3), entry("Cold", 3), entry("Mild", 1), entry("Hard Cold", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("fog", 2), entry("drizzle", 2), entry("steady rain", 2), entry("wind", 2), entry("sleet", 1), entry("first snow", 1)]
            ),
            Late: buildPhaseData(
                ["fallen leaves lying thick", "bare root and stone", "wet rot underfoot", "late autumn dieback", "exposed forest floor", "first thin frost on the ground"],
                [entry("Cold", 3), entry("Hard Cold", 3), entry("Thaw / Mild Thaw / Warm Break", 1), entry("Cold Snap", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("fog", 2), entry("drizzle", 2), entry("steady rain", 2), entry("wind", 2), entry("sleet", 1), entry("first snow", 1)]
            )
        },
        Winter: {
            Early: buildPhaseData(
                ["light snow cover", "hard frozen ground", "bare cold ground", "crusted snow", "patchy snow", "frost-stiffened grass"],
                [entry("Cold", 3), entry("Deep Cold", 3), entry("Thaw / Mild Thaw / Warm Break", 1), entry("Bitter Freeze", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("light snow", 2), entry("steady snow", 2), entry("sleet", 1), entry("hard wind", 2), entry("freezing fog", 1)]
            ),
            Mid: buildPhaseData(
                ["deep snow cover", "crusted snow", "hard frozen ground", "bare cold ground", "drifted snow", "buried root and stone"],
                [entry("Deep Cold", 3), entry("Severe Cold", 3), entry("Bitter Freeze", 2), entry("Thaw / Mild Thaw / Warm Break", 1)],
                [entry("clear/fair", 1), entry("cloud cover", 2), entry("light snow", 2), entry("steady snow", 2), entry("blowing snow", 2), entry("blizzard", 1), entry("freezing fog", 1), entry("hard wind", 2)]
            ),
            Late: buildPhaseData(
                ["crusted snow", "hard frozen ground", "deep snow cover", "slush-softened ground", "patchy snow", "drifted snow"],
                [entry("Cold", 3), entry("Deep Cold", 3), entry("Thaw / Mild Thaw / Warm Break", 2), entry("Bitter Freeze", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("light snow", 2), entry("steady snow", 2), entry("blowing snow", 1), entry("sleet", 1), entry("freezing fog", 1), entry("hard wind", 2)]
            )
        }
    }
});

const PLAINS = profile({
    seasonType: "temperate",
    seasons: {
        Spring: {
            Early: buildPhaseData(
                ["runoff-softened earth", "dry open ground", "patchy snow", "frost-stiffened grass", "wet leaf litter", "wind-stripped ground"],
                [entry("Chill", 4), entry("Mild", 3), entry("Cold Snap", 2), entry("Thaw / Mild Thaw / Warm Break", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("wind", 3), entry("drizzle", 2), entry("rain", 2), entry("mist/fog", 1), entry("sleet", 1), entry("late snow", 1)]
            ),
            Mid: buildPhaseData(
                ["thick grass", "runoff-softened earth", "fresh undergrowth", "dry open ground", "wind-stripped ground"],
                [entry("Chill", 3), entry("Mild", 4), entry("Warm", 2), entry("Cold Snap", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("wind", 3), entry("drizzle", 2), entry("rain", 2), entry("thunderstorm", 1), entry("mist/fog", 1), entry("sleet", 1)]
            ),
            Late: buildPhaseData(
                ["thick grass", "fresh undergrowth", "dry open ground", "baked ground"],
                [entry("Mild", 4), entry("Warm", 3), entry("Hot", 1), entry("Cool Break", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("wind", 3), entry("rain", 2), entry("thunderstorm", 2), entry("heat haze", 1)]
            )
        },
        Summer: {
            Early: buildPhaseData(
                ["tall grass", "thick grass", "dry open ground", "fresh undergrowth"],
                [entry("Mild", 2), entry("Warm", 4), entry("Hot", 2), entry("Cool Break", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("wind", 3), entry("light rain", 1), entry("steady rain", 1), entry("thunderstorm", 2), entry("heat haze", 1)]
            ),
            Mid: buildPhaseData(
                ["tall grass", "dry open ground", "baked ground", "thick grass"],
                [entry("Warm", 4), entry("Hot", 3), entry("Heat Wave", 2), entry("Dry Heat", 2)],
                [entry("clear/fair", 2), entry("cloud cover", 1), entry("wind", 2), entry("thunderstorm", 2), entry("dry wind", 2), entry("heat haze", 2), entry("brief hard rain", 1)]
            ),
            Late: buildPhaseData(
                ["tall grass", "dry open ground", "baked ground", "loose dust", "open dust flats"],
                [entry("Warm", 3), entry("Hot", 3), entry("Heat Wave", 2), entry("Harsh Dry Heat", 2)],
                [entry("clear/fair", 2), entry("cloud cover", 1), entry("dry wind", 3), entry("thunderstorm", 1), entry("heat haze", 2), entry("brief hard rain", 1), entry("blowing dust", 1)]
            )
        },
        Autumn: {
            Early: buildPhaseData(
                ["tall grass", "dry open ground", "frost-stiffened grass", "wind-stripped ground"],
                [entry("Mild", 3), entry("Chill", 3), entry("Thaw / Mild Thaw / Warm Break", 1), entry("Cool Break", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("wind", 3), entry("drizzle", 1), entry("steady rain", 2), entry("thunderstorm", 1), entry("mist/fog", 1)]
            ),
            Mid: buildPhaseData(
                ["frost-stiffened grass", "dry open ground", "wind-stripped ground", "bare cold ground"],
                [entry("Chill", 3), entry("Cold", 3), entry("Mild", 1), entry("Hard Cold", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("wind", 3), entry("drizzle", 1), entry("steady rain", 2), entry("mist/fog", 1), entry("sleet", 1), entry("first snow", 1)]
            ),
            Late: buildPhaseData(
                ["frost-stiffened grass", "bare cold ground", "wind-stripped ground", "hard frozen ground"],
                [entry("Cold", 3), entry("Hard Cold", 3), entry("Thaw / Mild Thaw / Warm Break", 1), entry("Cold Snap", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("wind", 3), entry("drizzle", 1), entry("steady rain", 1), entry("sleet", 2), entry("first snow", 1)]
            )
        },
        Winter: {
            Early: buildPhaseData(
                ["frost-stiffened grass", "patchy snow", "hard frozen ground", "crusted snow"],
                [entry("Cold", 3), entry("Deep Cold", 3), entry("Thaw / Mild Thaw / Warm Break", 1), entry("Bitter Freeze", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("hard wind", 3), entry("light snow", 2), entry("steady snow", 2), entry("sleet", 1), entry("freezing fog", 1)]
            ),
            Mid: buildPhaseData(
                ["deep snow cover", "drifted snow", "hard frozen ground", "crusted snow"],
                [entry("Deep Cold", 3), entry("Severe Cold", 3), entry("Bitter Freeze", 2), entry("Thaw / Mild Thaw / Warm Break", 1)],
                [entry("clear/fair", 1), entry("cloud cover", 2), entry("hard wind", 3), entry("light snow", 2), entry("steady snow", 2), entry("blowing snow", 2), entry("blizzard", 1), entry("freezing fog", 1)]
            ),
            Late: buildPhaseData(
                ["crusted snow", "patchy snow", "hard frozen ground", "slush-softened ground", "drifted snow"],
                [entry("Cold", 3), entry("Deep Cold", 3), entry("Thaw / Mild Thaw / Warm Break", 2), entry("Bitter Freeze", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("hard wind", 3), entry("light snow", 2), entry("steady snow", 2), entry("sleet", 1), entry("blowing snow", 1), entry("freezing fog", 1)]
            )
        }
    }
});

const HILLS = foundry.utils.deepClone(PLAINS);
const URBAN_FRINGE = foundry.utils.deepClone(PLAINS);

const MOUNTAINS = profile({
    seasonType: "temperate",
    seasons: {
        Spring: {
            Early: buildPhaseData(
                ["patchy snow", "exposed stone and gravel", "runoff-softened earth", "dark damp ground", "hard frozen ground"],
                [entry("Cold", 4), entry("Deep Cold", 3), entry("Thaw / Mild Thaw / Warm Break", 1), entry("Cold Snap", 2)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("hard wind", 3), entry("freezing fog", 1), entry("sleet", 1), entry("late snow", 2), entry("light snow", 2), entry("cold rain", 1)]
            ),
            Mid: buildPhaseData(
                ["patchy snow", "exposed stone and gravel", "runoff-softened earth", "hard frozen ground"],
                [entry("Cold", 3), entry("Chill", 2), entry("Thaw / Mild Thaw / Warm Break", 1), entry("Cold Snap", 2)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("hard wind", 3), entry("mist/fog", 1), entry("sleet", 1), entry("light snow", 2), entry("steady snow", 1), entry("cold rain", 1)]
            ),
            Late: buildPhaseData(
                ["patchy snow", "exposed stone and gravel", "runoff-softened earth", "dry open ground"],
                [entry("Chill", 3), entry("Mild", 2), entry("Cold", 2), entry("Thaw / Mild Thaw / Warm Break", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("wind", 2), entry("mist/fog", 1), entry("rain", 1), entry("light snow", 1), entry("thunderstorm", 1), entry("sleet", 1)]
            )
        },
        Summer: {
            Early: buildPhaseData(
                ["exposed stone and gravel", "runoff-softened earth", "fresh undergrowth", "patchy snow"],
                [entry("Chill", 3), entry("Mild", 3), entry("Warm", 1), entry("Cool Break", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("wind", 3), entry("mist/fog", 1), entry("rain", 1), entry("thunderstorm", 2), entry("light snow", 1), entry("heat haze", 1)]
            ),
            Mid: buildPhaseData(
                ["exposed stone and gravel", "dry open ground", "fresh undergrowth", "baked ground"],
                [entry("Mild", 3), entry("Warm", 2), entry("Chill", 1), entry("Hot", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("wind", 3), entry("thunderstorm", 2), entry("brief hard rain", 1), entry("heat haze", 1), entry("dry wind", 1)]
            ),
            Late: buildPhaseData(
                ["dry open ground", "exposed stone and gravel", "baked ground", "wind-stripped ground"],
                [entry("Mild", 2), entry("Warm", 2), entry("Dry Heat", 1), entry("Cool Break", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 1), entry("dry wind", 2), entry("thunderstorm", 1), entry("brief hard rain", 1), entry("heat haze", 1), entry("mist/fog", 1)]
            )
        },
        Autumn: {
            Early: buildPhaseData(
                ["exposed stone and gravel", "dry open ground", "fresh undergrowth", "wind-stripped ground"],
                [entry("Chill", 2), entry("Cold", 2), entry("Mild", 1), entry("Hard Cold", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("wind", 3), entry("mist/fog", 1), entry("cold rain", 1), entry("thunderstorm", 1), entry("sleet", 1), entry("first snow", 1)]
            ),
            Mid: buildPhaseData(
                ["exposed stone and gravel", "bare cold ground", "patchy snow", "wind-stripped ground"],
                [entry("Cold", 3), entry("Hard Cold", 2), entry("Thaw / Mild Thaw / Warm Break", 1), entry("Cold Snap", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("hard wind", 3), entry("mist/fog", 1), entry("sleet", 2), entry("cold rain", 1), entry("steady snow", 1), entry("freezing fog", 1)]
            ),
            Late: buildPhaseData(
                ["bare cold ground", "patchy snow", "hard frozen ground", "wind-stripped ground"],
                [entry("Hard Cold", 3), entry("Deep Cold", 2), entry("Cold Snap", 1), entry("Thaw / Mild Thaw / Warm Break", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("hard wind", 3), entry("sleet", 2), entry("light snow", 2), entry("steady snow", 1), entry("freezing fog", 1)]
            )
        },
        Winter: {
            Early: buildPhaseData(
                ["patchy snow", "hard frozen ground", "drifted snow", "crusted snow"],
                [entry("Deep Cold", 3), entry("Severe Cold", 2), entry("Bitter Freeze", 2), entry("Thaw / Mild Thaw / Warm Break", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("hard wind", 3), entry("light snow", 2), entry("steady snow", 2), entry("blowing snow", 2), entry("freezing fog", 1), entry("sleet", 1)]
            ),
            Mid: buildPhaseData(
                ["deep snow cover", "drifted snow", "hard frozen ground", "crusted snow"],
                [entry("Severe Cold", 3), entry("Bitter Freeze", 3), entry("Deep Cold", 2), entry("Thaw / Mild Thaw / Warm Break", 1)],
                [entry("clear/fair", 1), entry("cloud cover", 2), entry("hard wind", 3), entry("steady snow", 2), entry("blowing snow", 2), entry("blizzard", 2), entry("freezing fog", 1), entry("ice-crystal drift", 1)]
            ),
            Late: buildPhaseData(
                ["crusted snow", "deep snow cover", "drifted snow", "hard frozen ground", "patchy snow"],
                [entry("Deep Cold", 3), entry("Severe Cold", 2), entry("Bitter Freeze", 2), entry("Thaw / Mild Thaw / Warm Break", 1)],
                [entry("clear/fair", 1), entry("cloud cover", 2), entry("hard wind", 3), entry("light snow", 2), entry("steady snow", 2), entry("blowing snow", 2), entry("blizzard", 1), entry("freezing fog", 1)]
            )
        }
    }
});

const DESERT = profile({
    seasonType: "desert",
    seasons: {
        "Cool Season": {
            Early: buildPhaseData(
                ["dry open ground", "loose dust", "exposed stone and gravel", "wind-stripped ground"],
                [entry("Chill", 2), entry("Mild", 3), entry("Cold", 1), entry("Thaw / Mild Thaw / Warm Break", 1)],
                [entry("clear/fair", 3), entry("cloud cover", 1), entry("dry wind", 3), entry("mist/fog", 1), entry("brief rain", 1), entry("hard wind", 2), entry("thunderstorm", 1), entry("blowing dust", 2)]
            ),
            Mid: buildPhaseData(
                ["dry open ground", "loose dust", "exposed stone and gravel", "cracked hardpan"],
                [entry("Mild", 3), entry("Warm", 2), entry("Chill", 1), entry("Cold Snap", 1)],
                [entry("clear/fair", 3), entry("cloud cover", 1), entry("dry wind", 3), entry("brief rain", 1), entry("hard wind", 2), entry("thunderstorm", 1), entry("blowing dust", 2), entry("heat haze", 1)]
            ),
            Late: buildPhaseData(
                ["dry open ground", "loose dust", "cracked hardpan", "baked ground"],
                [entry("Warm", 3), entry("Hot", 2), entry("Chill", 1), entry("Heat Wave", 1)],
                [entry("clear/fair", 3), entry("cloud cover", 1), entry("dry wind", 3), entry("hard wind", 2), entry("blowing dust", 2), entry("brief hard rain", 1), entry("thunderstorm", 1), entry("heat haze", 2)]
            )
        },
        "Hot Season": {
            Early: buildPhaseData(
                ["loose dust", "cracked hardpan", "baked ground", "wind-stripped ground"],
                [entry("Warm", 2), entry("Hot", 3), entry("Dry Heat", 3), entry("Cool Break", 1)],
                [entry("clear/fair", 3), entry("cloud cover", 1), entry("dry wind", 3), entry("blowing dust", 2), entry("heat haze", 2), entry("hot still air", 2), entry("thunderstorm", 1), entry("brief hard rain", 1)]
            ),
            Mid: buildPhaseData(
                ["loose dust", "cracked hardpan", "baked ground", "open dust flats"],
                [entry("Hot", 3), entry("Heat Wave", 3), entry("Harsh Dry Heat", 3), entry("Dry Heat", 2)],
                [entry("clear/fair", 3), entry("dry wind", 3), entry("blowing dust", 2), entry("sand-lifting gusts", 2), entry("heat haze", 3), entry("hot still air", 2), entry("thunderstorm", 1), entry("brief hard rain", 1)]
            ),
            Late: buildPhaseData(
                ["open dust flats", "cracked hardpan", "baked ground", "wind-stripped ground"],
                [entry("Hot", 2), entry("Heat Wave", 3), entry("Harsh Dry Heat", 3), entry("Dry Heat", 2)],
                [entry("clear/fair", 3), entry("dry wind", 3), entry("blowing dust", 2), entry("sand-lifting gusts", 2), entry("heat haze", 3), entry("furnace still air", 2), entry("thunderstorm", 1), entry("dust wall", 1)]
            )
        }
    }
});

const TUNDRA = profile({
    seasonType: "temperate",
    seasons: {
        Spring: {
            Early: buildPhaseData(
                ["patchy snow", "hard frozen ground", "dark damp ground", "exposed stone and gravel"],
                [entry("Cold", 3), entry("Deep Cold", 3), entry("Thaw / Mild Thaw / Warm Break", 1), entry("Cold Snap", 2)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("hard wind", 3), entry("freezing fog", 1), entry("sleet", 1), entry("light snow", 2), entry("steady snow", 1)]
            ),
            Mid: buildPhaseData(
                ["patchy snow", "dark damp ground", "runoff-softened earth", "fresh undergrowth", "hard frozen ground"],
                [entry("Cold", 3), entry("Chill", 2), entry("Thaw / Mild Thaw / Warm Break", 1), entry("Cold Snap", 2)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("hard wind", 3), entry("mist/fog", 1), entry("sleet", 1), entry("light snow", 1), entry("steady snow", 1)]
            ),
            Late: buildPhaseData(
                ["fresh undergrowth", "runoff-softened earth", "dark damp ground", "dry open ground"],
                [entry("Chill", 3), entry("Mild", 2), entry("Cold", 2), entry("Cool Break", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("wind", 3), entry("mist/fog", 1), entry("drizzle", 1), entry("light rain", 1), entry("light snow", 1), entry("heat haze", 1)]
            )
        },
        Summer: {
            Early: buildPhaseData(
                ["fresh undergrowth", "dark damp ground", "dry open ground", "runoff-softened earth"],
                [entry("Chill", 3), entry("Mild", 3), entry("Warm", 1), entry("Cool Break", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("wind", 3), entry("mist/fog", 1), entry("light rain", 2), entry("steady rain", 1), entry("brief hard rain", 1), entry("freezing fog", 1)]
            ),
            Mid: buildPhaseData(
                ["fresh undergrowth", "dry open ground", "dark damp ground"],
                [entry("Mild", 3), entry("Chill", 2), entry("Warm", 1), entry("Cold Snap", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("wind", 3), entry("mist/fog", 1), entry("light rain", 2), entry("steady rain", 1), entry("heat haze", 1)]
            ),
            Late: buildPhaseData(
                ["dry open ground", "fresh undergrowth", "exposed stone and gravel", "dark damp ground"],
                [entry("Chill", 2), entry("Mild", 2), entry("Cold", 1), entry("Cool Break", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("wind", 3), entry("mist/fog", 1), entry("cold rain", 1), entry("heat haze", 1), entry("sleet", 1)]
            )
        },
        Autumn: {
            Early: buildPhaseData(
                ["dark damp ground", "fresh undergrowth", "frost-stiffened grass", "runoff-softened earth"],
                [entry("Cold", 2), entry("Hard Cold", 2), entry("Thaw / Mild Thaw / Warm Break", 1), entry("Cold Snap", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("hard wind", 3), entry("mist/fog", 1), entry("cold rain", 1), entry("sleet", 1), entry("first snow", 1), entry("freezing fog", 1)]
            ),
            Mid: buildPhaseData(
                ["frost-stiffened grass", "bare cold ground", "patchy snow", "hard frozen ground"],
                [entry("Hard Cold", 3), entry("Deep Cold", 2), entry("Cold Snap", 1), entry("Thaw / Mild Thaw / Warm Break", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("hard wind", 3), entry("sleet", 2), entry("light snow", 2), entry("steady snow", 1), entry("freezing fog", 1)]
            ),
            Late: buildPhaseData(
                ["patchy snow", "hard frozen ground", "bare cold ground", "crusted snow"],
                [entry("Deep Cold", 3), entry("Bitter Freeze", 2), entry("Severe Cold", 2), entry("Thaw / Mild Thaw / Warm Break", 1)],
                [entry("clear/fair", 1), entry("cloud cover", 2), entry("hard wind", 3), entry("light snow", 2), entry("steady snow", 2), entry("blowing snow", 1), entry("freezing fog", 1)]
            )
        },
        Winter: {
            Early: buildPhaseData(
                ["patchy snow", "hard frozen ground", "crusted snow", "drifted snow"],
                [entry("Deep Cold", 3), entry("Severe Cold", 2), entry("Bitter Freeze", 2), entry("Thaw / Mild Thaw / Warm Break", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("hard wind", 3), entry("light snow", 2), entry("steady snow", 2), entry("blowing snow", 2), entry("freezing fog", 1), entry("ice-crystal drift", 1)]
            ),
            Mid: buildPhaseData(
                ["deep snow cover", "drifted snow", "crusted snow", "hard frozen ground"],
                [entry("Severe Cold", 3), entry("Bitter Freeze", 3), entry("Deep Cold", 2), entry("Thaw / Mild Thaw / Warm Break", 1)],
                [entry("clear/fair", 1), entry("cloud cover", 2), entry("hard wind", 3), entry("steady snow", 2), entry("blowing snow", 2), entry("blizzard", 2), entry("freezing fog", 1), entry("ice-crystal drift", 1)]
            ),
            Late: buildPhaseData(
                ["crusted snow", "drifted snow", "patchy snow", "hard frozen ground"],
                [entry("Deep Cold", 3), entry("Severe Cold", 2), entry("Bitter Freeze", 2), entry("Thaw / Mild Thaw / Warm Break", 1)],
                [entry("clear/fair", 1), entry("cloud cover", 2), entry("hard wind", 3), entry("light snow", 2), entry("steady snow", 2), entry("blowing snow", 2), entry("blizzard", 1), entry("freezing fog", 1)]
            )
        }
    }
});

const TEMPERATE_COAST = profile({
    seasonType: "temperate",
    seasons: {
        Spring: {
            Early: buildPhaseData(
                ["wet sand", "slick tidal rock", "salt grass and dune growth", "dark damp ground"],
                [entry("Chill", 4), entry("Mild", 3), entry("Cold Snap", 2), entry("Thaw / Mild Thaw / Warm Break", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("sea mist", 2), entry("drizzle", 2), entry("rain", 2), entry("hard wind", 2), entry("sleet", 1), entry("cold squall", 1)]
            ),
            Mid: buildPhaseData(
                ["wet sand", "kelp-strewn strand", "salt grass and dune growth", "slick tidal rock"],
                [entry("Chill", 3), entry("Mild", 4), entry("Warm", 2), entry("Cold Snap", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("sea mist", 2), entry("drizzle", 2), entry("rain", 2), entry("hard wind", 2), entry("thunderstorm", 1), entry("sleet", 1)]
            ),
            Late: buildPhaseData(
                ["wet sand", "salt grass and dune growth", "slick tidal rock", "shell-strewn shore"],
                [entry("Mild", 4), entry("Warm", 3), entry("Hot", 1), entry("Cool Break", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("sea mist", 2), entry("drizzle", 1), entry("rain", 2), entry("wind", 2), entry("thunderstorm", 1), entry("warm still air", 1)]
            )
        },
        Summer: {
            Early: buildPhaseData(
                ["wet sand", "salt grass and dune growth", "shell-strewn shore", "slick tidal rock"],
                [entry("Mild", 2), entry("Warm", 4), entry("Hot", 2), entry("Cool Break", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("sea mist", 1), entry("light rain", 1), entry("steady rain", 1), entry("sea breeze", 3), entry("thunderstorm", 1), entry("humid haze", 1)]
            ),
            Mid: buildPhaseData(
                ["dry open ground", "salt grass and dune growth", "slick tidal rock", "wet sand"],
                [entry("Warm", 3), entry("Hot", 3), entry("Humid Heat", 2), entry("Cool Break", 2)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("sea breeze", 3), entry("humid haze", 2), entry("warm still air", 1), entry("brief hard rain", 1), entry("thunderstorm", 1), entry("heat haze", 1)]
            ),
            Late: buildPhaseData(
                ["dry open ground", "salt grass and dune growth", "slick tidal rock", "wet sand"],
                [entry("Warm", 3), entry("Hot", 3), entry("Humid Heat", 2), entry("Dry Heat", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("sea breeze", 3), entry("humid haze", 2), entry("hot still air", 1), entry("brief hard rain", 1), entry("thunderstorm", 1), entry("hard wind", 1)]
            )
        },
        Autumn: {
            Early: buildPhaseData(
                ["wet sand", "kelp-strewn strand", "salt grass and dune growth", "slick tidal rock"],
                [entry("Mild", 3), entry("Chill", 3), entry("Thaw / Mild Thaw / Warm Break", 1), entry("Cool Break", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("sea mist", 2), entry("drizzle", 2), entry("steady rain", 2), entry("hard wind", 2), entry("thunderstorm", 1), entry("humid haze", 1)]
            ),
            Mid: buildPhaseData(
                ["wet sand", "shell-strewn shore", "kelp-strewn strand", "slick tidal rock"],
                [entry("Chill", 3), entry("Cold", 3), entry("Mild", 1), entry("Hard Cold", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("sea mist", 2), entry("drizzle", 2), entry("steady rain", 2), entry("hard wind", 2), entry("sleet", 1), entry("cold squall", 1)]
            ),
            Late: buildPhaseData(
                ["wet sand", "kelp-strewn strand", "slick tidal rock", "bare cold ground"],
                [entry("Cold", 3), entry("Hard Cold", 3), entry("Thaw / Mild Thaw / Warm Break", 1), entry("Cold Snap", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("sea mist", 2), entry("drizzle", 2), entry("steady rain", 2), entry("hard wind", 2), entry("sleet", 1), entry("cold squall", 1)]
            )
        },
        Winter: {
            Early: buildPhaseData(
                ["wet sand", "hard frozen ground", "slick tidal rock", "patchy snow"],
                [entry("Cold", 3), entry("Deep Cold", 3), entry("Thaw / Mild Thaw / Warm Break", 1), entry("Bitter Freeze", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("freezing fog", 2), entry("sleet", 2), entry("cold rain", 2), entry("hard wind", 2), entry("light snow", 1), entry("cold squall", 1)]
            ),
            Mid: buildPhaseData(
                ["hard frozen ground", "slick tidal rock", "patchy snow", "crusted snow"],
                [entry("Deep Cold", 3), entry("Severe Cold", 3), entry("Bitter Freeze", 2), entry("Thaw / Mild Thaw / Warm Break", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("freezing fog", 2), entry("sleet", 2), entry("steady snow", 1), entry("hard wind", 2), entry("cold squall", 1), entry("light snow", 1)]
            ),
            Late: buildPhaseData(
                ["wet sand", "slush-softened ground", "patchy snow", "slick tidal rock"],
                [entry("Cold", 3), entry("Deep Cold", 3), entry("Thaw / Mild Thaw / Warm Break", 2), entry("Bitter Freeze", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 2), entry("freezing fog", 2), entry("sleet", 2), entry("cold rain", 2), entry("light snow", 1), entry("hard wind", 2), entry("thaw mist", 1)]
            )
        }
    }
});

const TROPICAL_COAST = profile({
    seasonType: "tropical",
    seasons: {
        "Wet Season": {
            Early: buildPhaseData(
                ["wet sand", "salt grass and dune growth", "dark standing water", "kelp-strewn strand"],
                [entry("Warm", 3), entry("Humid Heat", 3), entry("Hot", 2), entry("Heat Wave", 1)],
                [entry("clear/fair", 1), entry("cloud cover", 2), entry("sea mist", 1), entry("brief rain", 2), entry("steady rain", 2), entry("hard wind", 1), entry("thunderstorm", 2), entry("humid haze", 2)]
            ),
            Mid: buildPhaseData(
                ["wet sand", "dark standing water", "salt grass and dune growth", "slick tidal rock"],
                [entry("Warm", 2), entry("Humid Heat", 3), entry("Hot", 2), entry("Heat Wave", 1)],
                [entry("clear/fair", 1), entry("cloud cover", 2), entry("sea mist", 1), entry("steady rain", 2), entry("brief hard rain", 2), entry("thunderstorm", 2), entry("storm squall", 1), entry("humid haze", 2)]
            ),
            Late: buildPhaseData(
                ["wet sand", "dark standing water", "slick tidal rock", "fresh undergrowth"],
                [entry("Warm", 2), entry("Humid Heat", 3), entry("Heat Wave", 2), entry("Hot", 2)],
                [entry("clear/fair", 1), entry("cloud cover", 2), entry("sea mist", 1), entry("brief hard rain", 2), entry("thunderstorm", 2), entry("storm squall", 1), entry("humid haze", 2), entry("hot still air", 1)]
            )
        },
        "Dry Season": {
            Early: buildPhaseData(
                ["wet sand", "salt grass and dune growth", "fresh undergrowth", "slick tidal rock"],
                [entry("Warm", 3), entry("Hot", 2), entry("Cool Break", 1), entry("Dry Heat", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 1), entry("sea breeze", 3), entry("brief rain", 1), entry("thunderstorm", 1), entry("humid haze", 1), entry("warm still air", 1), entry("heat haze", 1)]
            ),
            Mid: buildPhaseData(
                ["dry open ground", "salt grass and dune growth", "slick tidal rock", "wet sand"],
                [entry("Hot", 3), entry("Humid Heat", 2), entry("Heat Wave", 2), entry("Dry Heat", 1)],
                [entry("clear/fair", 2), entry("cloud cover", 1), entry("sea breeze", 3), entry("hot still air", 1), entry("thunderstorm", 1), entry("humid haze", 1), entry("heat haze", 2), entry("brief hard rain", 1)]
            ),
            Late: buildPhaseData(
                ["dry open ground", "salt grass and dune growth", "dark standing water", "wet sand"],
                [entry("Hot", 3), entry("Heat Wave", 2), entry("Dry Heat", 1), entry("Humid Heat", 2)],
                [entry("clear/fair", 2), entry("cloud cover", 1), entry("sea breeze", 3), entry("hot still air", 1), entry("heat haze", 2), entry("hard wind", 1), entry("thunderstorm", 1), entry("brief hard rain", 1)]
            )
        }
    }
});

const TEMPERATE_SWAMP = profile({
    seasonType: "temperate",
    seasons: {
        Spring: {
            Early: buildPhaseData(
                ["soft black mud", "flooded low ground", "dark standing water", "root tangles and reeds", "hard frozen ground"],
                [entry("Chill", 4), entry("Mild", 3), entry("Cold Snap", 2), entry("Thaw / Mild Thaw / Warm Break", 1)],
                [entry("clear/fair", 1), entry("cloud cover", 2), entry("mist/fog", 3), entry("drizzle", 2), entry("rain", 2), entry("wind", 1), entry("sleet", 1), entry("cold rain", 1)]
            ),
            Mid: buildPhaseData(
                ["soft black mud", "flooded low ground", "dark standing water", "root tangles and reeds", "fresh undergrowth"],
                [entry("Chill", 3), entry("Mild", 4), entry("Warm", 2), entry("Cold Snap", 1)],
                [entry("clear/fair", 1), entry("cloud cover", 2), entry("mist/fog", 3), entry("drizzle", 2), entry("rain", 2), entry("thunderstorm", 1), entry("wind", 1), entry("sleet", 1)]
            ),
            Late: buildPhaseData(
                ["soft black mud", "shallow water", "dark standing water", "root tangles and reeds", "fresh undergrowth"],
                [entry("Mild", 4), entry("Warm", 3), entry("Hot", 1), entry("Cool Break", 1)],
                [entry("clear/fair", 1), entry("cloud cover", 2), entry("mist/fog", 3), entry("drizzle", 2), entry("rain", 2), entry("thunderstorm", 2), entry("warm still air", 1), entry("heat haze", 1)]
            )
        },
        Summer: {
            Early: buildPhaseData(
                ["soft black mud", "dark standing water", "root tangles and reeds", "fresh undergrowth"],
                [entry("Warm", 3), entry("Humid Heat", 2), entry("Hot", 2), entry("Cool Break", 1)],
                [entry("clear/fair", 1), entry("cloud cover", 2), entry("mist/fog", 2), entry("light rain", 2), entry("steady rain", 2), entry("thunderstorm", 2), entry("warm still air", 1), entry("humid haze", 1)]
            ),
            Mid: buildPhaseData(
                ["soft black mud", "stagnant pools", "dark standing water", "root tangles and reeds"],
                [entry("Warm", 2), entry("Humid Heat", 3), entry("Heat Wave", 2), entry("Hot", 2)],
                [entry("clear/fair", 1), entry("cloud cover", 2), entry("mist/fog", 2), entry("steady rain", 2), entry("thunderstorm", 2), entry("humid haze", 2), entry("stagnant still air", 1), entry("brief hard rain", 1)]
            ),
            Late: buildPhaseData(
                ["soft black mud", "stagnant pools", "dark standing water", "root tangles and reeds"],
                [entry("Warm", 2), entry("Humid Heat", 3), entry("Heat Wave", 2), entry("Hot", 2)],
                [entry("clear/fair", 1), entry("cloud cover", 2), entry("mist/fog", 2), entry("thunderstorm", 2), entry("stagnant still air", 2), entry("humid haze", 2), entry("brief hard rain", 1), entry("hot still air", 1)]
            )
        },
        Autumn: {
            Early: buildPhaseData(
                ["soft black mud", "dark standing water", "root tangles and reeds", "fresh undergrowth"],
                [entry("Mild", 3), entry("Chill", 3), entry("Thaw / Mild Thaw / Warm Break", 1), entry("Cool Break", 1)],
                [entry("clear/fair", 1), entry("cloud cover", 2), entry("mist/fog", 3), entry("drizzle", 2), entry("steady rain", 2), entry("thunderstorm", 1), entry("humid haze", 1), entry("wind", 1)]
            ),
            Mid: buildPhaseData(
                ["soft black mud", "dark standing water", "root tangles and reeds", "wet leaf litter"],
                [entry("Chill", 3), entry("Cold", 3), entry("Mild", 1), entry("Hard Cold", 1)],
                [entry("clear/fair", 1), entry("cloud cover", 2), entry("mist/fog", 2), entry("drizzle", 2), entry("steady rain", 2), entry("wind", 1), entry("sleet", 1), entry("cold rain", 1)]
            ),
            Late: buildPhaseData(
                ["soft black mud", "dark standing water", "root tangles and reeds", "hard frozen ground"],
                [entry("Cold", 3), entry("Hard Cold", 3), entry("Thaw / Mild Thaw / Warm Break", 1), entry("Cold Snap", 1)],
                [entry("clear/fair", 1), entry("cloud cover", 2), entry("fog", 3), entry("drizzle", 2), entry("steady rain", 2), entry("sleet", 1), entry("cold rain", 1), entry("hard wind", 1)]
            )
        },
        Winter: {
            Early: buildPhaseData(
                ["soft black mud", "dark standing water", "hard frozen ground", "patchy snow"],
                [entry("Cold", 3), entry("Deep Cold", 3), entry("Thaw / Mild Thaw / Warm Break", 1), entry("Bitter Freeze", 1)],
                [entry("clear/fair", 1), entry("cloud cover", 2), entry("freezing fog", 3), entry("sleet", 1), entry("cold rain", 2), entry("light snow", 1), entry("hard wind", 1)]
            ),
            Mid: buildPhaseData(
                ["hard frozen ground", "dark standing water", "patchy snow", "crusted snow"],
                [entry("Deep Cold", 3), entry("Severe Cold", 3), entry("Bitter Freeze", 2), entry("Thaw / Mild Thaw / Warm Break", 1)],
                [entry("clear/fair", 1), entry("cloud cover", 2), entry("freezing fog", 3), entry("light snow", 2), entry("steady snow", 1), entry("sleet", 1), entry("hard wind", 1), entry("stagnant still air", 1)]
            ),
            Late: buildPhaseData(
                ["soft black mud", "dark standing water", "slush-softened ground", "patchy snow"],
                [entry("Cold", 3), entry("Deep Cold", 3), entry("Thaw / Mild Thaw / Warm Break", 2), entry("Bitter Freeze", 1)],
                [entry("clear/fair", 1), entry("cloud cover", 2), entry("freezing fog", 3), entry("sleet", 1), entry("light snow", 1), entry("cold rain", 2), entry("thaw mist", 1), entry("hard wind", 1)]
            )
        }
    }
});

const TROPICAL_SWAMP = profile({
    seasonType: "tropical",
    seasons: {
        "Wet Season": {
            Early: buildPhaseData(
                ["soft black mud", "flooded low ground", "dark standing water", "root tangles and reeds"],
                [entry("Warm", 3), entry("Humid Heat", 3), entry("Hot", 2), entry("Heat Wave", 1)],
                [entry("cloud cover", 2), entry("mist/fog", 2), entry("brief rain", 1), entry("steady rain", 2), entry("brief hard rain", 2), entry("thunderstorm", 2), entry("storm squall", 1), entry("humid haze", 2)]
            ),
            Mid: buildPhaseData(
                ["soft black mud", "flooded low ground", "dark standing water", "root tangles and reeds"],
                [entry("Warm", 2), entry("Humid Heat", 3), entry("Hot", 2), entry("Heat Wave", 1)],
                [entry("cloud cover", 2), entry("mist/fog", 2), entry("steady rain", 2), entry("brief hard rain", 2), entry("thunderstorm", 2), entry("storm squall", 1), entry("humid haze", 2), entry("hot still air", 1)]
            ),
            Late: buildPhaseData(
                ["soft black mud", "stagnant pools", "dark standing water", "root tangles and reeds"],
                [entry("Warm", 2), entry("Humid Heat", 3), entry("Heat Wave", 2), entry("Hot", 2)],
                [entry("cloud cover", 2), entry("mist/fog", 2), entry("brief hard rain", 2), entry("thunderstorm", 2), entry("storm squall", 1), entry("humid haze", 2), entry("hot still air", 1), entry("clear/fair", 1)]
            )
        },
        "Dry Season": {
            Early: buildPhaseData(
                ["soft black mud", "dark standing water", "root tangles and reeds", "fresh undergrowth"],
                [entry("Warm", 3), entry("Humid Heat", 2), entry("Hot", 2), entry("Cool Break", 1)],
                [entry("clear/fair", 1), entry("cloud cover", 2), entry("mist/fog", 2), entry("brief rain", 1), entry("thunderstorm", 2), entry("humid haze", 2), entry("warm still air", 1), entry("stagnant still air", 1)]
            ),
            Mid: buildPhaseData(
                ["soft black mud", "stagnant pools", "dark standing water", "root tangles and reeds"],
                [entry("Warm", 2), entry("Humid Heat", 3), entry("Hot", 2), entry("Heat Wave", 1)],
                [entry("clear/fair", 1), entry("cloud cover", 2), entry("mist/fog", 1), entry("stagnant still air", 2), entry("humid haze", 2), entry("thunderstorm", 2), entry("brief hard rain", 1), entry("heat haze", 1)]
            ),
            Late: buildPhaseData(
                ["soft black mud", "stagnant pools", "dark standing water", "root tangles and reeds"],
                [entry("Hot", 2), entry("Humid Heat", 3), entry("Heat Wave", 2), entry("Harsh Dry Heat", 1)],
                [entry("clear/fair", 1), entry("mist/fog", 1), entry("stagnant still air", 2), entry("humid haze", 2), entry("hot still air", 1), entry("thunderstorm", 2), entry("brief hard rain", 1), entry("heat haze", 1)]
            )
        }
    }
});

export const WEATHER_BIOMES = {
    Forest: FOREST,
    Plains: PLAINS,
    Hills: HILLS,
    Mountains: MOUNTAINS,
    Desert: DESERT,
    Tundra: TUNDRA,
    "Urban Fringe": URBAN_FRINGE,
    "Temperate Coast": TEMPERATE_COAST,
    "Tropical Coast": TROPICAL_COAST,
    "Temperate Swamp": TEMPERATE_SWAMP,
    "Tropical Swamp": TROPICAL_SWAMP
};

export function getBiomeProfile(biome) {
    return WEATHER_BIOMES[biome] ?? WEATHER_BIOMES.Forest;
}

export function getPhaseData(biome, season, phase) {
    const profileData = getBiomeProfile(biome);
    const seasonData = profileData.seasons[season];
    if (!seasonData) return null;
    return seasonData[phase] ?? null;
}

export function getAvailableSeasonsForBiome(biome) {
    return Object.keys(getBiomeProfile(biome).seasons);
}

export function getLockRange(biome, kind, state) {
    const profileData = getBiomeProfile(biome);
    const bucket = profileData.locks[kind] ?? {};
    return bucket[state] ?? bucket.default ?? [1, 1];
}

export function getInitialGroundState(biome, season, phase) {
    const phaseData = getPhaseData(biome, season, phase);
    return phaseData?.groundStates?.[0] ?? "dry open ground";
}

export function biomeSupportsSeason(biome, season) {
    return !!getBiomeProfile(biome).seasons[season];
}

export function getSeasonTypeForBiome(biome) {
    return getBiomeProfile(biome).seasonType;
}

export function makePhaseKey(season, phase) {
    return toKey(season, phase);
}
