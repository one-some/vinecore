function battleLog(text) {
    gameGlobals.battleState.log.push({text: text});
}

function startBattle() {
    gameGlobals.battleState.enemies = [new classes.snake()];

    gameGlobals.battleState.log = [];
    battleLog("You leap into battle!");
    for (const enemy of gameGlobals.battleState.enemies) {
        enemy.battleNoise();
    }
}

function checkBattleEnd() {
    if (gameGlobals.player.dead) return battleEnd(false);
    if (!gameGlobals.battleState.enemies.filter(x => !x.dead).length) return battleEnd(true);
}

function battleEnd(won) {
    battleLog(won ? "You win!" : "You lost!");
    gameGlobals.battleState.wonBattle = won;
    gameGlobals.battleState.inBattle = false;
}

function battleSlap() {
    const enemy = gameGlobals.battleState.enemies[0];
    enemy.doDamage(2);
    battleLog(enemy.lang("You slap Bob. Ouch."));
    checkBattleEnd();
    battleEndTurn();
}

function battleEndTurn() {
    const enemy = gameGlobals.battleState.enemies[0];
    enemy.attack(gameGlobals.player);
    checkBattleEnd();

    const battleGuys = [gameGlobals.player, ...gameGlobals.battleState.enemies];

    for (const guy of battleGuys) {
        if (guy.conditions.poison) {
            const poisonDamage = Math.floor(guy.conditions.poison.level * randRange(5, 10));
            const msg = randChoice([
                "Bob coughs up red speckles onto his hand",
                "A pale blue floods Bob's face",
                "Bob seems unsturdy on his feet",
            ]);

            battleLog(guy.lang(`${msg}... Bob takes ${poisonDamage} poison damage.`));
            guy.doDamage(poisonDamage);
        }
    }
}

VarHooks.push(function() {
    const logCont = $el("battle-log");
    if (!logCont) return;

    logCont.innerHTML = "";
    for (const msg of gameGlobals.battleState.log) {
        $e("log-entry", logCont, {innerText: msg.text}).scrollIntoView();
    }

    const battleStage = $el("#battle-stage");
    battleStage.innerHTML = "";

    for (const enemy of gameGlobals.battleState.enemies) {
        const guy = $e("battle-guy", battleStage);
        $e("span", guy, {classes: ["name"], innerText: enemy.name});
        $e("img", guy, {src: "img/snake.png"});

        // Clammmmp
        enemy.health = Math.max(0, Math.min(enemy.maxHealth, enemy.health));

        const healthBar = $e("bar", guy, {classes: ["health"]});
        const healthBarInner = $e(
            "bar-inner",
            healthBar,
            {"style.width": (enemy.health / enemy.maxHealth * 100) + "%"}
        );
        const healthBarText = $e(
            "span",
            healthBar,
            {innerText: `${enemy.health} / ${enemy.maxHealth} HP`}
        );
    }
});

