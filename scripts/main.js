import { openEncounterPopup } from "./ui-popup.js";
import { registerEncounterSettings } from "./settings.js";

function addSettingsSidebarButton(app, html) {
    if (app.tabName !== "settings") return;
    if (html.find(".terr-encounters-launch").length) return;

    const button = $(`
    <button type="button" class="terr-encounters-launch">
      <i class="fas fa-cloud-sun"></i> Terr Encounters
    </button>
  `);

    button.on("click", () => {
        openEncounterPopup();
    });

    const settingsList = html.find("#client-settings, .settings-list, [data-tab='settings']");
    if (settingsList.length) {
        settingsList.first().append(button);
        return;
    }

    html.append(button);
}

Hooks.once("init", () => {
    console.log("Terr's Encounter System | Init");
    registerEncounterSettings();
});

Hooks.once("ready", () => {
    game.terrEncounters = {
        open: openEncounterPopup
    };
});

Hooks.on("renderSidebarTab", (app, html) => {
    addSettingsSidebarButton(app, html);
});