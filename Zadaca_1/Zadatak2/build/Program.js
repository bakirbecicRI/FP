import { Union } from "./fable_modules/fable-library-js.4.24.0/Types.js";
import { string_type, char_type, int64_type, union_type } from "./fable_modules/fable-library-js.4.24.0/Reflection.js";
import { createObj, equals as equals_1, int64ToString } from "./fable_modules/fable-library-js.4.24.0/Util.js";
import { equals, op_Addition, op_Division, op_Multiply, op_Subtraction, op_UnaryNegation, toInt64, compare } from "./fable_modules/fable-library-js.4.24.0/BigInt.js";
import { parse as parse_1 } from "./fable_modules/fable-library-js.4.24.0/Long.js";
import { tryFindIndex } from "./fable_modules/fable-library-js.4.24.0/Seq.js";
import { substring } from "./fable_modules/fable-library-js.4.24.0/String.js";
import { createElement } from "react";
import { ofArray } from "./fable_modules/fable-library-js.4.24.0/List.js";
import { reactApi } from "./fable_modules/Feliz.2.9.0/Interop.fs.js";
import { ProgramModule_mkSimple, ProgramModule_run } from "./fable_modules/Fable.Elmish.5.0.2/program.fs.js";
import { Program_withReactSynchronous } from "./fable_modules/Fable.Elmish.React.5.0.1/react.fs.js";

export class Operator extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Add", "Sub", "Mul", "Div", "Invalid"];
    }
}

export function Operator_$reflection() {
    return union_type("Program.Operator", [], Operator, () => [[], [], [], [], []]);
}

export class Value extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Num", "Posinf", "Neginf", "NaN"];
    }
}

export function Value_$reflection() {
    return union_type("Program.Value", [], Value, () => [[["Item", int64_type]], [], [], []]);
}

export class Msg extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Number", "Eval", "Clear", "Operation"];
    }
}

export function Msg_$reflection() {
    return union_type("Program.Msg", [], Msg, () => [[["Item", char_type]], [], [], [["Item", Operator_$reflection()]]]);
}

export function opToStr(op) {
    switch (op.tag) {
        case 1:
            return "-";
        case 2:
            return "*";
        case 3:
            return "/";
        case 4:
            return "?";
        default:
            return "+";
    }
}

export function showValue(v) {
    switch (v.tag) {
        case 1:
            return "+Inf";
        case 2:
            return "-Inf";
        case 3:
            return "Nan";
        default: {
            const x = v.fields[0];
            return int64ToString(x);
        }
    }
}

export const limit = 10000000000n;

export function abs64(x) {
    if (compare(x, 0n) >= 0) {
        return x;
    }
    else {
        return toInt64(op_UnaryNegation(x));
    }
}

