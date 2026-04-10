import { openEncounterPopup } from "./ui-popup.js";
import { registerEncounterSettings } from "./settings.js";

Hooks.once("init", () => {
  console.log("Terr's Encounter System | Init");
  registerEncounterSettings();
});

Hooks.once("ready", () => {
  game.terrEncounters = {
    open: openEncounterPopup
  };
});