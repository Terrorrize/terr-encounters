import { openWeatherPanel } from "./weather/weather-ui.js";

const MODULE_ID = "terr-encounters";
const LAUNCHER_ID = "terr-encounters-launcher";

function removeLauncher() {
    const existing = document.getElementById(LAUNCHER_ID);
    if (existing) existing.remove();
}

function createLauncher() {
    if (!game.user?.isGM) {
        removeLauncher();
        return;
    }

    const uiLeft = document.getElementById("ui-left");
    if (!uiLeft) return;

    let launcher = document.getElementById(LAUNCHER_ID);
    if (launcher) return;

    launcher = document.createElement("button");
    launcher.id = LAUNCHER_ID;
    launcher.type = "button";
    launcher.title = "Terr Encounters";
    launcher.setAttribute("aria-label", "Terr Encounters");
    launcher.textContent = "T";

    launcher.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        await openWeatherPanel();
    });

    uiLeft.appendChild(launcher);
}

function refreshLauncher() {
    removeLauncher();
    createLauncher();
}

Hooks.once("init", () => {
    console.log(`${MODULE_ID} | init`);
});

Hooks.once("ready", () => {
    game.terrEncounters ??= {};
    game.terrEncounters.openWeather = openWeatherPanel;
    refreshLauncher();
});

Hooks.on("canvasReady", () => {
    createLauncher();
});

Hooks.on("renderSceneNavigation", () => {
    createLauncher();
});

Hooks.on("renderSidebar", () => {
    createLauncher();
});