export function apply(op, a, b) {
    let matchResult, y, y_1, x, x_1, x_2, y_2;
    switch (a.tag) {
        case 1: {
            switch (b.tag) {
                case 3: {
                    matchResult = 0;
                    break;
                }
                case 0: {
                    if (equals(b.fields[0], 0n)) {
                        if (equals_1(op, new Operator(3, []))) {
                            matchResult = 1;
                        }
                        else {
                            matchResult = 2;
                            y = b.fields[0];
                        }
                    }
                    else {
                        matchResult = 2;
                        y = b.fields[0];
                    }
                    break;
                }
                default:
                    matchResult = 7;
            }
            break;
        }
        case 2: {
            switch (b.tag) {
                case 3: {
                    matchResult = 0;
                    break;
                }
                case 0: {
                    if (equals(b.fields[0], 0n)) {
                        if (equals_1(op, new Operator(3, []))) {
                            matchResult = 1;
                        }
                        else {
                            matchResult = 3;
                            y_1 = b.fields[0];
                        }
                    }
                    else {
                        matchResult = 3;
                        y_1 = b.fields[0];
                    }
                    break;
                }
                default:
                    matchResult = 7;
            }
            break;
        }
        case 0: {
            switch (b.tag) {
                case 0: {
                    if (equals(b.fields[0], 0n)) {
                        if (equals_1(op, new Operator(3, []))) {
                            matchResult = 1;
                        }
                        else {
                            matchResult = 6;
                            x_2 = a.fields[0];
                            y_2 = b.fields[0];
                        }
                    }
                    else {
                        matchResult = 6;
                        x_2 = a.fields[0];
                        y_2 = b.fields[0];
                    }
                    break;
                }
                case 1: {
                    matchResult = 4;
                    x = a.fields[0];
                    break;
                }
                case 2: {
                    matchResult = 5;
                    x_1 = a.fields[0];
                    break;
                }
                default:
                    matchResult = 0;
            }
            break;
        }
        default:
            matchResult = 0;
    }
    switch (matchResult) {
        case 0:
            return new Value(3, []);
        case 1:
            return new Value(3, []);
        case 2: {
            let matchResult_1;
            switch (op.tag) {
                case 0: {
                    if (compare(y, 0n) > 0) {
                        matchResult_1 = 0;
                    }
                    else {
                        matchResult_1 = 1;
                    }
                    break;
                }
                case 2: {
                    if (compare(y, 0n) > 0) {
                        matchResult_1 = 0;
                    }
                    else {
                        matchResult_1 = 1;
                    }
                    break;
                }
                default:
                    matchResult_1 = 1;
            }
            switch (matchResult_1) {
                case 0:
                    return new Value(1, []);
                default: {
                    let matchResult_2;
                    switch (op.tag) {
                        case 0: {
                            if (compare(y, 0n) < 0) {
                                matchResult_2 = 0;
                            }
                            else {
                                matchResult_2 = 1;
                            }
                            break;
                        }
                        case 2: {
                            if (compare(y, 0n) < 0) {
                                matchResult_2 = 0;
                            }
                            else {
                                matchResult_2 = 1;
                            }
                            break;
                        }
                        default:
                            matchResult_2 = 1;
                    }
                    switch (matchResult_2) {
                        case 0:
                            return new Value(2, []);
                        default: {
                            let matchResult_3;
                            switch (op.tag) {
                                case 1: {
                                    if (compare(y, 0n) > 0) {
                                        matchResult_3 = 0;
                                    }
                                    else if (compare(y, 0n) < 0) {
                                        matchResult_3 = 1;
                                    }
                                    else {
                                        matchResult_3 = 4;
                                    }
                                    break;
                                }
                                case 3: {
                                    if (compare(y, 0n) > 0) {
                                        matchResult_3 = 2;
                                    }
                                    else if (compare(y, 0n) < 0) {
                                        matchResult_3 = 3;
                                    }
                                    else {
                                        matchResult_3 = 4;
                                    }
                                    break;
                                }
                                default:
                                    matchResult_3 = 4;
                            }
                            switch (matchResult_3) {
                                case 0:
                                    return new Value(1, []);
                                case 1:
                                    return new Value(1, []);
                                case 2:
                                    return new Value(1, []);
                                case 3:
                                    return new Value(2, []);
                                default:
                                    return new Value(3, []);
                            }
                        }
                    }
                }
            }
        }
        case 3: {
            let matchResult_4;
            switch (op.tag) {
                case 0: {
                    if (compare(y_1, 0n) > 0) {
                        matchResult_4 = 0;
                    }
                    else {
                        matchResult_4 = 1;
                    }
                    break;
                }
                case 2: {
                    if (compare(y_1, 0n) > 0) {
                        matchResult_4 = 0;
                    }
                    else {
                        matchResult_4 = 1;
                    }
                    break;
                }
                default:
                    matchResult_4 = 1;
            }
            switch (matchResult_4) {
                case 0:
                    return new Value(2, []);
                default: {
                    let matchResult_5;
                    switch (op.tag) {
                        case 0: {
                            if (compare(y_1, 0n) < 0) {
                                matchResult_5 = 0;
                            }
                            else {
                                matchResult_5 = 1;
                            }
                            break;
                        }
                        case 2: {
                            if (compare(y_1, 0n) < 0) {
                                matchResult_5 = 0;
                            }
                            else {
                                matchResult_5 = 1;
                            }
                            break;
                        }
                        default:
                            matchResult_5 = 1;
                    }
                    switch (matchResult_5) {
                        case 0:
                            return new Value(1, []);
                        default: {
                            let matchResult_6;
                            switch (op.tag) {
                                case 1: {
                                    if (compare(y_1, 0n) > 0) {
                                        matchResult_6 = 0;
                                    }
                                    else if (compare(y_1, 0n) < 0) {
                                        matchResult_6 = 1;
                                    }
                                    else {
                                        matchResult_6 = 4;
                                    }
                                    break;
                                }
                                case 3: {
                                    if (compare(y_1, 0n) > 0) {
                                        matchResult_6 = 2;
                                    }
                                    else if (compare(y_1, 0n) < 0) {
                                        matchResult_6 = 3;
                                    }
                                    else {
                                        matchResult_6 = 4;
                                    }
                                    break;
                                }
                                default:
                                    matchResult_6 = 4;
                            }
                            switch (matchResult_6) {
                                case 0:
                                    return new Value(2, []);
                                case 1:
                                    return new Value(2, []);
                                case 2:
                                    return new Value(2, []);
                                case 3:
                                    return new Value(1, []);
                                default:
                                    return new Value(3, []);
                            }
                        }
                    }
                }
            }
        }
        case 4: {
            let matchResult_7;
            switch (op.tag) {
                case 0: {
                    matchResult_7 = 0;
                    break;
                }
                case 1: {
                    matchResult_7 = 1;
                    break;
                }
                case 2: {
                    if (compare(x, 0n) > 0) {
                        matchResult_7 = 2;
                    }
                    else if (compare(x, 0n) < 0) {
                        matchResult_7 = 3;
                    }
                    else {
                        matchResult_7 = 5;
                    }
                    break;
                }
                case 3: {
                    matchResult_7 = 4;
                    break;
                }
                default:
                    matchResult_7 = 5;
            }
            switch (matchResult_7) {
                case 0:
                    return new Value(1, []);
                case 1:
                    return new Value(2, []);
                case 2:
                    return new Value(1, []);
                case 3:
                    return new Value(2, []);
                case 4:
                    return new Value(0, [0n]);
                default:
                    return new Value(3, []);
            }
        }
        case 5: {
            let matchResult_8;
            switch (op.tag) {
                case 0: {
                    matchResult_8 = 0;
                    break;
                }
                case 1: {
                    matchResult_8 = 1;
                    break;
                }
                case 2: {
                    if (compare(x_1, 0n) > 0) {
                        matchResult_8 = 2;
                    }
                    else if (compare(x_1, 0n) < 0) {
                        matchResult_8 = 3;
                    }
                    else {
                        matchResult_8 = 5;
                    }
                    break;
                }
                case 3: {
                    matchResult_8 = 4;
                    break;
                }
                default:
                    matchResult_8 = 5;
            }
            switch (matchResult_8) {
                case 0:
                    return new Value(2, []);
                case 1:
                    return new Value(1, []);
                case 2:
                    return new Value(2, []);
                case 3:
                    return new Value(1, []);
                case 4:
                    return new Value(0, [0n]);
                default:
                    return new Value(3, []);
            }
        }
        case 6: {
            const r = (op.tag === 1) ? toInt64(op_Subtraction(x_2, y_2)) : ((op.tag === 2) ? toInt64(op_Multiply(x_2, y_2)) : ((op.tag === 3) ? toInt64(op_Division(x_2, y_2)) : ((op.tag === 4) ? (0n) : toInt64(op_Addition(x_2, y_2)))));
            if (compare(abs64(r), limit) >= 0) {
                if (compare(r, 0n) >= 0) {
                    return new Value(1, []);
                }
                else {
                    return new Value(2, []);
                }
            }
            else {
                return new Value(0, [r]);
            }
        }
        default:
            return new Value(3, []);
    }
}

