/**
 * terr-encounters v0.1.0-b8
 * Function: registers the weather system, settings, state, controller API, and
 * launcher behavior. Exposes a fuller weather API for later systems to call.
 */

import {
    advanceWeatherDay,
    getRenderedWeatherState,
    initializeWeatherState,
    refreshWeatherState,
    regenerateTrend,
    resetWeatherSystem,
    updateWeatherEnvironment
} from "./weather-controller.js";
import { registerWeatherSettings } from "./weather-settings.js";
import { registerWeatherState } from "./weather-state.js";
import { getWeatherPanel, openWeatherPanel, restoreWeatherPanelIfOpen } from "./weather-ui.js";

const MODULE_ID = "terr-encounters";
const WEATHER_SYSTEM_ID = "weather";
const LAUNCHER_BUTTON_ID = "terr-weather-launcher";

function ensureWeatherNamespace(terr) {
    terr.systems ??= {};
    terr.ui ??= {};
    terr.api ??= {};

    terr.systems[WEATHER_SYSTEM_ID] ??= {};
    terr.ui.weather ??= {};
    terr.api.weather ??= {};

    return terr.systems[WEATHER_SYSTEM_ID];
}

function buildLauncherButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.id = LAUNCHER_BUTTON_ID;
    button.classList.add("terr-encounters-launcher");
    button.dataset.action = "terr-weather-open";
    button.title = "Open Weather";
    button.innerHTML = `<i class="fas fa-cloud-sun"></i>`;

    button.addEventListener("click", async () => {
        await openWeatherPanel();
    });

    return button;
}

function findSidebarAnchor(html) {
    const root = html?.[0] ?? html;
    if (!root) return null;

    return (
        root.querySelector?.(".directory-footer") ||
        root.querySelector?.(".header-actions") ||
        root.querySelector?.(".directory-header") ||
        root
    );
}

export function registerWeatherSystem(terr) {
    const weather = ensureWeatherNamespace(terr);

    weather.id = WEATHER_SYSTEM_ID;
    weather.version = "0.1.0-b8";

    weather.onInit = async function onInit() {
        registerWeatherSettings();
        registerWeatherState();
        console.log(`${MODULE_ID} | weather init complete`);
    };

    weather.onReady = async function onReady() {
        await initializeWeatherState();
        await restoreWeatherPanelIfOpen();
        console.log(`${MODULE_ID} | weather ready`);
    };

    weather.injectLauncherButton = function injectLauncherButton(app, html) {
        if (!app || app.tabName !== "chat") return;

        const root = html?.[0] ?? html;
        if (!root) return;
        if (root.querySelector(`#${LAUNCHER_BUTTON_ID}`)) return;

        const anchor = findSidebarAnchor(html);
        if (!anchor) return;

        const button = buildLauncherButton();
        anchor.appendChild(button);
    };

    terr.ui.weather.getPanel = getWeatherPanel;

    terr.api.weather.open = openWeatherPanel;
    terr.api.weather.refresh = refreshWeatherState;
    terr.api.weather.getState = getRenderedWeatherState;
    terr.api.weather.nextDay = advanceWeatherDay;
    terr.api.weather.reroll = regenerateTrend;
    terr.api.weather.reset = resetWeatherSystem;
    terr.api.weather.setEnvironment = updateWeatherEnvironment;

    console.log(`${MODULE_ID} | weather registered v${weather.version}`);
}