import { system, world } from "@minecraft/server"

const overworld = world.getDimension("overworld")

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

// use of tags here is a hack
// would be better to parse target selector to EntityQueryOptions
system.afterEvents.scriptEventReceive.subscribe(data => {
    switch (data.id) {
        case "tcz:rename":
            let args = data.message.split("|")
            let selector = "@" + args[0]
            let name = args[1]
            let tag = "t" + Math.random().toString()
            data.sourceEntity.runCommand("tag " + selector + " add " + tag)
            let targets = overworld.getEntities().filter(x => x.hasTag(tag))
            targets.forEach(target => {
                target.nameTag = name
            })
            data.sourceEntity.runCommand("tag " + selector + " remove " + tag)
            break
        default: break
    }
})