// https://www.sitepen.com/blog/unlocking-the-power-of-parser-combinators-a-beginners-guide

interface Vector3 {
    x: number,
    y: number,
    z: number
}

type ParsedType = Array<ParsedType> | number | string | boolean | Vector3

interface SuccessResult {
    success: true
    value: string
    rest: string
    captures: ParsedType[]
}

interface FailureResult {
    success: false
}

type CombinatorResult = SuccessResult | FailureResult
type Combinator = (str: string) => CombinatorResult

// parsers

function charOrNot(c: string, expected: boolean): Combinator {
    return (str: string) => {
        return (str[0] === c) === expected ?
            {
                success: true,
                value: str[0],
                rest: str.substring(1),
                captures: []
            }
            :
            { success: false }
    }
}

function char(c: string): Combinator {
    return charOrNot(c, true)
}

function notChar(c: string): Combinator {
    return charOrNot(c, false)
}

function either(...combinators: Combinator[]): Combinator {
    return (str: string) => {
        const found = combinators.find(c => c(str).success)
        return found ? found(str) : { success: false }
    }
}

function optional(combinator: Combinator): Combinator {
    return either(combinator, str => {
        return {
            success: true,
            value: "",
            rest: str,
            captures: []
        }
    })
}

function sequence(...combinators: Combinator[]): Combinator {
    return (str: string) => {
        let r = {
            success: true,
            value: "",
            rest: str,
            captures: [] as ParsedType[]
        }
        for (const combinator of combinators) {
            const result = combinator(r.rest)
            if (result.success) {
                r.value += result.value
                r.rest = result.rest
                r.captures = r.captures.concat(result.captures)
            } else return { success: false }
        }
        return r
    }
}

function repeated(combinator: Combinator): Combinator {
    return (str: string) => {
        let r = {
            success: true,
            value: "",
            rest: str,
            captures: [] as ParsedType[]
        }
        while (true) {
            const result = combinator(r.rest)
            if (result.success) {
                r.value += result.value
                r.rest = result.rest
                r.captures = r.captures.concat(result.captures)
                continue
            } else break
        }
        return r
    }
}

function string(str: string): Combinator {
    return sequence(...[...str].map(char))
}

function capture(combinator: Combinator, fn: (r: SuccessResult) => ParsedType[]): Combinator {
    return (str: string) => {
        const result = combinator(str)
        if (result.success) {
            result.captures = fn(result)
            return result
        } else return { success: false }
    }
}

function lazy(fn: () => Combinator): Combinator {
    return (str: string) => {
        return fn()(str)
    }
}

// types

const value = lazy(() => either(array, number, stringVal, boolean, vector3))

const array = capture(
    sequence(
        char("{"),
        optional(sequence(
            value,
            repeated(sequence(
                string(", "),
                value
            ))
        )),
        char("}")
    ),
    (x => [x.captures])
)

const digit = either(...[..."0123456789"].map(char))
const digits = sequence(digit, repeated(digit))
const integer = sequence(optional(char("-")), digits)
const number = capture(
    sequence(
        integer,
        optional(sequence(
            char("."),
            digits
        ))
    ),
    (x => { return [Number(x.value)] })
)

const stringVal = sequence(
    char("\""),
    capture(repeated(notChar("\"")), x => [x.value]),
    char("\"")

)

const boolean = either(
    capture(string("true"), (x => [true])),
    capture(string("false"), (x => [false]))
)

const vector3 = capture(
    sequence(
        char("("),
        number,
        char(" "),
        number,
        char(" "),
        number,
        char(")")
    ),
    result => {
        const [x, y, z] = result.captures as number[]
        return [{ x, y, z }]
    }
)

// validation

function parse(combinator: Combinator, str: string) {
    const result = combinator(str)
    if (!result.success) throw new Error(`Failed to parse \"${str}\"`)
    else if (result.rest) throw new Error(`Unparsed remainder \"${result.rest}\"`)
    else if (result.captures.length == 0) throw new Error(`Nothing captured from \"${str}\"`)
    else return result.captures[0]
}

type TypeConstructor<T> = () => T

export const Vector3Type: TypeConstructor<Vector3> = () => ({ x: 0, y: 0, z: 0 })

type ArrayTypeConstructor<T> = TypeConstructor<T[]> & { itemType: TypeConstructor<T> }
export const ArrayType: <T>(itemType: TypeConstructor<T>) => ArrayTypeConstructor<T> = (itemType) => {
    const arrayTypeConstructor = () => [];
    arrayTypeConstructor.itemType = itemType
    return arrayTypeConstructor as ArrayTypeConstructor<T>
}

function isArrayTypeConstructor<T>(constructor: TypeConstructor<any>): constructor is ArrayTypeConstructor<T> {
    return typeof (constructor as any).itemType === 'function';
}

function validate(object: unknown, constructor: TypeConstructor<any>) {
    console.log(`validating ${object} as ${constructor.name}`);
    if (isArrayTypeConstructor(constructor) && Array.isArray(object)) {
        object.forEach((item) => validate(item, constructor.itemType));
    } else if (!(typeof object === typeof constructor())) {
        throw new Error(`Expected ${constructor.name} but got ${object}`);
    }
}

export function getArgs<Types extends TypeConstructor<any>[]>(str: string, ...types: Types): { [K in keyof Types]: ReturnType<Types[K]> } {
    const args = parse(array, str)
    if (!Array.isArray(args)) throw new Error("what")
    else if (args.length !== types.length) throw new Error(`Expected ${types.length} arguments but got ${args.length}`)
    else for (let i = 0; i < args.length; i++) {
        validate(args[i], types[i])
    }
    return args as any
}