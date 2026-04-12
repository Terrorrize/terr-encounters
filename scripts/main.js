import { openWeatherPanel } from "./weather/weather-ui.js";

const MODULE_ID = "terr-encounters";
const BUTTON_ID = "terr-encounters-launcher";

function ensureLauncher() {
    if (!game.user?.isGM) {
        document.getElementById(BUTTON_ID)?.remove();
        return;
    }

    const controls = document.getElementById("controls");
    if (!controls) return;

    let button = document.getElementById(BUTTON_ID);
    if (button) return;

    button = document.createElement("li");
    button.id = BUTTON_ID;
    button.className = "scene-control";
    button.dataset.tooltip = "Terr Encounters";
    button.setAttribute("aria-label", "Terr Encounters");
    button.innerHTML = `<i class="terr-encounters-launcher-icon">T</i>`;

    button.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        await openWeatherPanel();
    });

    controls.appendChild(button);
}

function refreshLauncher() {
    document.getElementById(BUTTON_ID)?.remove();
    ensureLauncher();
}

Hooks.once("init", () => {
    console.log(`${MODULE_ID} | Main init`);
});

Hooks.once("ready", () => {
    game.terrEncounters ??= {};
    game.terrEncounters.openWeather = () => openWeatherPanel();
    ensureLauncher();
});

Hooks.on("canvasReady", () => {
    ensureLauncher();
});

Hooks.on("renderSceneControls", () => {
    setTimeout(refreshLauncher, 0);
});