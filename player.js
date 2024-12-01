const HookBearers = [];

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

function refreshHooks() {
    for (const el of document.querySelectorAll("[hook]")) {
        const pathBits = el.getAttribute("hook").split(".");
        let target = gameGlobals;

        while (pathBits.length) {
            target = target[pathBits.shift()];
        }

        el.innerText = String(target);
    }

    return true;

}
