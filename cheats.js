const cmdScreen = $el("cmd-screen");
const cmdBar = $el("#cmd-bar");
const cmdLog = $el("#cmd-log");
const cmdHistory = [];
let cmdRel = 0;

const commands = {
    "give": {
        name: "give",
        args: {
            "item": {
                possible: Object.entries(classes)
                    .filter(x => x[1].prototype instanceof classes.item)
                    .map(x => x[0]),
            }
        }
    }
}

function log(text, error=false) {
    (error ? console.error : console.log)(text);
    $e("span", cmdLog, {innerText: text, classes: error ? ["error"] : []});
}

function parseCommand(string) {
    const bits = [""];

    for (let i=0; i < string.length; i++) {
        if (string[i] === '"') {
            i++;
            while (string[i] && string[i] !== '"') {
                bits[bits.length - 1] += string[i++];
            }
            continue;
        }

        if (string[i] === " ") {
            bits.push("");
            continue;
        }

        bits[bits.length - 1] += string[i];
    }

    return {
        command: bits.shift(),
        bits: bits
    };
}

function runCommand(string) {
    if (!string) return;
    const {command, bits} = parseCommand(string)
    cmdHistory.push(string)

    const cmdData = commands[command];
    if (!cmdData) {
        log(`Command '${command}' does not exist.`, true);
        return;
    }

    const args = {};
    for (let i=0; i<bits.length; i++) {
        args[Object.keys(cmdData.args)[i]] = bits[i];
    }

    log("> " + string);
    switch (command) {
        case "give":
            const item = classes[args.item];
            if (!item) throw new Error("Bad item");

            log(`Gave ${item.name} (x${item.maxStack})`);

            const itemInst = new item();
            itemInst.count = item.maxStack;
            gameGlobals.player.addItem(itemInst);

            break;
    }
}

function showHistory(delta) {
    if (cmdRel + delta > 0) return;

    if (cmdRel + delta === 0) {
        cmdRel = 0;
        cmdBar.value = "";
        return;
    }

    if (!cmdHistory.at(cmdRel + delta)) return;
    cmdRel += delta;
    cmdBar.value = cmdHistory.at(cmdRel);
}

function autoComplete(string) {
    const {command, bits} = parseCommand(string);
    if (!commands[command]) return;

    const activeArg = Object.values(commands[command].args)[Math.max(bits.length - 1, 0)];
    if (!activeArg) return;

    const lastBit = bits.at(-1);
    const possibles = activeArg.possible.filter(x => x.startsWith(lastBit));

    if (!possibles.length) return;

    if (possibles.length === 1) {
        bits[bits.length - 1] = possibles[0];
        return [command, ...bits].join(" ");
    }

    log(":    :");

    for (const possible of possibles) {
        log(`    ${possible}`);
    }

    return [command, ...bits.slice(0, -1), commonStart(possibles)].join(" ");
}

cmdBar.addEventListener("keydown", function(event) {
    if (event.key === "`") return;
    event.stopImmediatePropagation();

    switch (event.key) {
        case "Enter":
            runCommand(this.value);
            this.value = "";
            cmdRel = 0;
            break;
        case "ArrowUp":
            showHistory(-1);
            break;
        case "ArrowDown":
            showHistory(1);
            break;
        case "Tab":
            this.value = autoComplete(this.value) || this.value;
            break;
        default:
            return;
    }
    event.preventDefault();
});

cmdBar.addEventListener("blur", function() {
    if (cmdScreen.classList.contains("hidden")) return;
    setTimeout(() => cmdBar.focus(), 10);
});

document.addEventListener("keydown", function(event) {
    if (event.key !== "`") return;
    event.preventDefault();

    cmdBar.value = "";
    cmdScreen.classList.toggle("hidden");
    if (!cmdScreen.classList.contains("hidden")) cmdBar.focus();
});
