function formatArray(array: any[]): string {
    return `{${array.map(format).join(", ")}}`
}

function formatTargetSelector(target: TargetSelector) {
    return `{${mobs.queryTarget(target).map(x => `\"${x.uniqueId}\"`).join(", ")}}`
    // recursion is too expensive here
}

function formatPosition(pos: Position) {
    return `(${pos.toWorld()})`
}

function format(arg: any): string {
    if (Array.isArray(arg)) {
        return formatArray(arg as any[])
    } else switch (typeof arg) {
        case "string":
            return `\"${arg}\"`
        case "object":
            if (`${arg}`[0] == "@") { // horrible
                return formatTargetSelector(arg as TargetSelector)
            } else {
                return formatPosition(arg as Position)
            }
        default:
            return `${arg}`
    }

}

namespace scriptevent {

    export function send(name: string, ...args: any[]) {
        const msg = format(args)
        player.execute(`scriptevent tcz:${name} ${msg}`)
    }

    //% block
    export function test(coors: Position[], block: string) {
        send("test", [coors, block])
    }

}