import { system, world, Player, EntityInventoryComponent, BlockPermutation } from "@minecraft/server"
import { getArgs, ArrayType, Vector3Type } from "./parser"

const overworld = world.getDimension("overworld")

let multiplayer = false

function sendEvent(player: Player, message: string) {
    if (multiplayer) {
        player.teleport(player.location)
    } else {
        player.runCommand(`w @s ${message}`)
    }
}

function getEntities(ids: string[]) {
    let result = []
    ids.forEach(id => {
        try {
            result.push(world.getEntity(id))
        } catch { }
    })
    return result
}

world.afterEvents.playerSpawn.subscribe(data => {
    data.player.getTags().filter(x => x[0] == "_").forEach(tag => {
        data.player.removeTag(tag)
    })
})

world.afterEvents.entityHurt.subscribe(data => {
    const player = data.damageSource.damagingEntity
    if (player instanceof Player) {
        const cause = data.damageSource.cause
        const inventory = (player.getComponent('inventory') as EntityInventoryComponent).container
        const weapon = inventory.getItem(player.selectedSlot).typeId
        // const projectile = data.damageSource.damagingProjectile.typeId
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
    overworld.runCommand(`say received ${data.message}`)
    try {
        switch (data.id) {
            case "tcz:multiplayer":
                if (data.message) {
                    [multiplayer] = getArgs(data.message, Boolean)
                } else {
                    overworld.runCommand(`say multiplayer: ${multiplayer}`)
                }
                break
            case "tcz:rename":
                const [ids, name] = getArgs(data.message, ArrayType(String), String)
                getEntities(ids).forEach(entity => entity.nameTag = name)
                break
            case "tcz:test":
                const [coors, block] = getArgs(data.message, ArrayType(Vector3Type), String)
                coors.forEach(coor => {
                    overworld.getBlock(coor).setPermutation(BlockPermutation.resolve(block))
                })
                break
            default:
                throw new Error(`no scriptevent named ${data.id}`)
        }
    } catch (err: unknown) {
        if (err instanceof Error) {
            overworld.runCommand(`say ${err.message}`)
        }
    }

})