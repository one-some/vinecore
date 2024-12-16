const VarHooks = [];

const classes = {};

classes.character = (class {
    name = "? ? ?";
    role = "testificate";
    money = 0;
    maxHealth = 100;
    health = 0;
    conditions = {};

    constructor() {
        this.health = this.maxHealth;
    }

    battleNoise() {
        battleLog(`${this.name} looks angry... grrrrr`);
    }

    doDamage(damage) {
        this.health = Math.max(0, this.health - damage);
    }

    get dead() {
        return this.health <= 0;
    }

    // Lang. I don't like how these pollute the character object but need a reference that isn't circular for saving
    get lang_theCharacter() {
        return `the ${this.name}`;
    }

    addCondition(condition, {fromEnv=true}={}) {
        if (!Object.values(Conditions).includes(condition)) throw new Error("Bad condition");

        this.conditions[condition] = { fromEnv: fromEnv };
    }
})

classes.snake = (class extends classes.character {
    name = "Snake";
    maxHealth = 50;

    battleNoise() {
        battleLog(`${this.name} bears its fangs.`);
    }

    attack() {
        gameGlobals.player.addCondition(Conditions.POISON);
        gameGlobals.player.doDamage(3);
    }
});

for (const [key, cls] of Object.entries(classes)) {
    cls.prototype._key = key;
}

const Conditions = {
    COLD: "cold",
    HOT: "hot",
    POISON: "poison",
};

const ConditionsData = {
    [Conditions.COLD]: {
        text: "COLD",
        color: "lightblue"
    },
    [Conditions.HOT]: {
        text: "HOT",
        color: "red",
        desc: "An overwhelming heat consumes you. Healing will be difficult.",
    },
    [Conditions.POISON]: {
        text: "POISON",
        color: "purple",
        desc: "A poison courses through your veins."
    }
};

let gameGlobals = {
    player: new classes.character(),
    time: 200,
    currentPassage: Array.from(Object.keys(RawPassages))[0],
    passageHistory: [],
    battleState: {
        enemies: [
            new classes.snake()
        ],
        inBattle: false,
        wonBattle: null,
        battleReturnLocation: null,
        log: [],
    },
};

function passTime(time) {
    if (isNaN(time)) throw new Error("Bad time!");
    gameGlobals.time += Math.ceil(time);
}

function checkBattleEnd() {
    if (gameGlobals.player.dead) return battleEnd(false);
    if (!gameGlobals.battleState.enemies.filter(x => !x.dead).length) return battleEnd(true);
}

function battleEnd(won) {
    battleLog(won ? "You win!" : "You lost!");
    gameGlobals.battleState.wonBattle = won;
    gameGlobals.battleState.inBattle = false;
}

function battleSlap() {
    const enemy = gameGlobals.battleState.enemies[0];
    enemy.doDamage(2);
    battleLog(`You slap ${enemy.lang_theCharacter}. Ouch.`);
    enemy.attack();
    checkBattleEnd();
}

VarHooks.push(function() {
    const logCont = $el("battle-log");
    if (!logCont) return;

    logCont.innerHTML = "";
    for (const msg of gameGlobals.battleState.log) {
        $e("log-entry", logCont, {innerText: msg.text}).scrollIntoView();
    }

    const battleStage = $el("#battle-stage");
    battleStage.innerHTML = "";

    for (const enemy of gameGlobals.battleState.enemies) {
        const guy = $e("battle-guy", battleStage);
        $e("span", guy, {classes: ["name"], innerText: enemy.name});
        $e("img", guy, {src: "img/snake.png"});

        // Clammmmp
        enemy.health = Math.max(0, Math.min(enemy.maxHealth, enemy.health));

        const healthBar = $e("bar", guy, {classes: ["health"]});
        const healthBarInner = $e(
            "bar-inner",
            healthBar,
            {"style.width": (enemy.health / enemy.maxHealth * 100) + "%"}
        );
        const healthBarText = $e(
            "span",
            healthBar,
            {innerText: `${enemy.health} / ${enemy.maxHealth} HP`}
        );

        console.log(enemy);
    }
});

