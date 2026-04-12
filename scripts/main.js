import { openWeatherPanel } from "./weather/weather-ui.js";

const MODULE_ID = "terr-encounters";
const TOOL_NAME = `${MODULE_ID}-open-weather`;

function registerSceneControl(controls) {
    if (!game.user?.isGM) return;
    if (!Array.isArray(controls)) return;

    let tokenControls = controls.find(control => control.name === "token");
    if (!tokenControls) {
        tokenControls = {
            name: "token",
            title: "Token Controls",
            tools: [],
            activeTool: "select"
        };
        controls.push(tokenControls);
    }

    tokenControls.tools ??= [];

    const tool = {
        name: TOOL_NAME,
        title: "Terr Encounters",
        icon: "fa-solid fa-t",
        button: true,
        visible: true,
        onClick: async () => {
            await openWeatherPanel();
        }
    };

    const existingIndex = tokenControls.tools.findIndex(entry => entry.name === TOOL_NAME);
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