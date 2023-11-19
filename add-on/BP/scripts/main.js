import { world } from "@minecraft/server"

world.afterEvents.entityHurt.subscribe(data => {
    let name = data.damageSource.damagingEntity.nameTag
    switch (data.damageSource.cause) {
        case "projectile":
            data.hurtEntity.addTag("shot_by_" + name)
            data.hurtEntity.runCommand("w " + name + " shot")
            break
        case "entityAttack":
            data.hurtEntity.addTag("hit_by_" + name)
            data.hurtEntity.runCommand("w " + name + " hit")
            break
        default: break
    }
})