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

    let longest = 0;
    for (const option of Array.from(select.options)) {
        longest = Math.max(longest, measureTextWidth(option.textContent ?? "", font));
    }

    const horizontalPadding = 34;
    const width = Math.ceil(longest + horizontalPadding);
    select.style.width = `${Math.max(width, 72)}px`;
}

function autoSizeSelects(root) {
    for (const select of Array.from(root.querySelectorAll("select"))) {
        autoSizeSelect(select);
    }
}

function captureOpenState(root) {
    return {
        controlsOpen: !!root.querySelector(".weather-controls-details")?.open,
        ruinsOpen: !!root.querySelector(".weather-ruins-details")?.open
    };
}

function restoreOpenState(root, state) {
    const controls = root.querySelector(".weather-controls-details");
    const ruins = root.querySelector(".weather-ruins-details");

    if (controls) controls.open = !!state.controlsOpen;
    if (ruins) ruins.open = !!state.ruinsOpen;
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
            title: "Terr Encounters Weather",
            icon: "fas fa-cloud"
        },
        position: {
            width: 236,
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

    async rerenderPreservingOpenState(content) {
        this._openState = captureOpenState(content);
        await this.refreshFromState();
        await this.render(true);
    }

    async doMainAction(content) {
        if (typeof WeatherController.advanceDay === "function") {
            this._record = await WeatherController.advanceDay();
        } else {
            this._record = await WeatherController.getCurrentDay();
        }

        this._environment = WeatherState.normalizeEnvironment(getWeatherEnvironment());
        this._openState = captureOpenState(content);
        await this.render(true);
    }

    async doReset(content) {
        if (typeof WeatherController.resetCurrentDay === "function") {
            this._record = await WeatherController.resetCurrentDay();
        } else {
            const environment = WeatherState.normalizeEnvironment(getWeatherEnvironment());
            this._record = await WeatherState.setCurrentDayRecord({
                biome: environment.biome,
                season: environment.season,
                phase: environment.phase
            });
        }

        this._environment = WeatherState.normalizeEnvironment(getWeatherEnvironment());
        this._openState = captureOpenState(content);
        await this.render(true);
    }

    _bindDOM(content) {
        restoreOpenState(content, this._openState ?? {});
        autoSizeSelects(content);

        const form = content.querySelector("form");
        if (!form) return;

        const applyChanges = async () => {
            const formData = readFormData(form);
            this._openState = captureOpenState(content);
            await saveEnvironmentFromForm(formData);
            await this.rerenderPreservingOpenState(content);
        };

        form.querySelector('[data-action="main-day-action"]')?.addEventListener("click", async (event) => {
            event.preventDefault();
            await this.doMainAction(content);
        });

        form.querySelector('[data-action="reset-current-set"]')?.addEventListener("click", async (event) => {
            event.preventDefault();
            await this.doReset(content);
        });

        form.querySelector('select[name="biome"]')?.addEventListener("change", applyChanges);
        form.querySelector('select[name="season"]')?.addEventListener("change", applyChanges);
        form.querySelector('select[name="phase"]')?.addEventListener("change", applyChanges);
        form.querySelector('input[name="addRuins"]')?.addEventListener("change", async () => {
            const ruinsDetails = form.querySelector(".weather-ruins-details");
            if (ruinsDetails) ruinsDetails.open = !!form.querySelector('input[name="addRuins"]')?.checked;
            await applyChanges();
        });
        form.querySelector('select[name="ruinFrequency"]')?.addEventListener("change", applyChanges);
        form.querySelector('select[name="ruinStyleMode"]')?.addEventListener("change", applyChanges);
        form.querySelector('select[name="manualRuinFamily"]')?.addEventListener("change", applyChanges);
    }

    async close(options) {
        weatherPanelInstance = null;
        return super.close(options);
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