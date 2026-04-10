import { dispatchEncounterRoll } from "./dispatcher.js";

export async function openEncounterPopup() {
  const last = (key, fallback = "") => game.settings.get("terr-encounters", key) || fallback;

  const content = `
    <form class="terr-encounters-form">
      <div class="form-group">
        <label>Season</label>
        <select name="season">
          <option value="spring" ${last("season") === "spring" ? "selected" : ""}>Spring</option>
          <option value="summer" ${last("season") === "summer" ? "selected" : ""}>Summer</option>
          <option value="autumn" ${last("season") === "autumn" ? "selected" : ""}>Autumn</option>
          <option value="winter" ${last("season") === "winter" ? "selected" : ""}>Winter</option>
        </select>
      </div>

      <div class="form-group">
        <label>Biome</label>
        <select name="biome">
          <option value="forest" ${last("biome") === "forest" ? "selected" : ""}>Forest</option>
          <option value="plains" ${last("biome") === "plains" ? "selected" : ""}>Plains</option>
          <option value="hills" ${last("biome") === "hills" ? "selected" : ""}>Hills</option>
          <option value="mountains" ${last("biome") === "mountains" ? "selected" : ""}>Mountains</option>
          <option value="desert" ${last("biome") === "desert" ? "selected" : ""}>Desert</option>
          <option value="swamp" ${last("biome") === "swamp" ? "selected" : ""}>Swamp</option>
          <option value="coast" ${last("biome") === "coast" ? "selected" : ""}>Coast</option>
          <option value="tundra" ${last("biome") === "tundra" ? "selected" : ""}>Tundra</option>
          <option value="urban" ${last("biome") === "urban" ? "selected" : ""}>Urban Fringe</option>
          <option value="ruins" ${last("biome") === "ruins" ? "selected" : ""}>Ruins</option>
        </select>
      </div>

      <div class="form-group">
        <label>Party Size</label>
        <input type="number" name="partySize" value="${last("partySize", "5")}" min="1" max="12">
      </div>

      <div class="form-group">
        <label>Min Level</label>
        <input type="number" name="levelMin" value="${last("levelMin", "1")}" min="-1" max="25">
      </div>

      <div class="form-group">
        <label>Max Level</label>
        <input type="number" name="levelMax" value="${last("levelMax", "1")}" min="-1" max="25">
      </div>

      <div class="form-group">
        <label>Difficulty</label>
        <select name="difficulty">
          <option value="easy" ${last("difficulty") === "easy" ? "selected" : ""}>Easy</option>
          <option value="moderate" ${last("difficulty") === "moderate" ? "selected" : ""}>Moderate</option>
          <option value="severe" ${last("difficulty") === "severe" ? "selected" : ""}>Severe</option>
          <option value="extreme" ${last("difficulty") === "extreme" ? "selected" : ""}>Extreme</option>
        </select>
      </div>
    </form>
  `;

  await foundry.applications.api.DialogV2.prompt({
    window: { title: "Terr's Encounter System" },
    content,
    ok: {
      label: "Roll Encounter",
      callback: async (event, button, dialog) => {
        const form = button.form;
        const data = Object.fromEntries(new FormData(form));

        if (Number(data.levelMin) > Number(data.levelMax)) {
          const temp = data.levelMin;
          data.levelMin = data.levelMax;
          data.levelMax = temp;
        }

        for (const [k, v] of Object.entries(data)) {
          await game.settings.set("terr-encounters", k, String(v));
        }

        dispatchEncounterRoll(data);
        return data;
      }
    },
    rejectClose: false,
    modal: true
  });
}