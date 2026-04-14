import { BIOME_DEFAULT_RUIN_FAMILIES, RUIN_FAMILIES, RUIN_FREQUENCY_WEIGHTS } from "../data/weather-ruins-data.js";
import { buildWeightedArrayFromMap, chooseOne, weightedPick } from "./weather-utils.js";

export class WeatherRuins {
    static resolve(environment) {
        if (!environment.addRuins) {
            return { ruinModifier: null, ruinFamily: null, ruinDetail: null };
        }

        const weights = RUIN_FREQUENCY_WEIGHTS[environment.ruinFrequency] ?? RUIN_FREQUENCY_WEIGHTS.mixed;
        const ruinModifier = weightedPick(
            Object.entries(weights).map(([value, weight]) => ({ value, weight }))
        );

        if (!ruinModifier || ruinModifier === "none") {
            return { ruinModifier: null, ruinFamily: null, ruinDetail: null };
        }

        let ruinFamily = null;
        if (environment.ruinStyleMode === "manual" && environment.manualRuinFamily && RUIN_FAMILIES[environment.manualRuinFamily]) {
            ruinFamily = environment.manualRuinFamily;
        } else {
            const allowed = BIOME_DEFAULT_RUIN_FAMILIES[environment.biome] ?? [];
            ruinFamily = chooseOne(allowed) ?? null;
        }

        const ruinDetail = ruinFamily ? chooseOne(RUIN_FAMILIES[ruinFamily] ?? []) : null;

        return {
            ruinModifier,
            ruinFamily,
            ruinDetail
        };
    }
}
