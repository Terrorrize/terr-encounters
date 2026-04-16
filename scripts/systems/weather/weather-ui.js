/**
 * terr-encounters v0.1.0-b12
 * Function: renders the weather panel, displays current trend/day data, and
 * wires the panel controls for refresh, next day, reroll, reset, and
 * environment selection actions. Manual season/phase changes now act as
 * explicit calendar overrides.
 */

import {
    getAvailableBiomes,
    getAvailableClimates,
    getAvailablePhases,
    getAvailableSeasons
} from "../../data/weather/weather-baselines.js";
import {
    advanceWeatherDay,
    getRenderedWeatherState,
    refreshWeatherState,
    regenerateTrend,
    resetWeatherSystem,
    updateWeatherEnvironment
} from "./weather-controller.js";
import { getWeatherPanelOpen, setWeatherPanelOpen } from "./weather-settings.js";

const MODULE_ID = "terr-encounters";
const PANEL_ID = "terr-weather-panel";
const PANEL_TEMPLATE = "modules/terr-encounters/templates/weather/weather-panel.hbs";

function prettyLabel(value) {
    return String(value ?? "")
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function buildSelectOptions(values, selectedValue) {
    return values.map((value) => ({
        value,
        label: prettyLabel(value),
        selected: value === selectedValue
    }));
}

function resolveEnvironmentSelection(environment, key, value) {
    const next = {
        biome: environment?.biome ?? "forest",
        climate: environment?.climate ?? "temperate",
        season: environment?.season ?? "spring",
        phase: environment?.phase ?? "mid",
        ruinsEnabled: Boolean(environment?.ruinsEnabled),
        followCalendar: environment?.followCalendar !== false
    };

    if (key === "biome") {
        next.biome = value;
        next.climate = getAvailableClimates(next.biome)[0] ?? next.climate;
        return next;
    }

    if (key === "climate") {
        next.climate = value;
        return next;
    }

    if (key === "season") {
        next.season = value;
        next.followCalendar = false;
        return next;
    }

    if (key === "phase") {
        next.phase = value;
        next.followCalendar = false;
        return next;
    }

    next[key] = value;
    return next;
}

function buildEnvironmentOptions(environment) {
    const biome = environment?.biome ?? "forest";
    const climate = environment?.climate ?? "temperate";
    const season = environment?.season ?? "spring";
    const phase = environment?.phase ?? "mid";

    return {
        biomes: buildSelectOptions(getAvailableBiomes(), biome),
        climates: buildSelectOptions(getAvailableClimates(biome), climate),
        seasons: buildSelectOptions(getAvailableSeasons(biome, climate), season),
        phases: buildSelectOptions(getAvailablePhases(biome, climate, season), phase)
    };
}

export class TerrWeatherPanel extends Application {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: PANEL_ID,
            template: PANEL_TEMPLATE,
            popOut: true,
            minimizable: true,
            resizable: false,
            width: 360,
            height: "auto",
            title: "Weather",
            classes: ["terr-encounters", "terr-weather-panel"]
        });
    }

    async getData() {
        const { state, view } = getRenderedWeatherState();

        return {
            moduleId: MODULE_ID,
            meta: view.meta,
            trendLines: view.trendLines,
            currentDayLines: view.currentDayLines,
            aftermathLines: view.aftermathLines,
            exposureLine: view.exposureLine,
            hasExposure: view.hasExposure,
            hasAftermath: view.hasAftermath,
            hasCurrentDay: view.hasCurrentDay,
            isGM: game.user?.isGM === true,
            state,
            environment: state.environment,
            environmentOptions: buildEnvironmentOptions(state.environment)
        };
    }

    async _render(force = false, options = {}) {
        const rendered = await super._render(force, options);
        await setWeatherPanelOpen(true);
        return rendered;
    }

    async close(options = {}) {
        await setWeatherPanelOpen(false);
        return super.close(options);
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find("[data-action='weather-refresh']").on("click", async (event) => {
            event.preventDefault();
            await refreshWeatherState();
            await this.refreshPanel();
        });

        html.find("[data-action='weather-next-day']").on("click", async (event) => {
            event.preventDefault();
            if (!game.user?.isGM) return;
            await advanceWeatherDay();
            await this.refreshPanel();
        });

        html.find("[data-action='weather-reroll']").on("click", async (event) => {
            event.preventDefault();
            if (!game.user?.isGM) return;
            await regenerateTrend();
            await this.refreshPanel();
        });

        html.find("[data-action='weather-reset']").on("click", async (event) => {
            event.preventDefault();
            if (!game.user?.isGM) return;
            await resetWeatherSystem();
            await this.refreshPanel();
        });

        html.find("[data-env-key]").on("change", async (event) => {
            event.preventDefault();
            if (!game.user?.isGM) return;

            const key = event.currentTarget.dataset.envKey;
            const value = event.currentTarget.value;
            const current = getRenderedWeatherState().state.environment;
            const patch = resolveEnvironmentSelection(current, key, value);

            await updateWeatherEnvironment(patch);
            await this.refreshPanel();
        });

        html.find("[data-action='weather-toggle-ruins']").on("change", async (event) => {
            event.preventDefault();
            if (!game.user?.isGM) return;

            await updateWeatherEnvironment({
                ruinsEnabled: Boolean(event.currentTarget.checked)
            });

            await this.refreshPanel();
        });
    }

    async refreshPanel() {
        return this.render(true);
    }
}

let weatherPanelInstance = null;

export function getWeatherPanel() {
    if (!weatherPanelInstance) {
        weatherPanelInstance = new TerrWeatherPanel();
    }

    return weatherPanelInstance;
}

export async function openWeatherPanel() {
    const panel = getWeatherPanel();
    await refreshWeatherState();
    await panel.render(true);
    return panel;
}

export async function closeWeatherPanel() {
    if (!weatherPanelInstance?.rendered) return null;
    await weatherPanelInstance.close();
    return null;
}

export async function toggleWeatherPanel() {
    const panel = getWeatherPanel();

    if (panel.rendered) {
        await panel.close();
        return null;
    }

    await refreshWeatherState();
    await panel.render(true);
    return panel;
}

export async function restoreWeatherPanelIfOpen() {
    if (!getWeatherPanelOpen()) return null;
    return openWeatherPanel();
}