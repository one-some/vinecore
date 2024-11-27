const HookBearers = [];

class Character {
    _hookName = "player";
    name = "? ? ?";
    role = "testificate";

    constructor() {
        this._hookTargets = [];

        for (const [k, v] of Object.entries(this)) {
            if (k !== "_hookTargets") this._hookTargets.push(k);
            this._updateHook(k, v);
            console.log(k, v);
        }
    }

    _updateHook(statPath, value) {
        const path = [this._hookName, statPath].join(".");
        for (const el of document.querySelectorAll(`[hook="${path}"]`)) {
            el.innerText = String(value);
        }
    }
}

function updatePath(path) {
    const bits = path.split(".");
    const base = bits.shift();
    const rest = bits.join(".");

    for (const bearer of HookBearers) {
        if (bearer._hookName !== base) continue;
        bearer._updateHook(rest, bearer[rest]);
    }
}

function autoHook(character) {
    HookBearers.push(character);
    return new Proxy(character, {
        set(target, k, v) {
            target[k] = v;
            if (target._hookTargets.includes(k)) target._updateHook(k, v);
            return true;
        }
    });
}

const player = autoHook(new Character());
