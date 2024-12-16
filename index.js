const stageEl = document.querySelector("passage-stage");
const bgEl = document.querySelector("#bg");

let shortcuts = {};
let transitioning = false;

const execState = {
    nodes: [],
    nodeIndex: 0,
    container: null
};

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randRange(start, end) {
    return start + (Math.random() * (end - start));
}

function parseIncNode() {
    return parseTag(execState.nodes[++execState.nodeIndex].content);
}

function execNode() {
    const node = execState.nodes[execState.nodeIndex];

    // Insert text with HTML
    if (node.type === "text") {
        execState.container.insertAdjacentHTML(
            "beforeend",
            node.content.replaceAll("\n", "<br>")
        );
        return;
    }

    const tag = parseTag(node.content);

    // QUESTIONABLE: "if" the only eating-style tag so this is rly specific
    if (tag.name === "if") {
        if (!tag.kv["criteria"]) throw new Error("Expected CRITERIA for if!");
        const good = eval(tag.kv["criteria"]);

        console.log(good);
        if (good) {
            // Condition passed: run until else statement.
            while (true) {
                const nodeName = parseIncNode().name;
                // If done, we're JUST done.
                if (nodeName === "/if") return;
                // If else, ...[1]
                if (nodeName === "else") break;

                // Otherwise run the node
                execNode();
            }

            // [1]...skip until end.
            while (parseIncNode().name != "/if") {}
        } else {
            // Condition failed: skip to else statement...
            while (true) {
                const nodeName = parseIncNode().name;
                if (nodeName === "/if") return;
                if (nodeName === "else") break;
            }

            // ...then run until end
            while (parseIncNode().name !== "/if") execNode();
        }
    }

    processTag(tag, execState.container);
}

function parseTag(tagText) {
    let bits = [""];
    const kv = {}
    let inQuote = false;

    for (let i = 0; i < tagText.length; i++) {
        const char = tagText[i];
        if (char === '"') inQuote = !inQuote;

        if (char === " " && !inQuote) {
            bits.push("");
            continue;
        }
        bits[bits.length - 1] += char;
    }

    for (const bit of bits) {
        let [first, ...rest] = bit.split(":");
        rest = rest.join(":");

        // FIXME: Only on first and last...... but it wont support it anyway
        val = rest.replaceAll('"', "");

        // If KV val starts with $, treat it as a var path to eval
        val = val.startsWith("$") ? getGameVar(val.slice(1)) : val;
        kv[first] = val;
    }

    bits = bits.filter(x => !x.includes(":"));

    return {
        name: bits.shift(),
        bits: bits,
        kv: kv
    };
}

function processTag(tag, container) {
    switch (tag.name) {
        case "condition":
            const cond = Conditions[tag.bits[0]];
            if (!cond) throw new Error("Bad condition!");
            gameGlobals.player.conditions[cond] = { fromEnv: true }
            break;
        case "bg":
            bgEl.src = `bg/${tag.bits[0]}.png`;
            break;
        case "var":
            $e("span", container, {hook: tag.bits[0]});
            break;
        case "a":
            if (!tag.kv["text"]) throw new Error("Expected anchor to have text");
            const anchor = $e("a", container, {innerText: tag.kv["text"]});

            if (tag.kv["time"]) {
                const minutes = parseInt(tag.kv["time"]);
                anchor.innerText += ` [${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}]`;
            }

            for (let char of tag.kv["text"]) {
                char = char.toLowerCase();
                if (shortcuts[char]) continue;
                anchor.innerText += ` [${char}]`;
                shortcuts[char] = anchor;
                break;
            }

            anchor.addEventListener("click", function() {
                if (tag.kv["script"]) {
                    eval(tag.kv["script"]);

                    if (tag.kv["refresh"] !== "no") {
                        jumpTo(
                            gameGlobals.currentPassage,
                            { instant: tag.kv["refresh"] === "instant" }
                        );
                    }
                }

                if (tag.kv["time"]) passTime(parseInt(tag.kv["time"]) * 60 * randRange(0.9, 1.1));

                if (tag.kv["goto"]) {
                    let goto = tag.kv["goto"];
                    
                    if (goto.startsWith("$")) goto = getGameVar(goto.slice(1));

                    if (!goto) throw new Error("Won't jump to null passage!");
                    jumpTo(goto);
                }

                refreshHooks();
            });

            break;
    }
}

