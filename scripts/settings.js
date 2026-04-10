export function registerEncounterSettings() {
    const keys = ["season", "biome", "partySize", "levelMin", "levelMax", "difficulty"];

    for (const k of keys) {
        game.settings.register("terr-encounters", k, {
            name: k,
            scope: "world",
            config: false,
            type: String,
            default: ""
        });
    }
}