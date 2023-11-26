import { system, world } from "@minecraft/server"

const overworld = world.getDimension("overworld")

let multiplayer = false

function sendEvent(player, message) {
    if (multiplayer) {
        player.teleport(player.location)
    } else {
        player.runCommand("w @s " + message)
    }
}

world.afterEvents.entityHurt.subscribe(data => {
    let player = data.damageSource.damagingEntity
    let cause = data.damageSource.cause
    let weapon = player.getComponent('inventory').container.getItem(player.selectedSlot).typeId
    // let projectile = data.damageSource.damagingProjectile.typeId
    // projectile must persist in order to be checked
    if (cause == "projectile") {
        data.hurtEntity.addTag("shot_by_" + player.name)
        sendEvent(player, "shot")
    } else if (cause == "entityAttack" && weapon == "tcz:wand") {
        data.hurtEntity.addTag("hit_by_" + player.name)
        sendEvent(player, "hit")
    }
})

system.afterEvents.scriptEventReceive.subscribe(data => {
    switch (data.id) {
        case "tcz:multiplayer":
            switch (data.message) {
                case "true":
                    multiplayer = true
                    break
                case "false":
                    multiplayer = false
                    break
                default:
                    overworld.runCommand("say multiplayer: " + multiplayer)
                    break
            }
            break
        case "tcz:rename":
            let args = data.message.split("|")
            world.getEntity(args[0]).nameTag = args[1]
            break
        default:
            overworld.runCommand("w " + data.sourceEntity.name + " no scriptevent named " + data.id)
    }
})