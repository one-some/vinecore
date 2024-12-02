const VarHooks = [];

class Character {
    name = "? ? ?";
    role = "testificate";

    constructor() {
    }
}

const gameGlobals = {
    player: new Character(),
    time: 200
};

function passTime(time) {
    gameGlobals.time += Math.ceil(time);
}

VarHooks.push(function() {
    const date = new Date(gameGlobals.time * 1000);
    const time = date.toLocaleTimeString("en-US", { 
        hour12: true, 
        hour: "numeric", 
        minute: "numeric", 
    });

    const hour = date.getHours();

    let timeClass;
    if (hour > 4 && hour < 12) {
        timeClass = "MORNING";
    } else if (hour >= 12 && hour < 17) {
        timeClass = "AFTERNOON";
    } else if (hour >= 17 && hour <= 20) {
        timeClass = "EVENING";
    } else {
        timeClass = "NIGHT";
    }

    const month = date.toLocaleString("default", { month: "long" });

    document.querySelector("time-block").innerText = `${time} [${timeClass}]\n${month} ${date.getDate()}, ${date.getFullYear()}`;
});

function refreshHooks() {
    for (const el of document.querySelectorAll("[hook]")) {
        const pathBits = el.getAttribute("hook").split(".");
        let target = gameGlobals;

        while (pathBits.length) {
            target = target[pathBits.shift()];
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
            loadOb(oldMeat[k], skeletonV);
            continue;
        }

        oldMeat[k] = skeletonV;
    }
}

load();
refreshHooks();
