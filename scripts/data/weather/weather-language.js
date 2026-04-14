/**
 * terr-encounters v0.1.0-b3
 * Function: central wording tables for condition lines, precipitation,
 * temperature motion, wind phrasing, cloud faces, and wording matrix descriptors.
 */

export const WEATHER_LANGUAGE_VERSION = "0.1.0-b3";

export const WEATHER_LANGUAGE = {
    conditionLabels: {
        clear: "Clear",
        overcast: "Overcast",
        foggy: "Foggy",
        rainy: "Rainy",
        snowy: "Snowy",
        warm: "Warm",
        hot: "Hot",
        cold: "Cold",
        windy: "Windy"
    },

    tempBandLabels: {
        freezing: "Freezing",
        cold: "Cold",
        cool: "Cool",
        mild: "Mild",
        warm: "Warm",
        hot: "Hot",
        severe_heat: "Severe Heat"
    },

    precipTypeLabels: {
        none: "No precipitation",
        rain: "rain",
        snow: "snow",
        sleet: "sleet"
    },

    precipIntensityLabels: {
        none: "No",
        light: "Light",
        moderate: "Moderate",
        hard: "Hard",
        severe: "Severe"
    },

    precipPatternLabels: {
        sporadic: "sporadic",
        frequent: "frequent",
        constant: "constant"
    },

    windIntensityLabels: {
        calm: "Calm",
        light: "Light",
        moderate: "Moderate",
        strong: "Strong",
        severe: "Severe"
    },

    windPatternLabels: {
        sporadic: "sporadic",
        frequent: "frequent",
        constant: "constant"
    },

    cloudFaces: {
        bright: "Bright skies",
        mixed: "Broken cloud cover",
        grey: "Grey cloud cover",
        low: "Low hanging cloud",
        storm: "Storm front building"
    },

    matrixDescriptors: {
        wetness: {
            0: "",
            1: "The ground is lightly damp.",
            2: "The ground is damp underfoot.",
            3: "The ground is wet and slick in places.",
            4: "The ground is heavily soaked.",
            5: "The ground is saturated."
        },
        mud: {
            0: "",
            1: "Light mud clings to boots.",
            2: "Mud is building in softer ground.",
            3: "Mud is thick in common footpaths.",
            4: "Heavy mud slows footing.",
            5: "Deep mud dominates the ground."
        },
        standingWater: {
            0: "",
            1: "Small puddles collect in dips.",
            2: "Puddles are common.",
            3: "Standing water spreads across low ground.",
            4: "Pools of water linger broadly.",
            5: "Low ground is waterlogged."
        },
        snowCover: {
            0: "",
            1: "A light dusting of snow remains.",
            2: "Snow cover is visible across the ground.",
            3: "Snow cover is building steadily.",
            4: "Deep snow covers most surfaces.",
            5: "Heavy snowpack defines the landscape."
        },
        dryness: {
            0: "",
            1: "The air and ground are starting to dry.",
            2: "Conditions feel notably dry.",
            3: "The ground is dry and firming up.",
            4: "Dry conditions dominate the area.",
            5: "The area feels parched."
        }
    }
};

export function getConditionLine(condition, tempBand) {
    const conditionLabel = WEATHER_LANGUAGE.conditionLabels[condition] ?? "Unsettled";
    const tempLabel = WEATHER_LANGUAGE.tempBandLabels[tempBand] ?? "Mild";

    if (condition === "clear" || condition === "overcast" || condition === "foggy" || condition === "windy") {
        return `${conditionLabel} and ${tempLabel}`;
    }

    if (condition === "warm" || condition === "hot" || condition === "cold") {
        return `${conditionLabel} conditions`;
    }

    return `${conditionLabel} and ${tempLabel}`;
}

export function getPrecipLine(precipType, precipIntensity, precipPattern) {
    if (precipType === "none" || precipIntensity === "none") {
        return "No precipitation";
    }

    const intensity = WEATHER_LANGUAGE.precipIntensityLabels[precipIntensity] ?? "Moderate";
    const pattern = WEATHER_LANGUAGE.precipPatternLabels[precipPattern] ?? "sporadic";
    const type = WEATHER_LANGUAGE.precipTypeLabels[precipType] ?? "rain";

    return `${intensity} ${pattern} ${type}`;
}

export function getTempMotionLine(tempMotion, tempMotionStrength) {
    if (tempMotion === "holding") {
        return "Temperature holding";
    }

    const strengthWord = {
        slight: "slightly",
        steady: "steadily",
        sharp: "sharply"
    }[tempMotionStrength] ?? "steadily";

    const directionWord = tempMotion === "rising" ? "rising" : "dropping";
    return `Temperature ${strengthWord} ${directionWord}`;
}

export function getWindLine(windIntensity, windPattern) {
    if (windIntensity === "calm") {
        return "Calm air";
    }

    const intensity = WEATHER_LANGUAGE.windIntensityLabels[windIntensity] ?? "Light";
    const pattern = WEATHER_LANGUAGE.windPatternLabels[windPattern] ?? "sporadic";

    return `${intensity} ${pattern} winds`;
}

export function getCloudFaceLabel(cloudFace) {
    return WEATHER_LANGUAGE.cloudFaces[cloudFace] ?? WEATHER_LANGUAGE.cloudFaces.mixed;
}

export function getMatrixDescriptorLines(matrix = {}) {
    const lines = [];

    for (const key of ["wetness", "mud", "standingWater", "snowCover", "dryness"]) {
        const level = Number(matrix[key] ?? 0);
        const entry = WEATHER_LANGUAGE.matrixDescriptors[key]?.[level] ?? "";
        if (entry) {
            lines.push(entry);
        }
    }

    return lines;
}