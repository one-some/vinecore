regClass("item", class {
    static name = "Unknown Item";
    static description = "...";
    static maxStack = 72;
    static iconPath = "snake.png";
    static actions = [];

    count = 1;

    consumeItem() {
        if (this.count <= 0) throw new Error("Can't use. Out");
        this.count--;
    }
});

regClass("weakHealthPotion", class extends classes.item{
    static name = "Weak Health Potion";
    static description = "A lesser-quality health aid. You can see some chunks floating through the murky substance.";
    static maxStack = 16;
    static iconPath = "potion.png";
    static actions = [{
        name: "Quaff",
        color: "gold",
        func: function() {
            this.consumeItem();
            gameGlobals.player.doDamage(-20);
        }
    }];
});
