const RawPassages = {
desert: `
[condition HOT]
[bg desert]
You walk to the desert.

time is : [var time]
A animal say: Hello, [var player.name]

[a goto:forest time:20 text:"Walk to the forest"]`,
forest: `
[bg forest]
Welcome toooo the forest

[a goto:desert text:"Walk to the desert" time:20]

[a goto:battle text:"Fight"]

[if criteria:"Math.random() < 0.5"]
    A glint catches your eye. A coin lays in the sand.
    [a script:"gameGlobals.player.money += 10" text:"Pick up coin"]
[/if]
`,
battle: `
<div id="battle-stage">
    <battle-guy>
        <span class="name">Snake</span>
        <img src="img/snake.png">
    </battle-guy>
</div>
<battle-log></battle-log>
[if criteria:"gameGlobals.battleState.inBattle"]
    [a goto:$battleState.battleReturnLocation text:"Run"]
    <div id="battle-choices"></div>
[else]
    [if criteria:"gameGlobals.battleState.wonBattle"]
        You win.
        [a goto:$battleState.battleReturnLocation text:"Claim junk."]
    [else]
        A groan escapes your chest and you feel your chest topple to the ground.
        [a goto:dead text:"Die"]
    [/if]
[/if]
`,
dead: `
You've died. Let's get you back on your feet.
[a script:"gameGlobals.player.doDamage(-gameGlobals.player.maxHealth * randRange(0.5, 0.9))" goto:$lastLegitPassage time:1292 text:"Your eyes slip open after some time..."]
`
};