function battleLog(text) {
    gameGlobals.battleState.log.push({text: text});
}

function startBattle() {
    gameGlobals.battleState.log = [];
    battleLog("You leap into battle!");
    for (const enemy of gameGlobals.battleState.enemies) {
        enemy.battleNoise();
    }
}

async function jumpTo(passageName, {instant = false}={}) {
    // Early checks
    if (transitioning) return;
    transitioning = true;
    if (!RawPassages[passageName]) throw new Error(`Bad passage ${passageName}`);

    // Just getting into battle...? Setup battle state of course!
    if (passageName === "battle" && gameGlobals.currentPassage !== "battle") {
        startBattle();
        gameGlobals.battleState.inBattle = true;
        gameGlobals.battleState.battleReturnLocation = gameGlobals.currentPassage;
    } else if (passageName === "battle") {
        // If we're just doing battle script stuff, don't show refresh animation
        instant = true;
    }

    // Update passage state
    gameGlobals.currentPassage = passageName;
    gameGlobals.passageHistory.push(passageName);
    gameGlobals.passageHistory = gameGlobals.passageHistory.slice(-30);



    // Remove old conditions from the player's previous environment (ie hot from desert). These will
    // be re-applied if needed soon...
    for (const [condName, condInstDat] of Object.entries(gameGlobals.player.conditions)) {
        if (condInstDat.fromEnv) delete gameGlobals.player.conditions[condName];
    }

    shortcuts = {};

    // Parse text into nodes (ie "in brackets" or not)
    let nodes = [{type: "text", content: ""}];
    for (const char of RawPassages[passageName].trim()) {
        if (char === "[") {
            nodes.push({type: "tag", content: ""});
            continue;
        } else if (char === "]") {
            nodes.push({type: "text", content: ""});
            continue;
        }

        nodes.at(-1).content += char;
    }

    // Get rid of empty nodes
    nodes = nodes.filter(x => x.content);

    // Trim starting newlines...ignoring tags
    let hitText = false;
    nodes = nodes.filter(function(node) {
        // Ignore tags
        if (node.type !== "text") return true;

        // If we're on our first "real text"...
        if (node.content.trim() && !hitText) {
            hitText = true;

            // Trim leading newlines from the first text node
            while (node.content && node.content[0] == "\n") {
                node.content = node.content.slice(1);
            }
        }

        // Keep the node if we've hit our first real text
        return hitText;
    });

    const container = $e("passage", null, {passage: passageName});
    execState.nodes = nodes;
    execState.container = container;
    execState.nodeIndex = 0;

    for (execState.nodeIndex = 0; execState.nodeIndex < execState.nodes.length; execState.nodeIndex++) {
        execNode(container);
    }

    if (!instant) {
        stageEl.style.opacity = 0.0;
        await timeout(210);
    }

    stageEl.innerHTML = "";
    stageEl.appendChild(container);

    for (const el of document.querySelectorAll("[criteria]")) {
        const visible = eval(el.getAttribute("criteria"));
        el.classList.toggle("hidden", !visible);
    }

    refreshHooks();

    if (passageName === "battle") startBattle();

    stageEl.style.opacity = 1.0;
    await timeout(210);
    transitioning = false;
}
jumpTo(gameGlobals.currentPassage, {instant: true});

document.addEventListener("keydown", function(event) {
    if (event.ctrlKey) return;

    const key = event.key.toLowerCase();
    if (!shortcuts[key]) return;

    event.preventDefault();
    shortcuts[key].click();
});
