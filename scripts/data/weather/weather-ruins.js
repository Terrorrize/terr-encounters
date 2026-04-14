/**
 * terr-encounters v0.1.0-b3
 * Function: holds optional ruins-facing weather flavor hooks. These are
 * descriptive modifiers only and do not alter the core weather math yet.
 */

export const WEATHER_RUINS_VERSION = "0.1.0-b3";

export const WEATHER_RUINS = {
    wetness: {
        2: ["Old stone darkens with damp patches."],
        3: ["Water beads on old stone and gathers in cracks."],
        4: ["Ruined floors are slick with damp grime."],
        5: ["Ruins drip steadily from soaked stone and broken ceilings."]
    },
    mud: {
        2: ["Entryways and collapsed paths are turning muddy."],
        3: ["Mud churns through broken corridors and low approaches."],
        4: ["Ruined approaches are thick with clinging mud."],
        5: ["Deep mud pools around collapsed masonry and low passages."]
    },
    standingWater: {
        2: ["Shallow runoff gathers in broken stone depressions."],
        3: ["Pools collect in cracked chambers and collapsed floors."],
        4: ["Standing water fills low ruin sections."],
        5: ["Flooded pockets dominate the lowest parts of the ruins."]
    },
    snowCover: {
        1: ["Snow dusts exposed stone and broken walls."],
        2: ["Snow lingers across exposed ruin surfaces."],
        3: ["Snow drifts gather against broken masonry."],
        4: ["Deep snow presses into open ruin courtyards and breaches."],
        5: ["Heavy snowpack buries much of the exposed ruin detail."]
    },
    dryness: {
        2: ["Old mortar looks dry and brittle."],
        3: ["Dry wind strips loose grit across the stone."],
        4: ["The ruins feel baked dry and brittle."],
        5: ["The ruin stones feel parched, cracked, and dust-choked."]
    }
};

export function getRuinsDescriptorLines(matrix = {}) {
    const lines = [];

    for (const key of ["wetness", "mud", "standingWater", "snowCover", "dryness"]) {
        const level = Number(matrix[key] ?? 0);
        const bucket = WEATHER_RUINS[key];
        if (!bucket) continue;

        const entries = bucket[level];
        if (Array.isArray(entries)) {
            lines.push(...entries);
        }
    }

    return lines;
}