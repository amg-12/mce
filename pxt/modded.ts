enum Damage {
    //% block="shot"
    Shot,
    //% block="hit"
    Hit
}

//% weight=66 color=#333333 icon="\uf0d0"
namespace modded {

    //% block="on $target $damage"
    //% group=Wand
    //% draggableParameters
    export function onDamage(damage: Damage, handler: (target: TargetSelector) => void) {
        let dmg = damage ? "hit" : "shot"
        let tag = dmg + "_by_" + player.name()
        let tar = mobs.target(ALL_ENTITIES)
        tar.addRule("tag", tag)
        player.onTellCommand(dmg, function () {
            handler(tar)
            player.execute("tag @e remove " + tag)
        })
    }

    //% block="rename %target=minecraftTarget to $name"
    //% group=Other
    export function rename(target: TargetSelector, name: string): void {
        player.execute("scriptevent tcz:rename " + target.toString().slice(1) + "|" + name)
    }

}