const stageEl = document.querySelector("passage-stage");
const bgEl = document.querySelector("#bg");

// We really need to just bite the bullet and parse
const linkRegex = /\[a (.*?)](.*?)\[\/a]/g;
const bgRegex = /\[bg (.*?)]/g;
const varRegex = /\[var (.*?)]/g;

let shortcuts = {};
let transitioning = false;

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randRange(start, end) {
    return start + (Math.random() * (end - start));
}

async function jumpTo(passageName) {
    if (transitioning) return;
    transitioning = true;

    if (!RawPassages[passageName]) throw new Error(`Bad passage ${passageName}`);

    let html = RawPassages[passageName];
    html = html.trim();
    html = html.replaceAll("\n", "<br>");
    shortcuts = {};
    const hackMap = {};

    for (const linkMatch of RawPassages[passageName].matchAll(linkRegex)) {
        const bits = linkMatch[1].split(" ");
        const name = bits[0];

        const options = {
            timePassed: 0
        };

        for (const bit of bits) {
            const [key, val] = bit.split(":");
            switch (key) {
                case "w":
                    if (isNaN(val)) throw new Error("Bad wait time");
                    options.timePassed = parseInt(val) * 60 * randRange(0.95, 1.05);
                    break;
            }
        }

        let text = linkMatch[2];
        if (!RawPassages[name]) throw new Error(`Bad passage ${name}`);

        // HACK: We're doing this instead of like parsing it all into elements random
        // TODO: Avoid collisions...
        const randomID = btoa(Math.random() * 100).slice(0, 12);
        html = html.replace(linkMatch[0], `<a id="${randomID}">${text}</a>`);

        for (let char of text) {
            char = char.toLowerCase();
            if (shortcuts[char]) continue;
            text += ` [${char}]`;
            shortcuts[char] = randomID;
            break;
        }

        hackMap[randomID] = function() {
            console.log(options);
            passTime(options.timePassed);
            jumpTo(name);
        };
    }

    for (const bgMatch of RawPassages[passageName].matchAll(bgRegex)) {
        bgEl.src = `bg/${bgMatch[1]}.png`;
        html = html.replace(bgMatch[0], "");
    }

    for (const varMatch of RawPassages[passageName].matchAll(varRegex)) {
        const path = varMatch[1];
        html = html.replace(varMatch[0], `<span hook="${path}"></span>`);
    }

    stageEl.style.opacity = 0.0;
    await timeout(210);
    stageEl.innerHTML = html;
    
    for (const [id, func] of Object.entries(hackMap)) {
        stageEl.querySelector("#" + id).addEventListener("click", func);
    }

    // HACK:
    refreshHooks();
    // for (const varMatch of RawPassages[passageName].matchAll(varRegex)) {
    //     const path = varMatch[1];
    //     updatePath(path);
    // }

    stageEl.style.opacity = 1.0;
    await timeout(210);
    transitioning = false;
}

jumpTo(Array.from(Object.keys(RawPassages))[0]);

document.addEventListener("keydown", function(event) {
    const key = event.key.toLowerCase();
    const el = document.querySelector("#" + shortcuts[key]);

    if (!el) return;

    event.preventDefault();
    el.click();
});
