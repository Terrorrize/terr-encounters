export async function dispatchEncounterRoll(data) {
    const msg = `
    <h2>Weather</h2>
    <p>Stub weather output.</p>

    <h2>World Checks</h2>
    <p>Stub: Something happens.</p>

    <h2>Main Event</h2>
    <p>Stub main event.</p>

    <h2>Add-On A</h2>
    <p>Stub add-on A.</p>

    <h2>Add-On B</h2>
    <p>Stub add-on B.</p>
  `;

    await ChatMessage.create({
        speaker: { alias: "Terr's Encounter System" },
        content: msg
    });
}