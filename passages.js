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

[if criteria:"Math.random() < 0.5"]
HII
    [a script:"gameGlobals.player.money += 10" text:"You see a dolar...."]
    Hello
[/if]
`
};
