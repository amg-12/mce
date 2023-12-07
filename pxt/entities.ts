enum StringRule {
    //% block="min radius" rm
    MinRadius,
    //% block="max radius" r
    MaxRadius,
    //% block="tag"
    Tag,
    //% block="name"
    Name,
    //% block="type"
    Type,
    //% block="family"
    Family,
    //% block="gamemode" m
    Gamemode,
    //% block="limit" c
    Limit
}

enum PosRule {
    //% block="from" x,y,z
    From,
    //% block="to" dx,dy,dz
    To
}

enum ItemRule {
    //% block="has item"
    HasItem,
    //% block="holding"
    Holding,
    //% block="not holding"
    NotHolding
}

type Rule = {
    name: string
    value: string
}

// totally not an array (shadows can't be arrays)
type Rules = {
    content: Rule[]
}

//% weight=65 color=#764bcc icon="\uf06c"
namespace entities {

    // --- Queries ---

    //% block
    //% group=Queries
    //% target.shadow=minecraftTarget
    export function positionOf(target: TargetSelector): Position {
        let results = mobs.queryTarget(target)
        if (results.length > 0) {
            let entity = results[0]
            return world(Math.floor(entity.x), Math.floor(entity.y), Math.floor(entity.z))
        } else {
            return world(0, 0, 0)
        }
    }

    // --- Selectors ---

    //% block blockId=nearestEntity
    //% group=Selectors weight=90
    export function nearestEntity(): TargetSelector {
        let target = mobs.target(ALL_ENTITIES)
        target.addRule("name", "!" + player.name())
        target.addRule("c", "1")
        target.addRule("type", "!item")
        return target
    }

    //% block="select $target with $r1|| and $r2 and $r3 and $r4 and $r5 and $r6 and $r7 and $r8 and $r9"
    //% group=Selectors weight=80
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% target.shadow=minecraftTarget
    //% r1.shadow=rule
    //% r2.shadow=rule
    //% r3.shadow=rule
    //% r4.shadow=rule
    //% r5.shadow=rule
    //% r6.shadow=rule
    //% r7.shadow=rule
    //% r8.shadow=rule
    //% r9.shadow=rule
    export function selector(target: TargetSelector,
        r1: Rules = null, r2: Rules = null, r3: Rules = null,
        r4: Rules = null, r5: Rules = null, r6: Rules = null,
        r7: Rules = null, r8: Rules = null, r9: Rules = null):
        TargetSelector {
        [r1, r2, r3, r4, r5, r6, r7, r8, r9].forEach(l => {
            if (l != null) {
                l.content.forEach(r => {
                    target.addRule(r.name, r.value)
                })
            }
        })
        return target
    }

    // --- Selection Rules ---

    //% blockId=rule block="$name = $value"
    //% blockHidden=true
    //% rule.defl=Rule.MinRadius
    //% value.defl="0"
    export function _rule(name: StringRule, value: string = "0"): Rules {
        const rule = (function () {
            switch (name) {
                case StringRule.MinRadius: return "rm"
                case StringRule.MaxRadius: return "r"
                case StringRule.Tag: return "tag"
                case StringRule.Name: return "name"
                case StringRule.Type: return "type"
                case StringRule.Family: return "family"
                case StringRule.Gamemode: return "m"
                case StringRule.Limit: return "c"
                default: return ""
            }
        })()
        return { content: [{ name: rule, value }] }
    }

    //% block="$name %value=minecraftCreatePosition"
    //% group="Selection Rules" weight=80
    export function posRule(name: PosRule, value: Position): Rules {
        let world = value.toWorld()
        let x = world.getValue(Axis.X).toString()
        let y = world.getValue(Axis.Y).toString()
        let z = world.getValue(Axis.Z).toString()
        switch (name) {
            case PosRule.From: return {
                content: [
                    { name: "x", value: x },
                    { name: "y", value: y },
                    { name: "z", value: z }]
            }
            case PosRule.To: return {
                content: [
                    { name: "dx", value: x },
                    { name: "dy", value: y },
                    { name: "dz", value: z }]
            }
            default: return { content: [] }
        }
    }

    //% block="$name %value=minecraftItem"
    //% group="Selection Rules" weight=70
    export function itemRule(name: ItemRule, value: number): Rules {
        let item = blocks.nameOfBlock(value).toLowerCase().split(" ").join("_")
        switch (name) {
            case ItemRule.HasItem: return {
                content:
                    [{ name: "hasitem", value: item }]
            }
            case ItemRule.Holding: return {
                content:
                    [{ name: "hasitem", value: `{item=${item},location=slot.weapon.mainhand}` }]
            }
            case ItemRule.NotHolding: return {
                content:
                    [{ name: "hasitem", value: `{item=${item},location=slot.weapon.mainhand,quantity=0}` }]
            }
            default: return { content: [] }
        }
    }

    //% block="rule $name = $value"
    //% group="Selection Rules" weight=60
    export function genericRule(name: string, value: string): Rules {
        return { content: [{ name, value }] }
    }

    // --- Tagging ---

    //% block="tag %target=minecraftTarget with $tag"
    //% group=Tagging weight=100
    export function tag(target: TargetSelector, tag: string) {
        player.execute(`tag ${target} add ${tag}`)
    }

    //% block="untag %target=minecraftTarget with $tag"
    //% group=Tagging weight=90
    export function untag(target: TargetSelector, tag: string) {
        player.execute(`tag ${target} remove ${tag}`)
    }

    // --- Misc. ---

    //% block="make %target=nearestEntity baby"
    //% group=Misc. weight=90
    export function makeBaby(target: TargetSelector) {
        player.execute(`event entity ${target} minecraft:entity_born`)
        player.execute(`event entity ${target} minecraft:as_baby`)
    }

    //% block="make %target=nearestEntity adult"
    //% group=Misc. weight=80
    export function makeAdult(target: TargetSelector) {
        player.execute(`event entity ${target} minecraft:ageable_grow_up`)
        player.execute(`event entity ${target} grow_up`)
        // player.execute(`event entity ${target} minecraft:as_adult`) // doesn't work
    }

    //% block="explode %target=nearestEntity"
    //% group=Misc. weight=70
    export function explode(target: TargetSelector) {
        mobs.execute(target, pos(0, 0, 0), "summon ender_crystal")
        mobs.execute(target, pos(0, 0, 0),
            "event entity @e[type=ender_crystal,c=1] minecraft:crystal_explode")
    }

}
