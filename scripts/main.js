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

    if (!document.body) return;

    let launcher = document.getElementById(LAUNCHER_ID);
    if (launcher) return launcher;

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

    document.body.appendChild(launcher);
    return launcher;
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

    window.setTimeout(refreshLauncher, 250);
    window.setTimeout(refreshLauncher, 1000);
});

Hooks.on("canvasReady", refreshLauncher);
Hooks.on("renderSceneNavigation", refreshLauncher);
Hooks.on("renderSidebar", refreshLauncher);
Hooks.on("renderPlayerList", refreshLauncher);
Hooks.on("renderHotbar", refreshLauncher);