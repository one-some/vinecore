const stageEl = document.querySelector("passage-stage");
const bgEl = document.querySelector("#bg");

let shortcuts = {};
let transitioning = false;

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randRange(start, end) {
    return start + (Math.random() * (end - start));
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
        kv[first] = rest.replaceAll('"', "");
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
                    jumpTo(gameGlobals.currentPassage);
                }

                if (tag.kv["time"]) passTime(parseInt(tag.kv["time"]) * 60 * randRange(0.9, 1.1));

                if (tag.kv["goto"]) jumpTo(tag.kv["goto"]);
                refreshHooks();
            });

            break;
    }
}

async function jumpTo(passageName) {
    if (transitioning) return;
    transitioning = true;

    if (!RawPassages[passageName]) throw new Error(`Bad passage ${passageName}`);

    gameGlobals.currentPassage = passageName;

    const container = $e("div");

    let html = RawPassages[passageName];
    html = html.trim();

    shortcuts = {};
    const hackMap = {};

    let nodes = [
        {type: "text", content: ""}
    ];

    for (const char of html) {
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

    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].type === "text") {
            container.insertAdjacentHTML("beforeend", nodes[i].content.replaceAll("\n", "<br>"));
            continue;
        }

        const tag = parseTag(nodes[i].content);
        if (tag.name === "if") {
            if (!tag.kv["criteria"]) throw new Error("Expected CRITERIA for if!");
            const good = eval(tag.kv["criteria"]);
            if (good) continue;

            // If the condition is false, skip until closing statement
            while (parseTag(nodes[++i].content).name != "/if") {}
        }

        processTag(tag, container);
    }

    stageEl.style.opacity = 0.0;
    await timeout(210);
    stageEl.innerHTML = "";
    stageEl.appendChild(container);

    for (const el of document.querySelectorAll("[criteria]")) {
        const visible = eval(el.getAttribute("criteria"));
        el.classList.toggle("hidden", !visible);
    }

    refreshHooks();

    stageEl.style.opacity = 1.0;
    await timeout(210);
    transitioning = false;
}

jumpTo(Array.from(Object.keys(RawPassages))[0]);

document.addEventListener("keydown", function(event) {
    const key = event.key.toLowerCase();
    if (!shortcuts[key]) return;

    event.preventDefault();
    shortcuts[key].click();
});
