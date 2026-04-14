import { MODULE_ID, getWeatherEnvironment, getWeatherSetting, setWeatherSetting, SETTING_KEYS } from "./weather-settings.js";
import { WeatherController } from "./weather-controller.js";
import { WeatherRender } from "./weather-render.js";
import { WeatherState } from "./weather-state.js";
import { getAvailableSeasonsForBiome } from "../data/weather-biomes.js";

let weatherPanelInstance = null;

function readFormData(form) {
    const fd = new FormData(form);

    return {
        biome: String(fd.get("biome") ?? ""),
        season: String(fd.get("season") ?? ""),
        phase: String(fd.get("phase") ?? ""),
        addRuins: form.querySelector('input[name="addRuins"]')?.checked ?? false,
        ruinFrequency: String(fd.get("ruinFrequency") ?? "mixed"),
        ruinStyleMode: String(fd.get("ruinStyleMode") ?? "auto"),
        manualRuinFamily: String(fd.get("manualRuinFamily") ?? "")
    };
}

async function saveEnvironmentFromForm(formData) {
    const biome = formData.biome || getWeatherSetting(SETTING_KEYS.biome);
    const validSeasons = getAvailableSeasonsForBiome(biome);
    let season = formData.season || getWeatherSetting(SETTING_KEYS.season);
    if (!validSeasons.includes(season)) season = validSeasons[0];

    const phase = ["Early", "Mid", "Late"].includes(formData.phase) ? formData.phase : "Early";
    const addRuins = !!formData.addRuins;
    const ruinFrequency = ["faint", "light", "mixed"].includes(formData.ruinFrequency) ? formData.ruinFrequency : "mixed";
    const ruinStyleMode = ["auto", "manual"].includes(formData.ruinStyleMode) ? formData.ruinStyleMode : "auto";

    await setWeatherSetting(SETTING_KEYS.biome, biome);
    await setWeatherSetting(SETTING_KEYS.season, season);
    await setWeatherSetting(SETTING_KEYS.seasonPhase, phase);
    await setWeatherSetting(SETTING_KEYS.addRuins, addRuins);
    await setWeatherSetting(SETTING_KEYS.ruinFrequency, ruinFrequency);
    await setWeatherSetting(SETTING_KEYS.ruinStyleMode, ruinStyleMode);
    await setWeatherSetting(SETTING_KEYS.manualRuinFamily, formData.manualRuinFamily || "");
}

