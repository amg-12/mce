enum RuleName {
    //% block="min radius (rm)"
    MinRadius,
    //% block="max radius (r)"
    MaxRadius,
    //% block="tag"
    Tag,
    //% block="name"
    Name,
    //% block="type"
    Type,
    //% block="has item"
    HasItem,
    //% block="gamemode (m)"
    Gamemode,
    //% block="limit (c)"
    Limit
}

function ruleToString(rule: RuleName): string {
    switch (rule) {
        case RuleName.MinRadius: return "rm"
        case RuleName.MaxRadius: return "r";
        case RuleName.Tag: return "tag";
        case RuleName.Name: return "name";
        case RuleName.Type: return "type";
        case RuleName.HasItem: return "hasitem";
        case RuleName.Gamemode: return "m";
        case RuleName.Limit: return "c";
        default: return "";
    }
}

type Rule = {
    name: RuleName;
    value: string;
}

//% weight=100 color=#33bbff icon="\uf135"
namespace codeZone {

    //% blockId=rule block="$name = $value"
    //% blockHidden=true
    //% rule.defl=Rule.MinRadius
    //% value.defl="0"
    export function _rule(name: RuleName = RuleName.MinRadius, value: string = "0"): Rule {
        return { name, value };
    }

    //% block="%target=minecraftTarget $r1||$r2 $r3 $r4 $r5 $r6 $r7 $r8 $r9"
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
                        r1: Rule=null, r2: Rule=null, r3: Rule=null,
                        r4: Rule=null, r5: Rule=null, r6: Rule=null,
                        r7: Rule=null, r8: Rule=null, r9: Rule=null): 
                        TargetSelector {
        [r1,r2,r3,r4,r5,r6,r7,r8,r9].forEach(r => {
            if (r != null) {
                target.addRule(ruleToString(r.name), r.value);
            }
        })
        return target;
    }
}
