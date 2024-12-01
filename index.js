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

async function jumpTo(passageName) {
    if (transitioning) return;
    transitioning = true;

    if (!RawPassages[passageName]) throw new Error(`Bad passage ${passageName}`);

    let html = RawPassages[passageName];
    html = html.trim();
    html = html.replaceAll("\n", "<br>");
    shortcuts = {};

    for (const linkMatch of RawPassages[passageName].matchAll(linkRegex)) {
        const name = linkMatch[1];
        let text = linkMatch[2];
        if (!RawPassages[name]) throw new Error(`Bad passage ${name}`);

        for (let char of text) {
            char = char.toLowerCase();
            if (shortcuts[char]) continue;
            text += ` [${char}]`;
            shortcuts[char] = name;
            break;
        }

        html = html.replace(linkMatch[0], `<a onclick="jumpTo('${name}')">${text}</a>`);
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
    const passage = shortcuts[key];

    if (!passage) return;

    event.preventDefault();
    jumpTo(passage);
});