function measureTextWidth(text, font) {
    const canvas = measureTextWidth.canvas ?? (measureTextWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    context.font = font;
    return context.measureText(text).width;
}

function autoSizeSelect(select) {
    if (!select) return;

    const style = window.getComputedStyle(select);
    const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const selectedText = select.options[select.selectedIndex]?.textContent ?? "";
    const width = Math.ceil(measureTextWidth(selectedText, font) + 24);

    select.style.width = `${Math.max(56, width)}px`;
}

function autoSizeSelects(root) {
    for (const select of Array.from(root.querySelectorAll("select"))) {
        autoSizeSelect(select);
    }
}

function captureOpenState(root) {
    return {
        controlsOpen: !!root.querySelector(".weather-controls-details")?.open
    };
}

function restoreOpenState(root, state) {
    const controls = root.querySelector(".weather-controls-details");
    if (controls) controls.open = !!state.controlsOpen;
}

class BaseWeatherApp extends foundry.applications.api.ApplicationV2 {
    get template() {
        return "modules/terr-encounters/templates/weather-panel.hbs";
    }

    async _renderHTML(context) {
        return foundry.applications.handlebars.renderTemplate(this.template, context);
    }

    async _replaceHTML(result, content) {
        content.innerHTML = result;
        this._bindDOM(content);
    }
}

export class WeatherPanelApp extends BaseWeatherApp {
    static DEFAULT_OPTIONS = {
        id: `${MODULE_ID}-weather-panel`,
        tag: "section",
        window: {
            title: "Terr Encounters",
            icon: "fas fa-cloud"
        },
        position: {
            width: 168,
            height: "auto"
        }
    };

    async _prepareContext() {
        if (!this._record) {
            this._record = await WeatherController.getCurrentDay();
        }

        if (!this._environment) {
            this._environment = WeatherState.normalizeEnvironment(getWeatherEnvironment());
        }

        return {
            ...WeatherRender.buildTemplateData(this._record, this._environment)
        };
    }

    async refreshFromState() {
        this._record = await WeatherController.getCurrentDay();
        this._environment = WeatherState.normalizeEnvironment(getWeatherEnvironment());
    }

    async doMainAction(content) {
        this._openState = captureOpenState(content);
        this._record = await WeatherController.advanceDay();
        this._environment = WeatherState.normalizeEnvironment(getWeatherEnvironment());
        await this.render(true);
    }

    async doReset(content) {
        this._openState = captureOpenState(content);
        this._record = await WeatherController.resetCurrentDay();
        this._environment = WeatherState.normalizeEnvironment(getWeatherEnvironment());
        await this.render(true);
    }

    _bindDOM(content) {
        restoreOpenState(content, this._openState ?? {});
        autoSizeSelects(content);

        const form = content.querySelector("form");
        if (!form) return;

        const rerenderFromControls = async () => {
            this._openState = captureOpenState(content);
            const formData = readFormData(form);
            await saveEnvironmentFromForm(formData);
            await this.refreshFromState();
            await this.render(true);
        };

        form.querySelector('select[name="biome"]')?.addEventListener("change", async () => {
            const biomeSelect = form.querySelector('select[name="biome"]');
            const seasonSelect = form.querySelector('select[name="season"]');

            autoSizeSelect(biomeSelect);

            const biome = String(biomeSelect?.value ?? "");
            const validSeasons = getAvailableSeasonsForBiome(biome);
            if (seasonSelect && !validSeasons.includes(seasonSelect.value)) {
                seasonSelect.value = validSeasons[0];
            }

            await rerenderFromControls();
        });

        form.querySelector('select[name="season"]')?.addEventListener("change", async (event) => {
            autoSizeSelect(event.currentTarget);
            await rerenderFromControls();
        });

        form.querySelector('select[name="phase"]')?.addEventListener("change", async (event) => {
            autoSizeSelect(event.currentTarget);
            await rerenderFromControls();
        });

        form.querySelector('input[name="addRuins"]')?.addEventListener("change", async () => {
            await rerenderFromControls();
        });

        form.querySelector('select[name="ruinFrequency"]')?.addEventListener("change", async (event) => {
            autoSizeSelect(event.currentTarget);
            await rerenderFromControls();
        });

        form.querySelector('select[name="ruinStyleMode"]')?.addEventListener("change", async (event) => {
            autoSizeSelect(event.currentTarget);
            await rerenderFromControls();
        });

        form.querySelector('select[name="manualRuinFamily"]')?.addEventListener("change", async (event) => {
            autoSizeSelect(event.currentTarget);
            await rerenderFromControls();
        });

        form.querySelector('[data-action="main-day-action"]')?.addEventListener("click", async (event) => {
            event.preventDefault();
            event.stopPropagation();

            const formData = readFormData(form);
            await saveEnvironmentFromForm(formData);
            await this.doMainAction(content);
        });

        form.querySelector('[data-action="reset-current-set"]')?.addEventListener("click", async (event) => {
            event.preventDefault();
            event.stopPropagation();

            const formData = readFormData(form);
            await saveEnvironmentFromForm(formData);
            await this.doReset(content);
        });
    }

    async refreshFromStateAndRender() {
        await this.refreshFromState();
        await this.render(true);
    }
}

export async function openWeatherPanel() {
    if (!game.user?.isGM) {
        ui.notifications?.warn("Only the GM can use Terr Encounters.");
        return null;
    }

    if (!weatherPanelInstance) {
        weatherPanelInstance = new WeatherPanelApp();
    }

    await weatherPanelInstance.refreshFromState();
    weatherPanelInstance.render(true);
    return weatherPanelInstance;
}

export { WeatherPanelApp };