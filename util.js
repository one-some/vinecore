function $e(tag, parent, attributes, insertionLocation = null) {
    let element = document.createElement(tag);

    if (!attributes) attributes = {};

    if ("classes" in attributes) {
        if (!Array.isArray(attributes.classes)) throw Error("Classes was not array!");
        for (const className of attributes.classes) {
            element.classList.add(className);
        }
        delete attributes.classes;
    }

    for (const [attribute, value] of Object.entries(attributes)) {
        if (attribute.includes(".")) {
            let ref = element;
            const parts = attribute.split(".");

            for (const part of parts.slice(0, -1)) {
                ref = ref[part];
            }

            ref[parts[parts.length - 1]] = value;
            continue;
        }

        if (attribute in element) {
            element[attribute] = value;
        } else {
            element.setAttribute(attribute, value);
        }
    }

    if (!parent) return element;

    if (insertionLocation && Object.keys(insertionLocation).length) {
        let [placement, target] = Object.entries(insertionLocation)[0];
        if (placement === "before") {
            parent.insertBefore(element, target);
        } else if (placement === "after") {
            parent.insertBefore(element, target.nextSibling);
        } else {
            throw Error(`Bad placement ${placement}`);
        }
    } else {
        parent.appendChild(element);
    }

    return element;
}

function $el(s) { return document.querySelector(s); }

function $table(rows, parent, attributes = {}) {
    const t = $e("table", parent, attributes);
    const body = $e("tbody", t);

    for (const [i, rowData] of Object.entries(rows)) {
        let rowAttr = {};

        // Squint equality as i is a string
        if (i == 0) rowAttr["classes"] = ["column-header"]

        const rowEl = $e("tr", body, rowAttr);
        for (const speckOfData of rowData) {
            $e("td", rowEl, { innerText: speckOfData });
        }
    }

    return t;
}

function toRoman(num) {
    // https://stackoverflow.com/a/37723879
    const roman = {
        M: 1000,
        CM: 900,
        D: 500,
        CD: 400,
        C: 100,
        XC: 90,
        L: 50,
        XL: 40,
        X: 10,
        IX: 9,
        V: 5,
        IV: 4,
        I: 1
    };
    let str = "";

    for (let i of Object.keys(roman)) {
        const q = Math.floor(num / roman[i]);
        num -= q * roman[i];
        str += i.repeat(q);
    }

    return str;
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randRange(start, end) {
    return start + (Math.random() * (end - start));
}

function randChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randOneIn(n) {
    return Math.random() < (1 / n);
}

function commonStart(strings){
    // https://stackoverflow.com/a/1917041
    
    // Clever!
    const sorted = strings.concat().sort();

    let a1 = sorted[0]
    let a2 = sorted.at(-1);
    let a1Length = a1.length;
    let i = 0;
    while (i < a1Length && a1.charAt(i) === a2.charAt(i)) i++;
    return a1.substring(0, i);
}

function lerpColors(j, k, blend) {
    const r = ((j >> 16) * blend) + ((k >> 16) * (1 - blend));
    const g = ((j >> 8) * blend) + ((k >> 8) * (1 - blend));
    const b = (j * blend) + (k * (1 - blend));
    return (r << 16) | (g << 8) | b;
}

function lerpColorMap(point, colorMap) {
    // colorMap: [ [pointKey, rgbVal] ]

    let first;
    let last;
    for (const colorKv of colorMap.sort((a, b) => a[0] - b[0])) {
        if (colorKv[0] > point) {
            last = colorKv;
            break;
        }
        first = colorKv;
    }

    if (!last) return first[1];

    const normBlend = (point - first[0]) / (last[0] - first[0]);
    console.log(point, first, last, normBlend);
    return lerpColors(first[1], last[1], 1 - normBlend);
}