VarHooks.push(function() {
    const condContainer = document.querySelector("status-conditions");
    condContainer.innerHTML = "";

    for (const [condName, condInstDat] of Object.entries(gameGlobals.player.conditions)) {
        const dat = ConditionsData[condName];
        if (!dat) throw new Error("Bad condition");
        $e("cond", condContainer, { innerText: dat.text, "style.color": dat.color, title: dat.desc});
    }
});

VarHooks.push(function() {
    const date = new Date(gameGlobals.time * 1000);
    const time = date.toLocaleTimeString("en-US", { 
        hour12: true, 
        hour: "numeric", 
        minute: "numeric", 
    });

    const hour = date.getHours();
    const decHour = hour + (date.getMinutes() / 60);
    const blockEl = document.querySelector("time-block");

    let timeClass;

    let scaledCelestial;
    if (hour > 4 && hour <= 20) {
        // Morning, Afternoon, Evening
        scaledCelestial = (decHour - 4) / 20;
    } else {
        // Night
        scaledCelestial = ((decHour < 20 ? decHour + 24 : decHour) - 21) / 8;
    }

    const celestialAngle = (scaledCelestial * 180) - 90 - 180;


    if (hour > 4 && hour < 12) {
        timeClass = "MORNING";
        blockEl.style.background = `linear-gradient(${celestialAngle}deg, rgba(59,162,226,1) 0%, rgba(170,200,219,1) 50%, rgba(255,162,25,1) 100%)`;
    } else if (hour >= 12 && hour < 17) {
        timeClass = "AFTERNOON";
        blockEl.style.background = `linear-gradient(${celestialAngle}deg, rgba(59,162,226,1) 0%, rgba(170,200,219,1) 50%, rgba(255,162,25,1) 100%)`;
    } else if (hour >= 17 && hour <= 20) {
        timeClass = "EVENING";
        blockEl.style.background = `linear-gradient(${celestialAngle}deg, rgba(230,159,48,1) 45%, rgba(255,25,244,1) 100%)`;
    } else {
        timeClass = "NIGHT";
        blockEl.style.background = `linear-gradient(${celestialAngle}deg, rgba(12,0,255,1) 48%, rgba(0,0,0,1) 100%)`;
    }


    const month = date.toLocaleString("default", { month: "long" });

    blockEl.className = "";
    blockEl.classList.add(timeClass.toLowerCase());

    blockEl.innerText = `${time} [${timeClass}]\n${month} ${date.getDate()}, ${date.getFullYear()}`;
});

function getGameVar(path) {
    const pathBits = path.split(".");
    let target = gameGlobals;

    while (pathBits.length) {
        target = target[pathBits.shift()];
    }

    return target;
}

function refreshHooks() {
    for (const el of document.querySelectorAll("[hook]")) {
        let target = getGameVar(el.getAttribute("hook"))

        if (target && !isNaN(target)) {
            target = Number(target).toLocaleString();
        }

        el.innerText = String(target);
    }

    for (const hook of VarHooks) {
        hook();
    }

    save();

    return true;
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
        thing._key = thing._key;
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
    gameGlobals = loadOb2(strGlob);
}

function evillllloadOb(oldMeat, newSkeleton) {
    for (const [k, skeletonV] of Object.entries(newSkeleton)) {
        const isObject = Object.prototype.toString.call(skeletonV).includes("Object");
        if (isObject) {
            // HACK. Who knows what this will do
            if (oldMeat[k] === undefined) oldMeat[k] = {};

            evillllloadOb(oldMeat[k], skeletonV);
            continue;
        }

        oldMeat[k] = skeletonV;
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

load();
refreshHooks();
