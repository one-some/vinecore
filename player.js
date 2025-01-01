const VarHooks = [];

regClass("character", class {
    name = "? ? ?";
    role = "testificate";
    money = 0;
    maxHealth = 100;
    health = 0;
    conditions = {};
    inventory = [];
    static attacks = [];

    constructor() {
        this.health = this.maxHealth;
    }

    battleNoise() {
        battleLog(`${this.name} looks angry... grrrrr`);
    }

    doDamage(damage) {
        this.health = Math.round(Math.min(this.maxHealth, Math.max(0, this.health - damage)));
        if (!this.health) this.die();
    }

    die() {
        if (this.isPlayer && gameGlobals.currentPassage !== "battle") {
            jumpTo("dead");
        }
    }

    get atMaxHealth() {
        return this.health >= this.maxHealth;
    }

    get dead() {
        return this.health <= 0;
    }

    lang(text) {
        text = text.replaceAll("Bob's", `${this.name}'s`);
        text = text.replaceAll("his", "his");
        text = text.replaceAll("Bob", `${this.name}`);
        return text;
    }

    addCondition(condition, {fromEnv=false, level=1}={}) {
        if (!Object.values(Conditions).includes(condition)) throw new Error("Bad condition");

        this.conditions[condition] = { fromEnv: fromEnv, level: level };
    }

    addItem(item) {
        // TODO: maxStack
        
        // Let's see if we can stack it anywhere
        for (const invItem of this.inventory) {
            if (!invItem.canStack(item)) continue;
            invItem.count += item.count;
            return;
        }

        // Ok we can't, let's just 
        this.inventory.push(item);
    }

    get isPlayer() {
        return this === gameGlobals.player;
    }

    get attacks() {
        return this.constructor.attacks;
    }
});

regClass("attack", class {
    constructor(name, condition, chance, callback) {
        this.name = name;
        this.condition = condition;
        this.chance = chance;
        this.callback = callback;
    }
});

regClass("player", class extends classes.character {
    static attacks = [
        new classes.attack(
            "Slap",
            null,
            2,
            function(target) {
                battleLog(this.lang("Bob slaps ") + target.lang("Bob. Ouch."));
                target.doDamage(2);
            }
        ),
    ];
});

regClass("snake", class extends classes.character {
    name = "Snake";
    maxHealth = 50;

    static attacks = [
        new classes.attack(
            "Bite",
            null,
            2,
            function(target) {
                battleLog(this.lang("Bob clamps his jaw onto ") + target.lang("Bob"));
                target.doDamage(3);
            }
        ),

        new classes.attack(
            "Poison",
            (target) => !target.conditions.poison,
            6,
            function(target) {
                battleLog(this.lang("Bob injects his venom into ") + target.lang("Bob. Bob is now poisoned."));
                target.addCondition(Conditions.POISON);
            }
        )

    ];

    battleNoise() {
        battleLog(`${this.name} bears its fangs.`);
    }

    attack(target) {
        for (let i=0; i<100; i++) {
            for (const attack of this.constructor.attacks) {
                if (attack.condition && !attack.condition.bind(this)(target)) continue;
                if (!randOneIn(attack.chance)) continue;
                attack.callback.bind(this)(target);
                return;
            }
        }

        battleLog(this.lang("Bob doesn't know what to do!"));
    }
});

const Conditions = {
    COLD: "cold",
    HOT: "hot",
    POISON: "poison",
};

const ConditionsData = {
    [Conditions.COLD]: {
        text: "Cold",
        color: "lightblue"
    },
    [Conditions.HOT]: {
        text: "Hot",
        color: "red",
        desc: "An overwhelming heat consumes you. Healing will be difficult.",
    },
    [Conditions.POISON]: {
        text: "Poison",
        color: "purple",
        desc: "A poison courses through your veins."
    }
};

let gameGlobals = {
    player: new classes.player(),
    time: 200,
    currentPassage: Array.from(Object.keys(RawPassages))[0],
    lastLegitPassage: null,
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

VarHooks.push(function() {
    const condContainer = document.querySelector("status-conditions");
    condContainer.innerHTML = "";

    for (const [condName, condInstDat] of Object.entries(gameGlobals.player.conditions)) {
        const dat = ConditionsData[condName];
        if (!dat) throw new Error("Bad condition");

        $e(
            "cond",
            condContainer,
            {
                innerText: `${dat.text} ${toRoman(condInstDat.level) ?? 1}`,
                "style.backgroundColor": dat.color,
                title: dat.desc
            }
    );
    }

    const healthBar = document.getElementById("plr-health");
    healthBar.innerHTML = "";

    const healthBarInner = $e(
        "bar-inner",
        healthBar,
        {"style.width": (gameGlobals.player.health / gameGlobals.player.maxHealth * 100) + "%"}
    );

    const healthBarText = $e(
        "span",
        healthBar,
        {innerText: `${gameGlobals.player.health} / ${gameGlobals.player.maxHealth} HP`}
    );
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

document.addEventListener("readystatechange", function() {
    if (document.readyState !== "complete") return;

    load();
    refreshHooks();
    jumpTo(gameGlobals.currentPassage, {instant: true});
});
