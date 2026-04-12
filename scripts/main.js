import { openWeatherPanel } from "./weather/weather-ui.js";

const MODULE_ID = "terr-encounters";

function registerSceneControl(controls) {
    if (!game.user?.isGM) return;
    if (!Array.isArray(controls)) return;

    let tokenTools = controls.find(control => control.name === "token");
    if (!tokenTools) {
        tokenTools = {
            name: "token",
            title: "Token Controls",
            tools: []
        };
        controls.push(tokenTools);
    }

    tokenTools.tools ??= [];

    const existingIndex = tokenTools.tools.findIndex(tool => tool.name === `${MODULE_ID}-weather`);
    const toolDef = {
        name: `${MODULE_ID}-weather`,
        title: "Terr Encounters",
        icon: "fas fa-cloud-sun",
        button: true,
        visible: true,
        onClick: () => openWeatherPanel()
    };

    if (existingIndex >= 0) {
        tokenTools.tools[existingIndex] = toolDef;
    } else {
        tokenTools.tools.push(toolDef);
    }
}

Hooks.once("init", () => {
    console.log("Terr Encounters | Main init");
});

Hooks.once("ready", () => {
    game.terrEncounters ??= {};
    game.terrEncounters.open = () => openWeatherPanel();
});

Hooks.on("getSceneControlButtons", (controls) => {
    registerSceneControl(controls);
});