export function parse(s) {
    switch (s) {
        case "+Inf":
            return new Value(1, []);
        case "-Inf":
            return new Value(2, []);
        case "Nan":
            return new Value(3, []);
        case "":
            return new Value(0, [0n]);
        default:
            return new Value(0, [toInt64(parse_1(s, 511, false, 64))]);
    }
}

export function parseExpr(expr) {
    const findOpIndex = (s) => tryFindIndex((a) => {
        if (((a === "+") ? true : (a === "-")) ? true : (a === "*")) {
            return true;
        }
        else {
            return a === "/";
        }
    }, s.split(""));
    const matchValue = findOpIndex(expr);
    if (matchValue != null) {
        const x = matchValue | 0;
        if (x === 0) {
            const copystr = expr.slice(1, expr.length);
            let idx;
            const matchValue_1 = findOpIndex(copystr);
            if (matchValue_1 == null) {
                throw new Error("Impossible state");
            }
            else {
                const i = matchValue_1 | 0;
                idx = i;
            }
            const lhsStr = substring(expr, 0, idx + 1);
            const rhsStr = substring(expr, idx + 2);
            const opChar = copystr[idx];
            const op = (opChar === "*") ? (new Operator(2, [])) : ((opChar === "+") ? (new Operator(0, [])) : ((opChar === "-") ? (new Operator(1, [])) : ((opChar === "/") ? (new Operator(3, [])) : (new Operator(4, [])))));
            const lhs = parse(lhsStr);
            const rhs = parse(rhsStr);
            return apply(op, lhs, rhs);
        }
        else {
            const lhsStr_1 = substring(expr, 0, x);
            const rhsStr_1 = substring(expr, x + 1);
            const opChar_1 = expr[x];
            const op_1 = (opChar_1 === "*") ? (new Operator(2, [])) : ((opChar_1 === "+") ? (new Operator(0, [])) : ((opChar_1 === "-") ? (new Operator(1, [])) : ((opChar_1 === "/") ? (new Operator(3, [])) : (new Operator(4, [])))));
            const lhs_1 = parse(lhsStr_1);
            const rhs_1 = parse(rhsStr_1);
            return apply(op_1, lhs_1, rhs_1);
        }
    }
    else {
        return parse(expr);
    }
}

