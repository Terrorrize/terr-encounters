import { openWeatherPanel } from "./weather/weather-ui.js";

const MODULE_ID = "terr-encounters";
const LAUNCHER_ID = "terr-encounters-launcher";

function removeLauncher() {
    const existing = document.getElementById(LAUNCHER_ID);
    if (existing) existing.remove();
}

function positionLauncher(launcher) {
    if (!launcher) return;

    const controls = document.getElementById("controls");
    if (!controls) {
        launcher.style.left = "12px";
        launcher.style.top = "12px";
        return;
    }

    const rect = controls.getBoundingClientRect();
    launcher.style.left = `${Math.round(rect.left)}px`;
    launcher.style.top = `${Math.round(rect.bottom + 6)}px`;
}

function createLauncher() {
    if (!game.user?.isGM) {
        removeLauncher();
        return;
    }

    if (!document.body) return;

    let launcher = document.getElementById(LAUNCHER_ID);
    if (!launcher) {
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
    }

    positionLauncher(launcher);
    return launcher;
}

function refreshLauncher() {
    if (!game.user?.isGM) {
        removeLauncher();
        return;
    }

    createLauncher();
}

Hooks.once("init", () => {
    console.log(`${MODULE_ID} | init`);
});

Hooks.once("ready", () => {
    game.terrEncounters ??= {};
    game.terrEncounters.openWeather = openWeatherPanel;

    refreshLauncher();

    window.setTimeout(refreshLauncher, 100);
    window.setTimeout(refreshLauncher, 400);
    window.setTimeout(refreshLauncher, 1000);

    window.addEventListener("resize", refreshLauncher);
});

Hooks.on("canvasReady", refreshLauncher);
Hooks.on("renderSceneNavigation", refreshLauncher);
Hooks.on("renderSidebar", refreshLauncher);
Hooks.on("renderPlayerList", refreshLauncher);
Hooks.on("renderHotbar", refreshLauncher);
Hooks.on("collapseSidebar", refreshLauncher);