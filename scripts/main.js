import { openEncounterPopup } from "./ui-popup.js";
import { registerEncounterSettings } from "./settings.js";

function registerSceneControl(controls) {
    if (!game.user?.isGM) return;
    if (!controls || typeof controls !== "object") return;
    if (controls.terrEncounters) return;

    controls.terrEncounters = {
        name: "terrEncounters",
        title: "Terr Encounters",
        icon: "fas fa-t",
        layer: "tokens",
        visible: true,
        tools: {
            open: {
                name: "open",
                title: "Open Terr Encounters",
                icon: "fas fa-t",
                button: true,
                visible: true,
                onClick: () => openEncounterPopup()
            }
        },
        activeTool: "open"
    };
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

Hooks.on("getSceneControlButtons", (controls) => {
    registerSceneControl(controls);
});