export class State extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Num1Input", "Operator", "Num2Input"];
    }
}

export function State_$reflection() {
    return union_type("Program.State", [], State, () => [[["Item", string_type]], [["Item", string_type]], [["Item", string_type]]]);
}

export const initial = new State(0, [""]);

export function init() {
    return initial;
}

export function update(msg, state) {
    switch (state.tag) {
        case 1: {
            const expr = state.fields[0];
            switch (msg.tag) {
                case 1:
                    return state;
                case 2:
                    return initial;
                case 3: {
                    const op_1 = msg.fields[0];
                    return new State(1, [expr.slice(0, (expr.length - 2) + 1) + opToStr(op_1)]);
                }
                default: {
                    const x_1 = msg.fields[0];
                    return new State(2, [expr + x_1]);
                }
            }
        }
        case 2: {
            const expr_1 = state.fields[0];
            switch (msg.tag) {
                case 1: {
                    const result = showValue(parseExpr(expr_1));
                    return new State(0, [result]);
                }
                case 3: {
                    const op_2 = msg.fields[0];
                    const result_1 = showValue(parseExpr(expr_1));
                    return new State(1, [result_1 + opToStr(op_2)]);
                }
                case 2:
                    return initial;
                default: {
                    const x_2 = msg.fields[0];
                    if (expr_1.length < 20) {
                        return new State(2, [expr_1 + x_2]);
                    }
                    else {
                        return state;
                    }
                }
            }
        }
        default: {
            const str = state.fields[0];
            switch (msg.tag) {
                case 1:
                    return state;
                case 2:
                    return initial;
                case 3: {
                    const op = msg.fields[0];
                    if (str === "") {
                        return state;
                    }
                    else {
                        return new State(1, [str + opToStr(op)]);
                    }
                }
                default: {
                    const x = msg.fields[0];
                    if (str.length < 10) {
                        return new State(0, [str + x]);
                    }
                    else {
                        return state;
                    }
                }
            }
        }
    }
}

