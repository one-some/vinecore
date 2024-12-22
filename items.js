regClass("item", class {
    name = "Unknown Item";
    description = "...";
    maxStack = 72;
    iconPath = "snake.png";
    actions = [];

    count = 0;

    consumeItem() {
        if (count <= 0) throw new Error("Can't use. Out");
        count--;
    }
});

regClass("weakHealthPotion", class extends classes.item{
    name = "Weak Health Potion";
    description = "A lesser-quality health aid. You can see some chunks floating through the murky substance.";
    maxStack = 16;
    iconPath = "potion.png";
    static actions = [{
        name: "Quaff",
        color: "gold",
        func: function() {
            this.consumeAction();
            gameGlobals.player.doDamage(-20);
        }
    }];
});
