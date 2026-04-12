import { MODULE_ID, registerWeatherSettings } from "./weather-settings.js";
import { WeatherState } from "./weather-state.js";
import { WeatherController } from "./weather-controller.js";
import { WeatherPanelApp, openWeatherPanel } from "./weather-ui.js";

Hooks.once("init", () => {
    Handlebars.registerHelper("eq", (a, b) => a === b);
    registerWeatherSettings();
});

Hooks.once("ready", async () => {
    if (!game.user?.isGM) return;

    await WeatherState.ensureCurrentDayRecord();

    globalThis[MODULE_ID] ??= {};
    globalThis[MODULE_ID].weather = {
        controller: WeatherController,
        panelClass: WeatherPanelApp,
        openPanel: () => openWeatherPanel(),
        getCurrentDay: () => WeatherController.getCurrentDay(),
        advanceDay: () => WeatherController.advanceDay(),
        rebuildCurrentDay: () => WeatherController.rebuildCurrentDay()
    };

    console.log(`${MODULE_ID} | Weather system ready`);
});