enum Damage {
    //% block="by projectile"
    Shot,
    //% block="with wand"
    Hit
}

function subscribe(multi: boolean, message: string, func: () => void) {
    if (multi) {
        player.onTeleported(func)
    } else {
        player.onTellCommand(message, func)
    }
}

//% weight=66 color=#333333 icon="\uf0d0"
namespace modded {

    //% block="give %target=minecraftTarget a wand"
    //% group=Wand weight=90
    export function give(target: TargetSelector) {
        player.execute(`give ${target} tcz:wand`)
    }

    //% block="multiplayer %toggle=toggleOnOff" //% blockId=multiplayerToggle
    //% blockHidden=true
    export function multiplayer(toggle: boolean): boolean {
        return toggle
    }

    //% block="on $target hit $damage %multi=multiplayerToggle"
    //% group=Wand weight=80
    //% draggableParameters
    export function onDamage(damage: Damage, multi: boolean, handler: (target: TargetSelector) => void) {
        player.execute(`scriptevent tcz:multiplayer ${multi}`)
        let dmg = damage ? "hit" : "shot"
        let tag = `_${dmg}_by_${player.name()}`
        let tar = mobs.target(ALL_ENTITIES)
        tar.addRule("tag", tag)
        player.execute(`tag @e remove ${tag}`)
        subscribe(multi, dmg, function () {
            handler(tar)
            player.execute(`tag @e remove ${tag}`)
        })
    }

    //% block="rename %target=minecraftTarget to $name"
    //% group=Other
    export function rename(target: TargetSelector, name: string): void {
        let results = mobs.queryTarget(target)
        if (results.length > 0) {
            player.execute(`scriptevent tcz:rename ${results[0].uniqueId}|${name}`)
        }
    }

}