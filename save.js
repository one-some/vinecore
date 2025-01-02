const classes = {};

function regClass(name, cls) {
    classes[name] = cls;

    // When we're serializing we'll use this to save the class key in the classes kv
    cls.prototype._key = name;

    return cls;
}

function processSave(thing) {
    if (thing === null) return null;
    if (thing === undefined) {
        alert("Undefined in save.... beware...");
        return null;
    }

    if (!thing.constructor) return thing;

    switch (thing.constructor.name) {
        case "Array":
            return thing.map(x => processSave(x));
        case "Object":
            const obClone = {};
            for (const [k, v] of Object.entries(thing)) {
                obClone[k] = processSave(v);
            }
            return obClone;
    }

    if (typeof thing === "object" && thing._key) {
        // Move from class proto to instance property
        thing._key = thing._key;

        for (const [k, v] of Object.entries(thing)) {
            thing[k] = processSave(v);
        }
        return thing;
    }

    return thing;
}

function save() {
    let save = processSave(gameGlobals);

    localStorage.setItem(
        "saves",
        JSON.stringify({auto: save})
    );
}

function load() {
    const strGlob = JSON.parse(localStorage.getItem("saves")).auto;
    const newGameGlobals = loadOb2(strGlob);
    for (const [k, v] of Object.entries(newGameGlobals)) {
        gameGlobals[k] = v;
    }
}

function loadOb2(thing) {
    if (!thing) return thing;
    if (!thing.constructor) return thing;

    switch (thing.constructor.name) {
        case "Array":
            return thing.map(x => loadOb2(x));
        case "Object":
            let val = {};
            if (thing._key) val = new classes[thing._key]();

            for (const [k, v] of Object.entries(thing)) {
                val[k] = loadOb2(v);
            }
            return val;
    }

    return thing;
}
