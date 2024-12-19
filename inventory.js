let inventory = [
    {name: "Health Potion", count: 4, img: "potion.png"},
    {name: "Health Potion", count: 4, img: "potion.png"},
    {name: "Health Potion", count: 4, img: "potion.png"},
    {name: "Health Potion", count: 4, img: "potion.png"},
    {name: "Health Potion", count: 4, img: "potion.png"},
    {name: "Health Potion", count: 4, img: "potion.png"},
    {name: "Health Potion", count: 4, img: "potion.png"},
    {name: "Health Potion", count: 4, img: "potion.png"},
    {name: "Health Potion", count: 4, img: "potion.png"},
    {name: "Health Potion", count: 4, img: "potion.png"},
    {name: "Health Potion", count: 4, img: "potion.png"},
    {name: "Health Potion", count: 4, img: "potion.png"},
    {name: "Health Potion", count: 4, img: "potion.png"},
    {name: "Health Potion", count: 4, img: "potion.png"},
    {name: "Health Potion", count: 4, img: "potion.png"},
    {name: "Health Potion", count: 4, img: "potion.png"},
];

let inventorySelection = 0;
const itemContainer = $el("#item-container");

function updateInventoryListing() {
    itemContainer.innerHTML = "";

    for (let i = 0; i < inventory.length; i++) {
        const item = inventory[i];

        const itemEl = $e("div", itemContainer, {classes: ["inv-item"]});
        $e("img", itemEl, {src: `img/${item.img}`});
        const stats = $e("div", itemEl, {classes: ["item-stats"]});
        $e("span", stats, {innerText: item.name, classes: ["item-name"]});
        $e("span", stats, {innerText: `(x${String(item.count).padStart(2, "0")})`, classes: ["item-count"]});

        itemEl.addEventListener("click", function() {
            $el(".inv-item.selected")?.classList.remove("selected");
            this.classList.add("selected");
            inventorySelection = i;
        });

        if (i === inventorySelection) itemEl.click();
    }
}

updateInventoryListing();

$el("#toss-item").addEventListener("click", async function() {
    const item = inventory[inventorySelection];
    const doDelete = await ynPrompt(`Really toss ${item.name}?`);
    // HACK
    showModal("inventory");
    if (!doDelete) return;

    inventory = inventory.filter((_, i) => i !== inventorySelection);
    updateInventoryListing();
});

document.addEventListener("keydown", function(event) {
    if (event.ctrlKey) return;
    if (event.key !== "I") return;
    if (!modalContainer.classList.contains("hidden")) return;
    showModal("inventory");
    event.preventDefault();
});
