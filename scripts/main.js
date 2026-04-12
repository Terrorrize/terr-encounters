import { openWeatherPanel } from "./weather/weather-ui.js";

const MODULE_ID = "terr-encounters";
const TOOL_NAME = `${MODULE_ID}-open-weather`;

function registerSceneControl(controls) {
    if (!game.user?.isGM) return;
    if (!controls?.tokens?.tools) return;

    controls.tokens.tools[TOOL_NAME] = {
        name: TOOL_NAME,
        title: "Terr Encounters",
        icon: "fas fa-square",
        order: 999,
        button: true,
        visible: true,
        onChange: async () => {
            await openWeatherPanel();
        }
    };
}

Hooks.once("init", () => {
    console.log(`${MODULE_ID} | Main init`);
});

Hooks.once("ready", () => {
    game.terrEncounters ??= {};
    game.terrEncounters.openWeather = () => openWeatherPanel();
});

Hooks.on("getSceneControlButtons", (controls) => {
    registerSceneControl(controls);
});