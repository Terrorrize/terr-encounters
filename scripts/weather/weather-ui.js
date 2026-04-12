import { MODULE_ID, getWeatherEnvironment, getWeatherSetting, setWeatherSetting, SETTING_KEYS } from "./weather-settings.js";
import { WeatherController } from "./weather-controller.js";
import { WeatherRender } from "./weather-render.js";
import { WeatherState } from "./weather-state.js";
import { BIOME_DEFAULT_RUIN_FAMILIES } from "../data/weather-ruins-data.js";
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

    const availableFamilies = BIOME_DEFAULT_RUIN_FAMILIES[biome] ?? [];
    let manualRuinFamily = formData.manualRuinFamily || "";
    if (!availableFamilies.includes(manualRuinFamily)) {
        manualRuinFamily = availableFamilies[0] ?? "";
    }

    await setWeatherSetting(SETTING_KEYS.biome, biome);
    await setWeatherSetting(SETTING_KEYS.season, season);
    await setWeatherSetting(SETTING_KEYS.seasonPhase, phase);
    await setWeatherSetting(SETTING_KEYS.addRuins, addRuins);
    await setWeatherSetting(SETTING_KEYS.ruinFrequency, ruinFrequency);
    await setWeatherSetting(SETTING_KEYS.ruinStyleMode, ruinStyleMode);
    await setWeatherSetting(SETTING_KEYS.manualRuinFamily, manualRuinFamily);
}

export class WeatherPanelApp extends foundry.applications.api.ApplicationV2 {
    static DEFAULT_OPTIONS = {
        id: `${MODULE_ID}-weather-panel`,
        tag: "section",
        classes: [MODULE_ID, "weather-panel-app"],
        window: {
            title: "Terr's Encounter System",
            icon: "fas fa-cloud-sun",
            resizable: true
        },
        position: {
            width: 680,
            height: "auto"
        }
    };

    constructor(options = {}) {
        super(options);
        this._record = null;
        this._environment = null;
    }

    get template() {
        return `modules/${MODULE_ID}/templates/weather-panel.hbs`;
    }

    async _prepareContext() {
        const record = this._record ?? await WeatherState.ensureCurrentDayRecord();
        const environment = WeatherState.normalizeEnvironment(this._environment ?? getWeatherEnvironment());
        this._record = record;
        this._environment = environment;
        return WeatherRender.buildTemplateData(record, environment);
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

    async doAdvanceDay(form) {
        const formData = readFormData(form);
        await saveEnvironmentFromForm(formData);
        this._environment = WeatherState.normalizeEnvironment(getWeatherEnvironment());
        this._record = await WeatherController.advanceDay();
        await this.render(true);
    }

    async doRebuild(form) {
        const formData = readFormData(form);
        await saveEnvironmentFromForm(formData);
        this._environment = WeatherState.normalizeEnvironment(getWeatherEnvironment());
        this._record = await WeatherController.rebuildCurrentDay();
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

        form.querySelector('[data-action="refresh-current"]')?.addEventListener("click", async (event) => {
            event.preventDefault();
            await this.refreshFromState();
        });

        form.querySelector('[data-action="rebuild-current"]')?.addEventListener("click", async (event) => {
            event.preventDefault();
            await this.doRebuild(form);
        });

        form.querySelector('[data-action="advance-day"]')?.addEventListener("click", async (event) => {
            event.preventDefault();
            await this.doAdvanceDay(form);
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