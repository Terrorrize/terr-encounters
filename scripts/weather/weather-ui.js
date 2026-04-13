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
    await setWeatherSetting(SETTING_KEYS.biome, formData.biome);
    await setWeatherSetting(SETTING_KEYS.season, formData.season);
    await setWeatherSetting(SETTING_KEYS.phase, formData.phase);
    await setWeatherSetting(SETTING_KEYS.addRuins, !!formData.addRuins);
    await setWeatherSetting(SETTING_KEYS.ruinFrequency, formData.ruinFrequency || "mixed");
    await setWeatherSetting(SETTING_KEYS.ruinStyleMode, formData.ruinStyleMode || "auto");
    await setWeatherSetting(SETTING_KEYS.manualRuinFamily, formData.manualRuinFamily || "");
}

class WeatherPanelApp extends foundry.applications.api.ApplicationV2 {
    static DEFAULT_OPTIONS = {
        id: "terr-encounters-weather-panel",
        tag: "section",
        window: {
            title: "Terr Encounters Weather",
            icon: "fas fa-cloud"
        },
        position: {
            width: 520,
            height: "auto"
        }
    };

    get template() {
        return "modules/terr-encounters/templates/weather-panel.hbs";
    }

    async _prepareContext() {
        if (!this._record) {
            this._record = await WeatherController.getCurrentDay();
        }

        if (!this._environment) {
            this._environment = WeatherState.normalizeEnvironment(getWeatherEnvironment());
        }

        return WeatherRender.buildTemplateData(this._record, this._environment);
    }

    async _renderHTML(context) {
        return foundry.applications.handlebars.renderTemplate(this.template, context);
    }

    async _replaceHTML(result, content) {
        content.innerHTML = result;
    }

    async refreshFromState() {
        this._record = await WeatherController.getCurrentDay();
        this._environment = WeatherState.normalizeEnvironment(getWeatherEnvironment());
        await this.render(true);
    }

    async doMainAction(form) {
        const formData = readFormData(form);
        await saveEnvironmentFromForm(formData);
        this._environment = WeatherState.normalizeEnvironment(getWeatherEnvironment());
        this._record = await WeatherController.advanceDay();
        await this.render(true);
    }

    async doReset(form) {
        const formData = readFormData(form);
        await saveEnvironmentFromForm(formData);
        this._environment = WeatherState.normalizeEnvironment(getWeatherEnvironment());
        this._record = await WeatherController.resetCurrentDay();
        await this.render(true);
    }

    async _onRender(context, options) {
        await super._onRender(context, options);

        const root = this.element;
        if (!root) return;

        const form = root.querySelector("form");
        if (!form) return;

        const rerenderFromControls = async () => {
            const formData = readFormData(form);
            await saveEnvironmentFromForm(formData);
            this._environment = WeatherState.normalizeEnvironment(getWeatherEnvironment());
            if (!this._record) {
                this._record = await WeatherController.getCurrentDay();
            }
            await this.render(true);
        };

        form.querySelector('select[name="biome"]')?.addEventListener("change", async () => {
            const biome = form.querySelector('select[name="biome"]')?.value || getWeatherSetting(SETTING_KEYS.biome);
            const seasonSelect = form.querySelector('select[name="season"]');
            const validSeasons = getAvailableSeasonsForBiome(biome);
            if (seasonSelect && !validSeasons.includes(seasonSelect.value)) {
                seasonSelect.value = validSeasons[0];
            }
            await rerenderFromControls();
        });

        form.querySelector('select[name="season"]')?.addEventListener("change", rerenderFromControls);
        form.querySelector('select[name="phase"]')?.addEventListener("change", rerenderFromControls);
        form.querySelector('input[name="addRuins"]')?.addEventListener("change", rerenderFromControls);
        form.querySelector('select[name="ruinFrequency"]')?.addEventListener("change", rerenderFromControls);
        form.querySelector('select[name="ruinStyleMode"]')?.addEventListener("change", rerenderFromControls);
        form.querySelector('select[name="manualRuinFamily"]')?.addEventListener("change", rerenderFromControls);

        form.querySelector('[data-action="main-day-action"]')?.addEventListener("click", async (event) => {
            event.preventDefault();
            await this.doMainAction(form);
        });

        form.querySelector('[data-action="reset-current-set"]')?.addEventListener("click", async (event) => {
            event.preventDefault();
            await this.doReset(form);
        });
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