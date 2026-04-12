import { openWeatherPanel } from "./weather/weather-ui.js";

const MODULE_ID = "terr-encounters";
const TOOL_NAME = `${MODULE_ID}-open-weather`;

function registerLauncher(controls) {
    if (!game.user?.isGM) return;
    if (!controls?.tokens?.tools) return;
    if (controls.tokens.tools[TOOL_NAME]) return;

    controls.tokens.tools[TOOL_NAME] = {
        name: TOOL_NAME,
        title: "Terr Encounters",
        icon: "terr-encounters-tool-icon",
        order: Object.keys(controls.tokens.tools).length,
        button: true,
        visible: true,
        onChange: async () => {
            await openWeatherPanel();
        }
    };
}

Hooks.once("init", () => {
    console.log(`${MODULE_ID} | init`);
});

Hooks.once("ready", () => {
    game.terrEncounters ??= {};
    game.terrEncounters.openWeather = openWeatherPanel;
});

Hooks.on("getSceneControlButtons", (controls) => {
    registerLauncher(controls);
});