import { openWeatherPanel } from "./weather/weather-ui.js";

const MODULE_ID = "terr-encounters";
const TOOL_NAME = `${MODULE_ID}-open-weather`;
const TOOL_ICON_CLASS = "terr-encounters-tool-icon";

function registerSceneControl(controls) {
    if (!game.user?.isGM) return;

    const tokenControls = controls.find((control) => control.name === "token");
    if (!tokenControls) return;

    tokenControls.tools ??= [];

    const tool = {
        name: TOOL_NAME,
        title: "Terr Encounters",
        icon: TOOL_ICON_CLASS,
        order: 3,
        button: true,
        visible: true,
        onChange: async () => {
            await openWeatherPanel();
        }
    };

    const existingIndex = tokenControls.tools.findIndex((entry) => entry.name === TOOL_NAME);
    if (existingIndex >= 0) {
        tokenControls.tools[existingIndex] = tool;
    } else {
        tokenControls.tools.push(tool);
    }
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