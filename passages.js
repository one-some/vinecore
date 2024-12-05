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

[a goto:desert text:"Walk to the forest" time:20]

[a goto:battle text:"Fight"]

[if criteria:"Math.random() < 0.5"]
    A glint catches your eye. A coin lays in the sand.
    [a script:"gameGlobals.player.money += 10" text:"Pick up coin"]
[/if]
`,
battle: `
Let's fight.
[a goto:$battleState.battleReturnLocation text:"run"]
`
};
