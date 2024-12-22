let selectedItem;
const itemContainer = $el("#item-container");

function updateInventoryListing() {
    itemContainer.innerHTML = "";

    for (let i = 0; i < gameGlobals.player.inventory.length; i++) {
        const item = gameGlobals.player.inventory[i];
        if (!selectedItem) selectedItem = item;

        const itemEl = $e("div", itemContainer, {classes: ["inv-item"]});
        $e("img", itemEl, {src: `img/${item.constructor.iconPath}`});
        const stats = $e("div", itemEl, {classes: ["item-stats"]});
        $e("span", stats, {innerText: item.constructor.name, classes: ["item-name"]});
        $e("span", stats, {innerText: `(x${String(item.count).padStart(2, "0")})`, classes: ["item-count"]});

        const itemRef = gameGlobals.player.inventory[i];

        itemEl.addEventListener("click", function() {
            $el(".inv-item.selected")?.classList.remove("selected");
            this.classList.add("selected");
            selectItem(itemRef);
        });

        if (itemRef === selectedItem) itemEl.click();
    }
}

hookModal("inventory", updateInventoryListing);

function selectItem(item) {
    selectedItem = item;
    $el("#item-desc").innerText = item.constructor.description;

    const actionContainer = $el("#item-actions");
    actionContainer.innerHTML = "";

    for (const action of item.constructor.actions) {
        const shortcut = "q";

        const actionEl = $e(
            "a",
            actionContainer,
            {
                innerText: `[${shortcut}] ${action.name}`,
                "style.color": action.color,
                "shortcut": shortcut,
            }
        );
        actionEl.addEventListener("click", function() {
            action.func.bind(item)();
            updateInventoryListing();
            refreshHooks();
        });
    }
}

updateInventoryListing();

$el("#toss-item").addEventListener("click", async function() {
    const item = gameGlobals.player.inventory[inventorySelection];
    const doDelete = await ynPrompt(`Really toss ${item.name}?`);
    // HACK
    showModal("inventory");
    if (!doDelete) return;

    gameGlobals.player.inventory = gameGlobals.player.inventory.filter((_, i) => i !== inventorySelection);
    updateInventoryListing();
});

document.addEventListener("keydown", function(event) {
    if (event.ctrlKey) return;
    if (event.key !== "I") return;
    if (!modalContainer.classList.contains("hidden")) return;
    showModal("inventory");
    event.preventDefault();
});
