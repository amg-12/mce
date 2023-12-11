import { system, world, Player, EntityInventoryComponent } from "@minecraft/server"

const overworld = world.getDimension("overworld")

let multiplayer = false

function sendEvent(player: Player, message: string) {
    if (multiplayer) {
        player.teleport(player.location)
    } else {
        player.runCommand(`w @s ${message}`)
    }
}

world.afterEvents.playerSpawn.subscribe(data => {
    data.player.getTags().filter(x => x[0] == "_").forEach(tag => {
        data.player.removeTag(tag)
    })
})

world.afterEvents.entityHurt.subscribe(data => {
    let player = data.damageSource.damagingEntity as Player
    if (player.typeId == "minecraft:player") {
        let cause = data.damageSource.cause
        let inventory = (player.getComponent('inventory') as EntityInventoryComponent).container
        let weapon = inventory.getItem(player.selectedSlot).typeId
        // let projectile = data.damageSource.damagingProjectile.typeId
        // projectile must persist in order to be checked
        if (cause == "projectile") {
            data.hurtEntity.addTag(`_shot_by_${player.name}`)
            sendEvent(player, "shot")
        } else if (cause == "entityAttack" && weapon == "tcz:wand") {
            data.hurtEntity.addTag(`_hit_by_${player.name}`)
            sendEvent(player, "hit")
        }
    }
})

system.afterEvents.scriptEventReceive.subscribe(data => {
    let player = data.sourceEntity as Player
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
                    overworld.runCommand(`say multiplayer: ${multiplayer}`)
                    break
            }
            break
        case "tcz:rename":
            let args = data.message.split("|")
            world.getEntity(args[0]).nameTag = args[1]
            break
        default:
            overworld.runCommand(`w ${player.name} no scriptevent named ${data.id}`)
    }
})