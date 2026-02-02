import { Union } from "../../../../../../../../../Downloads/v8s/v8/calc/build/fable_modules/fable-library-js.4.24.0/Types.js";
import { union_type, string_type } from "../../../../../../../../../Downloads/v8s/v8/calc/build/fable_modules/fable-library-js.4.24.0/Reflection.js";
import { createElement } from "react";
import { createObj } from "../../../../../../../../../Downloads/v8s/v8/calc/build/fable_modules/fable-library-js.4.24.0/Util.js";
import { reactApi } from "./build/fable_modules/Feliz.2.9.0/Interop.fs.js";
import { ofArray } from "../../../../../../../../../Downloads/v8s/v8/calc/build/fable_modules/fable-library-js.4.24.0/List.js";
import { ProgramModule_mkSimple, ProgramModule_run } from "./build/fable_modules/Fable.Elmish.5.0.2/program.fs.js";
import { Program_withReactSynchronous } from "./build/fable_modules/Fable.Elmish.React.5.0.1/react.fs.js";

export class Model extends Union {
    constructor(Item) {
        super();
        this.tag = 0;
        this.fields = [Item];
    }
    cases() {
        return ["UnosPrvogBroja"];
    }
}

export function Model_$reflection() {
    return union_type("Program.Model", [], Model, () => [[["Item", string_type]]]);
}

export class Msg extends Union {
    constructor(Item) {
        super();
        this.tag = 0;
        this.fields = [Item];
    }
    cases() {
        return ["ClickedDigit"];
    }
}

export function Msg_$reflection() {
    return union_type("Program.Msg", [], Msg, () => [[["Item", string_type]]]);
}

export function init() {
    return new Model("");
}

export function update(msg, model) {
    const d = msg.fields[0];
    const b = model.fields[0];
    return new Model(b + d);
}

export function view(model, dispatch) {
    let elems;
    const make_digit_btn = (d) => createElement("button", {
        style: {
            fontSize: 40 + "px",
        },
        dangerouslySetInnerHTML: {
            __html: d,
        },
        onClick: (_arg) => {
            dispatch(new Msg(d));
        },
    });
    const ekran_text = () => {
        const broj = model.fields[0];
        return broj;
    };
    return createElement("div", createObj(ofArray([["style", {
        display: "inline-block",
    }], (elems = [createElement("div", {
        style: {
            height: 50 + "px",
            backgroundColor: "#FFFF00",
        },
        dangerouslySetInnerHTML: {
            __html: ekran_text(),
        },
    }), make_digit_btn("1"), make_digit_btn("2"), make_digit_btn("3"), createElement("br", {}), make_digit_btn("4"), make_digit_btn("5"), make_digit_btn("6"), createElement("br", {}), make_digit_btn("7"), make_digit_btn("8"), make_digit_btn("9")], ["children", reactApi.Children.toArray(Array.from(elems))])])));
}

ProgramModule_run(Program_withReactSynchronous("app", ProgramModule_mkSimple(init, update, view)));

