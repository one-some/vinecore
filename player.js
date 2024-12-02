const VarHooks = [];

class Character {
    _hookName = "player";
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
    const timeClass = "NIGHT";
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

    return true;
}

refreshHooks();
