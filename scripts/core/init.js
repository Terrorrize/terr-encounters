Hooks.once("init", () => {
    Handlebars.registerHelper("eq", (a, b) => a === b);
    console.log("terr-encounters | core init");
});