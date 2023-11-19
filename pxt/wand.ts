enum Damage {
    //% block="shot"
    Shot,
    //% block="hit"
    Hit
}

//% weight=100 color=#333333 icon="\uf0d0"
namespace wand {

    //% block="on $target $damage"
    //% draggableParameters
    export function onDamage(damage: Damage, handler: (target: TargetSelector) => void) {
        let dmg = damage == Damage.Shot ? "shot" : "hit"
        let tag = dmg + "_by_" + player.name()
        let tar = mobs.target(ALL_ENTITIES)
        tar.addRule("tag", tag)
        player.onTellCommand(dmg, function () {
            handler(tar);
            player.execute("tag @e remove " + tag)
        })
    }
    
}