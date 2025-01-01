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

    canStack(otherItem) {
        if (this.constructor !== otherItem.constructor) return false;
        return true;
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
            if (gameGlobals.player.atMaxHealth) {
                toastError("Won't drink", "I'm already at max health.");
                return;
            }

            this.consumeItem();
            gameGlobals.player.doDamage(-20);
        }
    }];
});

regClass("weakRemedy", class extends classes.item{
    static name = "Weak Remedy";
    static description = "Supposed to rid you of poison, but it's uncertain. It smells of sulfur.";
    static maxStack = 16;
    static iconPath = "potion.png";
    static actions = [{
        name: "Quaff",
        color: "gold",
        func: function() {
            if (!gameGlobals.player.conditions.poison) {
                toastError("Won't drink", "I'm not poisoned. I'd like to avoid this concoction if possible.");
                return;
            }

            this.consumeItem();
            delete gameGlobals.player.conditions.poison;
        }
    }];
});
