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
    name: string;
    value: string;
}

// totally not an array (shadows can't be arrays)
type Rules = {
    content: Rule[]
}

//% weight=100 color=#33bbff icon="\uf135"
//% groups=[Selectors]
namespace codeZone {

    //% blockId=rule block="$name = $value"
    //% blockHidden=true
    //% rule.defl=Rule.MinRadius
    //% value.defl="0"
    export function _rule(name: StringRule, value: string = "0"): Rules {
        const rule = (function () {
            switch (name) {
                case StringRule.MinRadius: return "rm"
                case StringRule.MaxRadius: return "r";
                case StringRule.Tag: return "tag";
                case StringRule.Name: return "name";
                case StringRule.Type: return "type";
                case StringRule.Family: return "family";
                case StringRule.Gamemode: return "m";
                case StringRule.Limit: return "c";
                default: return "";
            }
        })()
        return { content: [{ name: rule, value }] };
    }

    //% block="$name %value=minecraftCreatePosition"
    //% group=Selectors weight=80
    export function posRule(name: PosRule, value: Position): Rules {
        let world = value.toWorld();
        let x = world.getValue(Axis.X).toString();
        let y = world.getValue(Axis.Y).toString();
        let z = world.getValue(Axis.Z).toString();
        switch (name) {
            case PosRule.From: return { content: [
                { name: "x", value: x },
                { name: "y", value: y },
                { name: "z", value: z }]
            }
            case PosRule.To: return { content:[
                { name: "dx", value: x },
                { name: "dy", value: y },
                { name: "dz", value: z }]
            }
            default: return { content: [] }
        }
    }

    //% block="$name %value=minecraftItem"
    //% group=Selectors weight=70
    export function itemRule(name: ItemRule, value: number): Rules {
        let item = blocks.nameOfBlock(value).toLowerCase().split(" ").join("_");
        switch (name) {
            case ItemRule.HasItem: return { content:
                [{ name: "hasitem", value: item }] 
            }
            case ItemRule.Holding: return { content:
                [{ name: "hasitem", value: "{item=" + item + ",location=slot.weapon.mainhand}" }]
            }
            case ItemRule.NotHolding: return { content:
                [{ name: "hasitem", value: "{item=" + item + ",location=slot.weapon.mainhand,quantity=0}" }]
            }
            default: return { content: [] }
        }
    }

    //% block="rule $name = $value"
    //% group=Selectors weight=60
    export function genericRule(name: string, value: string): Rules {
        return { content: [{ name, value }] };
    }

    //% block="%target=minecraftTarget $r1||$r2 $r3 $r4 $r5 $r6 $r7 $r8 $r9"
    //% group=Selectors weight=100
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% r1.shadow="rule"
    //% r2.shadow="rule"
    //% r3.shadow="rule"
    //% r4.shadow="rule"
    //% r5.shadow="rule"
    //% r6.shadow="rule"
    //% r7.shadow="rule"
    //% r8.shadow="rule"
    //% r9.shadow="rule"
    export function selector(target: TargetSelector,
                            r1: Rules = null, r2: Rules = null, r3: Rules = null,
                            r4: Rules = null, r5: Rules = null, r6: Rules = null,
                            r7: Rules = null, r8: Rules = null, r9: Rules = null):
                            TargetSelector {
        [r1, r2, r3, r4, r5, r6, r7, r8, r9].forEach(l => {
            if (l != null) {
                l.content.forEach(r => {
                    target.addRule(r.name, r.value);
                })
            }
        })
        return target;
    }
    
}
