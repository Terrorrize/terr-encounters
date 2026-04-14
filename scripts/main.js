/**
 * terr-encounters v0.0.1-fix1
 * Function: module bootstrap entry. Registers the weather system during init,
 * runs ready hooks, and lets the weather system inject its launcher button.
 */

import { registerWeatherSystem } from "./systems/weather/weather-init.js";

const MODULE_ID = "terr-encounters";

function getModuleApi() {
    if (!globalThis.TerrEncounters) {
        globalThis.TerrEncounters = {
            id: MODULE_ID,
            version: "0.0.1-fix1",
            systems: {},
            ui: {},
            api: {}
        };
    }

    return globalThis.TerrEncounters;
}

Hooks.once("init", async () => {
    const terr = getModuleApi();

    console.log(`${MODULE_ID} | init v${terr.version}`);

    registerWeatherSystem(terr);

    if (terr.systems.weather?.onInit) {
        await terr.systems.weather.onInit();
    }
});

Hooks.once("ready", async () => {
    const terr = getModuleApi();

    console.log(`${MODULE_ID} | ready`);

    if (terr.systems.weather?.onReady) {
        await terr.systems.weather.onReady();
    }
});

Hooks.on("renderSidebarTab", (app, html) => {
    const terr = getModuleApi();
    const weatherSystem = terr.systems.weather;

    if (!weatherSystem?.injectLauncherButton) return;
    weatherSystem.injectLauncherButton(app, html);
});