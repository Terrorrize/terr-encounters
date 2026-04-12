export const TEMPERATURE_OPENERS = {
    mild: "The air is",
    warm: "The air is",
    hot: "The heat is",
    humid: "The heat is",
    dry: "The heat is",
    cold: "The cold is",
    thaw: "The air has begun",
    shift: "The air has turned"
};

export const TEMPERATURE_FEELS = {
    "Mild": ["mild and damp", "mild with a soft edge", "gentle and easy on the skin"],
    "Warm": ["warm and open", "warm without turning harsh", "settled into a steady warmth"],
    "Hot": ["hot and pressing", "firmly hot without much relief", "strong heat across the day"],
    "Heat Wave": ["relentless and hard", "brutally hot without relief", "locked in a lasting heat"],
    "Humid Heat": ["heavy, wet, and close", "thick with heat and moisture", "damp heat that does not lift"],
    "Dry Heat": ["hot, dry, and relentless", "sharp with hard, dry heat", "hot and emptied of moisture"],
    "Harsh Dry Heat": ["hard, dry, and punishing", "brutal with no softness in the air", "burning and dry across the day"],
    "Chill": ["cool with a lingering edge", "still touched by cold", "marked by a lingering chill"],
    "Cold": ["cold and steady", "plain cold without easing much", "set in a lasting cold"],
    "Cold Snap": ["hard and suddenly colder", "snapped into a harder cold", "caught in a brief hard freeze"],
    "Hard Cold": ["hard and biting", "cold with a sharper edge", "cold that grips the open ground"],
    "Deep Cold": ["deep and settled", "cold that feels fixed in the land", "held in a solid cold"],
    "Bitter Freeze": ["bitter and cutting", "set in a bitter freeze", "frozen into a bitter stillness"],
    "Severe Cold": ["severe and unyielding", "locked in a severe freeze", "cold with no easy break in it"],
    "Thaw / Mild Thaw / Warm Break": ["softening after the cold", "eased by a brief thaw", "beginning to soften after the freeze"],
    "Cool Break": ["cooler than the days around it", "eased by a brief cooler spell", "broken by a short cool turn"]
};

export const TEMPERATURE_TONES = {
    "Mild": "mild",
    "Warm": "warm",
    "Hot": "hot",
    "Heat Wave": "hot",
    "Humid Heat": "humid",
    "Dry Heat": "dry",
    "Harsh Dry Heat": "dry",
    "Chill": "cold",
    "Cold": "cold",
    "Cold Snap": "cold",
    "Hard Cold": "cold",
    "Deep Cold": "cold",
    "Bitter Freeze": "cold",
    "Severe Cold": "cold",
    "Thaw / Mild Thaw / Warm Break": "thaw",
    "Cool Break": "shift"
};

export const WEATHER_COMPATIBILITY = {
    "Heat Wave": {
        favor: ["clear/fair", "heat haze", "humid haze", "warm still air", "hot still air", "stagnant still air", "hot wet calm", "furnace still air"],
        suppress: ["freezing fog", "late snow", "light snow", "steady snow", "blizzard", "sleet", "first snow", "first sleet"]
    },
    "Humid Heat": {
        favor: ["humid haze", "warm still air", "morning mist", "mist/fog", "brief hard rain", "thunderstorm", "steady rain"],
        suppress: ["freezing fog", "light snow", "steady snow", "sleet"]
    },
    "Dry Heat": {
        favor: ["clear/fair", "heat haze", "dry wind", "blowing dust", "dust-lifting gusts", "sand-lifting gusts"],
        suppress: ["freezing fog", "sea mist", "steady snow", "light snow", "sleet"]
    },
    "Harsh Dry Heat": {
        favor: ["clear/fair", "heat haze", "dry wind", "blowing dust", "dust-lifting gusts", "sand-lifting gusts", "dust wall"],
        suppress: ["freezing fog", "mist/fog", "steady rain", "steady snow", "light snow", "sleet"]
    },
    "Chill": {
        favor: ["cloud cover", "mist/fog", "drizzle", "rain", "wind", "fog", "cold rain"],
        suppress: ["heat haze", "hot still air", "furnace still air"]
    },
    "Cold": {
        favor: ["cloud cover", "mist/fog", "fog", "freezing fog", "light snow", "steady snow", "hard wind", "cold rain"],
        suppress: ["heat haze", "humid haze", "hot still air"]
    },
    "Cold Snap": {
        favor: ["freezing fog", "light snow", "steady snow", "sleet", "hard wind", "cold squall", "blowing snow"],
        suppress: ["heat haze", "humid haze", "warm still air", "hot still air", "brief rain"]
    },
    "Hard Cold": {
        favor: ["freezing fog", "light snow", "steady snow", "sleet", "hard wind", "blowing snow"],
        suppress: ["warm still air", "humid haze", "heat haze"]
    },
    "Deep Cold": {
        favor: ["freezing fog", "light snow", "steady snow", "blowing snow", "hard wind"],
        suppress: ["brief rain", "warm still air", "humid haze", "heat haze"]
    },
    "Bitter Freeze": {
        favor: ["freezing fog", "steady snow", "blowing snow", "blizzard", "hard wind", "ice-crystal drift"],
        suppress: ["brief rain", "warm still air", "humid haze", "heat haze", "drizzle"]
    },
    "Severe Cold": {
        favor: ["freezing fog", "steady snow", "blowing snow", "blizzard", "hard wind", "ice-crystal drift"],
        suppress: ["brief rain", "warm still air", "humid haze", "heat haze", "drizzle"]
    },
    "Thaw / Mild Thaw / Warm Break": {
        favor: ["mist/fog", "thaw mist", "cold rain", "drizzle", "rain", "cloud cover"],
        suppress: ["blizzard", "ice-crystal drift", "dust wall"]
    },
    "Cool Break": {
        favor: ["cloud cover", "mist/fog", "wind", "sea breeze", "drizzle"],
        suppress: ["heat haze", "furnace still air"]
    }
};
