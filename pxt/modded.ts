enum Damage {
    //% block="by projectile"
    Shot,
    //% block="with wand"
    Hit
}

//% weight=66 color=#333333 icon="\uf0d0"
namespace modded {

    export function subscribe(multi: boolean, message: string, func: () => void) {
        if (multi) {
            player.onTeleported(func)
        } else {
            player.onTellCommand(message, func)
        }
    }

    //% block="on $target hit $damage, multiplayer %multi=toggleOnOff"
    //% group=Wand weight=80
    //% draggableParameters
    export function onDamage(damage: Damage, multi: boolean, handler: (target: TargetSelector) => void) {
        player.execute("scriptevent tcz:multiplayer " + multi)
        let dmg = damage ? "hit" : "shot"
        let tag = dmg + "_by_" + player.name()
        let tar = mobs.target(ALL_ENTITIES)
        tar.addRule("tag", tag)
        subscribe(multi, dmg, function () {
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