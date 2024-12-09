const VarHooks = [];

class Character {
    name = "? ? ?";
    role = "testificate";
    money = 0;
    conditions = {};

    constructor() {
    }
}

const Conditions = {
    COLD: "cold",
    HOT: "hot",
};

const ConditionsData = {
    [Conditions.COLD]: {
        text: "You are very cold.",
        color: "lightblue"
    },
    [Conditions.HOT]: {
        text: "You are very hot.",
        color: "red",
        desc: "An overwhelming heat consumes you. Healing will be difficult.",
    }
};

const gameGlobals = {
    player: new Character(),
    time: 200,
    currentPassage: Array.from(Object.keys(RawPassages))[0],
    passageHistory: [],
    battleState: {
        inBattle: false,
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
    console.log(scaledCelestial);

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

function save() {
    localStorage.setItem(
        "saves",
        JSON.stringify({auto: gameGlobals})
    );
}

function load() {
    const strGlob = JSON.parse(localStorage.getItem("saves")).auto;
    loadOb(gameGlobals, strGlob);
}

function loadOb(oldMeat, newSkeleton) {
    for (const [k, skeletonV] of Object.entries(newSkeleton)) {
        const isObject = Object.prototype.toString.call(skeletonV).includes("Object");
        if (isObject) {
            // HACK. Who knows what this will do
            if (oldMeat[k] === undefined) oldMeat[k] = {};

            loadOb(oldMeat[k], skeletonV);
            continue;
        }

        oldMeat[k] = skeletonV;
    }
}

load();
refreshHooks();