export function view(state, dispatch) {
    let elems, children, children_2, children_4, children_6;
    const btnColored = (txt, msg, color) => createElement("button", {
        style: {
            fontSize: 28 + "px",
            margin: 4,
            width: 90,
            height: 90,
            backgroundColor: color,
            borderRadius: 8,
        },
        children: txt,
        onClick: (_arg) => {
            dispatch(msg);
        },
    });
    let displayText;
    switch (state.tag) {
        case 1: {
            const s_1 = state.fields[0];
            displayText = s_1;
            break;
        }
        case 2: {
            const s_2 = state.fields[0];
            displayText = s_2;
            break;
        }
        default: {
            const s = state.fields[0];
            displayText = s;
        }
    }
    return createElement("div", createObj(ofArray([["style", {
        width: 400,
        backgroundColor: "#eee",
        padding: 10,
        borderWidth: 2,
        borderStyle: "inset",
        borderColor: "#aaa",
        borderRadius: 15,
    }], (elems = [createElement("div", {
        style: {
            height: 100,
            backgroundColor: "#eee",
            textAlign: "right",
            fontSize: 26 + "px",
            paddingRight: 10,
            marginBottom: 10,
            borderRadius: 5,
            borderWidth: 2,
            borderStyle: "solid",
            borderColor: "#aaa",
        },
        children: displayText,
    }), (children = ofArray([btnColored("1", new Msg(0, ["1"]), "#fff176"), btnColored("2", new Msg(0, ["2"]), "#fff176"), btnColored("3", new Msg(0, ["3"]), "#fff176"), btnColored("+", new Msg(3, [new Operator(0, [])]), "#90caf9")]), createElement("div", {
        children: reactApi.Children.toArray(Array.from(children)),
    })), (children_2 = ofArray([btnColored("4", new Msg(0, ["4"]), "#fff176"), btnColored("5", new Msg(0, ["5"]), "#fff176"), btnColored("6", new Msg(0, ["6"]), "#fff176"), btnColored("-", new Msg(3, [new Operator(1, [])]), "#90caf9")]), createElement("div", {
        children: reactApi.Children.toArray(Array.from(children_2)),
    })), (children_4 = ofArray([btnColored("7", new Msg(0, ["7"]), "#fff176"), btnColored("8", new Msg(0, ["8"]), "#fff176"), btnColored("9", new Msg(0, ["9"]), "#fff176"), btnColored("*", new Msg(3, [new Operator(2, [])]), "#90caf9")]), createElement("div", {
        children: reactApi.Children.toArray(Array.from(children_4)),
    })), (children_6 = ofArray([btnColored("CE", new Msg(2, []), "#ef9a9a"), btnColored("0", new Msg(0, ["0"]), "#fff176"), btnColored("=", new Msg(1, []), "#a5d6a7"), btnColored("/", new Msg(3, [new Operator(3, [])]), "#90caf9")]), createElement("div", {
        children: reactApi.Children.toArray(Array.from(children_6)),
    }))], ["children", reactApi.Children.toArray(Array.from(elems))])])));
}

ProgramModule_run(Program_withReactSynchronous("app", ProgramModule_mkSimple(init, update, view)));

