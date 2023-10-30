enum Rule {
    //% block="max radius (r)"
    MaxRadius,
    //% block="min radius (rm)"
    MinRadius,
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

function ruleString(rule: Rule): string {
    switch (rule) {
        case Rule.MaxRadius: return "r";
        case Rule.MinRadius: return "rm"
        case Rule.Tag: return "tag";
        case Rule.Name: return "name";
        case Rule.Type: return "type";
        case Rule.HasItem: return "hasitem";
        case Rule.Gamemode: return "m";
        case Rule.Limit: return "c";
        default: return "";
    }
}

//% weight=100 color=#33bbff icon="\uf135"
namespace codeZone {
    /**
     * TODO: describe your function here
     * @param n describe parameter here, eg: 5
     * @param s describe parameter here, eg: "Hello"
     * @param e describe parameter here
     */
    //% block="%target=minecraftTarget with $rule = $value"
    export function foo(target: TargetSelector, rule: Rule, value: string): TargetSelector {
        target.addRule(ruleString(rule), value);
        return target;
    }
}
