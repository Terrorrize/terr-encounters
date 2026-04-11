function rollDie(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

function rollWeighted(items) {
    const total = items.reduce((sum, item) => sum + item.weight, 0);
    let roll = Math.random() * total;

    for (const item of items) {
        roll -= item.weight;
        if (roll <= 0) return item;
    }

    return items[items.length - 1];
}

function normalizeNumber(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function getTemperatureBand(season, biome) {
    const table = {
        spring: {
            forest: "Cool",
            plains: "Mild",
            hills: "Cool",
            mountains: "Cold",
            desert: "Warm",
            swamp: "Mild",
            coast: "Cool",
            tundra: "Cold",
            urban: "Mild",
            ruins: "Cool"
        },
        summer: {
            forest: "Mild",
            plains: "Warm",
            hills: "Mild",
            mountains: "Cool",
            desert: "Hot",
            swamp: "Warm",
            coast: "Mild",
            tundra: "Cool",
            urban: "Warm",
            ruins: "Warm"
        },
        autumn: {
            forest: "Cool",
            plains: "Cool",
            hills: "Cool",
            mountains: "Cold",
            desert: "Warm",
            swamp: "Mild",
            coast: "Cool",
            tundra: "Cold",
            urban: "Cool",
            ruins: "Cool"
        },
        winter: {
            forest: "Cold",
            plains: "Cold",
            hills: "Cold",
            mountains: "Severe Cold",
            desert: "Cool",
            swamp: "Cold",
            coast: "Cold",
            tundra: "Severe Cold",
            urban: "Cold",
            ruins: "Cold"
        }
    };

    return table[season]?.[biome] ?? "Mild";
}

function buildWeatherTable(season, biome) {
    const clear = { key: "clear", label: "Clear Skies", weight: 30 };
    const cloudy = { key: "cloudy", label: "Cloudy", weight: 20 };
    const fog = { key: "fog", label: "Fog", weight: 8 };
    const rain = { key: "rain", label: "Rain", weight: 18 };
    const storm = { key: "storm", label: "Storm", weight: 7 };
    const wind = { key: "wind", label: "Strong Winds", weight: 10 };
    const heat = { key: "heat", label: "Heat Wave", weight: 4 };
    const cold = { key: "cold", label: "Cold Snap", weight: 4 };
    const snow = { key: "snow", label: "Snow", weight: 16 };
    const blizzard = { key: "blizzard", label: "Blizzard", weight: 5 };
    const sand = { key: "sand", label: "Sandstorm", weight: 10 };
    const humidity = { key: "humidity", label: "Heavy Humidity", weight: 10 };

    const seasonal = {
        spring: [clear, cloudy, rain, rain, wind, fog, storm],
        summer: [clear, clear, cloudy, rain, wind, heat, storm],
        autumn: [clear, cloudy, rain, wind, fog, storm, cold],
        winter: [clear, cloudy, wind, cold, snow, snow, blizzard]
    };

    const biomeOverrides = {
        forest: {
            spring: [clear, cloudy, rain, rain, fog, wind, storm],
            summer: [clear, cloudy, rain, fog, wind, heat, storm],
            autumn: [clear, cloudy, rain, fog, wind, storm, cold],
            winter: [clear, cloudy, wind, snow, snow, fog, cold]
        },
        plains: {
            spring: [clear, clear, cloudy, rain, wind, wind, storm],
            summer: [clear, clear, clear, cloudy, wind, heat, storm],
            autumn: [clear, cloudy, cloudy, wind, wind, rain, cold],
            winter: [clear, cloudy, wind, wind, snow, cold, blizzard]
        },
        hills: {
            spring: [clear, cloudy, rain, wind, wind, fog, storm],
            summer: [clear, cloudy, wind, wind, rain, heat, storm],
            autumn: [clear, cloudy, wind, rain, fog, cold, storm],
            winter: [clear, cloudy, wind, snow, cold, blizzard, storm]
        },
        mountains: {
            spring: [clear, cloudy, wind, rain, fog, cold, snow],
            summer: [clear, cloudy, wind, wind, rain, storm, cold],
            autumn: [clear, cloudy, wind, fog, cold, snow, storm],
            winter: [clear, wind, wind, cold, snow, snow, blizzard]
        },
        desert: {
            spring: [clear, clear, clear, wind, sand, heat, cloudy],
            summer: [clear, clear, clear, heat, heat, wind, sand],
            autumn: [clear, clear, wind, cloudy, sand, heat, cold],
            winter: [clear, clear, cloudy, wind, sand, cold, cold]
        },
        swamp: {
            spring: [cloudy, rain, rain, fog, fog, storm, humidity],
            summer: [cloudy, rain, rain, fog, humidity, humidity, storm],
            autumn: [cloudy, rain, fog, fog, humidity, storm, wind],
            winter: [cloudy, rain, fog, cold, humidity, wind, clear]
        },
        coast: {
            spring: [clear, cloudy, rain, fog, wind, wind, storm],
            summer: [clear, cloudy, fog, wind, wind, rain, storm],
            autumn: [cloudy, rain, fog, wind, wind, storm, cold],
            winter: [cloudy, wind, rain, cold, snow, storm, fog]
        },
        tundra: {
            spring: [clear, cloudy, wind, cold, snow, snow, blizzard],
            summer: [clear, cloudy, wind, fog, rain, cold, snow],
            autumn: [clear, cloudy, wind, cold, snow, blizzard, storm],
            winter: [clear, wind, cold, cold, snow, snow, blizzard]
        },
        urban: {
            spring: [clear, cloudy, rain, wind, fog, storm, cloudy],
            summer: [clear, clear, cloudy, heat, rain, wind, storm],
            autumn: [clear, cloudy, rain, fog, wind, cold, storm],
            winter: [clear, cloudy, wind, cold, snow, fog, storm]
        },
        ruins: {
            spring: [clear, cloudy, fog, rain, wind, storm, cold],
            summer: [clear, cloudy, fog, wind, heat, storm, rain],
            autumn: [cloudy, fog, rain, wind, cold, storm, clear],
            winter: [cloudy, fog, wind, cold, snow, blizzard, clear]
        }
    };

    return biomeOverrides[biome]?.[season] ?? seasonal[season] ?? seasonal.spring;
}

function describeWeather(result, season, biome) {
    const temperature = getTemperatureBand(season, biome);

    const descriptions = {
        clear: `Visibility is good. Temperature is ${temperature.toLowerCase()}.`,
        cloudy: `Gray cover hangs overhead. Temperature is ${temperature.toLowerCase()}.`,
        fog: `Visibility is reduced by lingering fog. Temperature is ${temperature.toLowerCase()}.`,
        rain: `Steady precipitation and wet ground complicate travel. Temperature is ${temperature.toLowerCase()}.`,
        storm: `Harsh weather, thunder, or violent rain pushes conditions toward dangerous travel.`,
        wind: `Strong gusts interfere with hearing, ranged attacks, or exposed travel.`,
        heat: `Oppressive heat strains travel and rest in exposed areas.`,
        cold: `A biting chill settles in and makes exposure more dangerous.`,
        snow: `Snowfall reduces visibility and slows open-ground travel.`,
        blizzard: `Severe snow and wind create near-whiteout conditions.`,
        sand: `Blowing grit cuts visibility and punishes exposed movement.`,
        humidity: `Air is heavy, wet, and exhausting; the ground feels slick and clinging.`
    };

    return descriptions[result.key] ?? `Conditions are unsettled. Temperature is ${temperature.toLowerCase()}.`;
}

function rollWeather(data) {
    const season = String(data.season || "spring").toLowerCase();
    const biome = String(data.biome || "forest").toLowerCase();

    const table = buildWeatherTable(season, biome);
    const result = rollWeighted(table);
    const shiftRoll = rollDie(6) + rollDie(6);
    const intensityRoll = rollDie(20);

    let intensity = "Normal";
    if (intensityRoll >= 18) intensity = "Severe";
    else if (intensityRoll <= 4) intensity = "Light";

    return {
        label: result.label,
        temperature: getTemperatureBand(season, biome),
        intensity,
        shiftRoll,
        details: describeWeather(result, season, biome)
    };
}

function formatPartyBand(data) {
    const partySize = normalizeNumber(data.partySize, 5);
    const levelMin = normalizeNumber(data.levelMin, 1);
    const levelMax = normalizeNumber(data.levelMax, 1);
    const difficulty = String(data.difficulty || "easy");

    return `${partySize} PCs · Levels ${levelMin}-${levelMax} · ${difficulty[0].toUpperCase()}${difficulty.slice(1)}`;
}

export async function dispatchEncounterRoll(data) {
    const weather = rollWeather(data);
    const season = String(data.season || "spring");
    const biome = String(data.biome || "forest");

    const msg = `
    <div class="terr-encounters-card">
      <h2>Weather</h2>
      <p><strong>${weather.label}</strong> (${weather.intensity})</p>
      <p>${weather.details}</p>
      <p><strong>Season:</strong> ${season} | <strong>Biome:</strong> ${biome} | <strong>Temperature:</strong> ${weather.temperature} | <strong>Shift Roll:</strong> ${weather.shiftRoll}</p>

      <h2>World Checks</h2>
      <p>Stub: Something happens.</p>

      <h2>Main Event</h2>
      <p>Stub main event.</p>

      <h2>Add-On A</h2>
      <p>Stub add-on A.</p>

      <h2>Add-On B</h2>
      <p>Stub add-on B.</p>

      <hr>
      <p><strong>Encounter Band:</strong> ${formatPartyBand(data)}</p>
    </div>
  `;

    await ChatMessage.create({
        speaker: { alias: "Terr's Encounter System" },
        content: msg
    });
}