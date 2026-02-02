import { Union, Record } from "./fable_modules/fable-library-js.4.24.0/Types.js";
import { list_type, array_type, class_type, union_type, string_type, record_type, int32_type } from "./fable_modules/fable-library-js.4.24.0/Reflection.js";
import { isSelectionValid, make_board, Slovo_$reflection } from "./BoardModel.js";
import { singleton } from "./fable_modules/fable-library-js.4.24.0/AsyncBuilder.js";
import { sleep } from "./fable_modules/fable-library-js.4.24.0/Async.js";
import { Cmd_OfAsyncWith_perform } from "./fable_modules/Fable.Elmish.5.0.2/cmd.fs.js";
import { AsyncHelpers_start } from "./fable_modules/Fable.Elmish.5.0.2/prelude.fs.js";
import { PromiseBuilder__Delay_62FBFDE1, PromiseBuilder__Run_212F1D4B } from "./fable_modules/Fable.Promise.3.2.0/Promise.fs.js";
import { promise } from "./fable_modules/Fable.Promise.3.2.0/PromiseImpl.fs.js";
import { fetch$ } from "./fable_modules/Fable.Fetch.2.7.0/Fetch.fs.js";
import { sortByDescending, maxBy, cons, isEmpty, singleton as singleton_1, append, tryLast, contains as contains_1, ofArray as ofArray_1, sumBy, map as map_1, mapIndexed, toArray, empty } from "./fable_modules/fable-library-js.4.24.0/List.js";
import { add, empty as empty_1, contains, ofArray } from "./fable_modules/fable-library-js.4.24.0/Set.js";
import { item, map } from "./fable_modules/fable-library-js.4.24.0/Array.js";
import { split } from "./fable_modules/fable-library-js.4.24.0/String.js";
import { equals, int32ToString, createObj, numberHash, comparePrimitives } from "./fable_modules/fable-library-js.4.24.0/Util.js";
import { Cmd_none, Cmd_OfPromise_perform, Cmd_batch } from "./fable_modules/Fable.Elmish.5.0.2/cmd.fs.js";
import { createElement } from "react";
import { reactApi } from "./fable_modules/Feliz.2.9.0/Interop.fs.js";
import { empty as empty_2, singleton as singleton_2, append as append_1, delay, toList } from "./fable_modules/fable-library-js.4.24.0/Seq.js";
import { defaultOf } from "./fable_modules/fable-library-js.4.24.0/Util.js";
import { ProgramModule_mkProgram, ProgramModule_run } from "./fable_modules/Fable.Elmish.5.0.2/program.fs.js";
import { Program_withReactSynchronous } from "./fable_modules/Fable.Elmish.React.5.0.1/react.fs.js";

export class word extends Record {
    constructor(id, char) {
        super();
        this.id = (id | 0);
        this.char = char;
    }
}

export function word_$reflection() {
    return record_type("Program.word", [], word, () => [["id", int32_type], ["char", Slovo_$reflection()]]);
}

export class finded extends Record {
    constructor(text, points) {
        super();
        this.text = text;
        this.points = (points | 0);
    }
}

export function finded_$reflection() {
    return record_type("Program.finded", [], finded, () => [["text", string_type], ["points", int32_type]]);
}

export class Anim extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Shakeone", "Shakeselected", "Acceptword", "Dropboard"];
    }
}

export function Anim_$reflection() {
    return union_type("Program.Anim", [], Anim, () => [[["Item", int32_type]], [], [], []]);
}

export class WordState extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Notloaded", "Loading", "Ready"];
    }
}

export function WordState_$reflection() {
    return union_type("Program.WordState", [], WordState, () => [[], [], [["Item", class_type("Microsoft.FSharp.Collections.FSharpSet`1", [string_type])]]]);
}

export class StageOfGame extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Playing", "Animating", "Results"];
    }
}

export function StageOfGame_$reflection() {
    return union_type("Program.StageOfGame", [], StageOfGame, () => [[], [["Item", Anim_$reflection()]], []]);
}

export class Model extends Record {
    constructor(phase, board, chosen, currentText, score, timeLeft, shakeKey, shakeWordKey, acceptKey, words, found, used) {
        super();
        this.phase = phase;
        this.board = board;
        this.chosen = chosen;
        this.currentText = currentText;
        this.score = (score | 0);
        this.timeLeft = (timeLeft | 0);
        this.shakeKey = (shakeKey | 0);
        this.shakeWordKey = (shakeWordKey | 0);
        this.acceptKey = (acceptKey | 0);
        this.words = words;
        this.found = found;
        this.used = used;
    }
}

export function Model_$reflection() {
    return record_type("Program.Model", [], Model, () => [["phase", StageOfGame_$reflection()], ["board", array_type(word_$reflection())], ["chosen", list_type(int32_type)], ["currentText", string_type], ["score", int32_type], ["timeLeft", int32_type], ["shakeKey", int32_type], ["shakeWordKey", int32_type], ["acceptKey", int32_type], ["words", WordState_$reflection()], ["found", list_type(finded_$reflection())], ["used", class_type("Microsoft.FSharp.Collections.FSharpSet`1", [string_type])]]);
}

export class Msg extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Clickcell", "Clearpick", "Submit", "Time_tick", "Loaded_words", "Animation_done", "Show_results"];
    }
}

export function Msg_$reflection() {
    return union_type("Program.Msg", [], Msg, () => [[["Item", int32_type]], [], [], [], [["Item", class_type("Microsoft.FSharp.Collections.FSharpSet`1", [string_type])]], [], []]);
}

export function waitMs(ms) {
    return singleton.Delay(() => singleton.Bind(sleep(ms), () => singleton.Return(undefined)));
}

export function cmdDelay(ms, msg) {
    return Cmd_OfAsyncWith_perform((x) => {
        AsyncHelpers_start(x);
    }, () => waitMs(ms), undefined, () => msg);
}

export const cmdTime_tick = Cmd_OfAsyncWith_perform((x) => {
    AsyncHelpers_start(x);
}, () => waitMs(1000), undefined, () => (new Msg(3, [])));

export function loadwords() {
    return PromiseBuilder__Run_212F1D4B(promise, PromiseBuilder__Delay_62FBFDE1(promise, () => (fetch$("/words_alpha.txt", empty()).then((_arg) => {
        const r = _arg;
        return r.text().then((_arg_1) => {
            let array_1;
            const text = _arg_1;
            return Promise.resolve(ofArray((array_1 = map((s) => s.trim(), split(text, ["\n"], undefined, 0)), array_1.filter((s_1) => (s_1 !== ""))), {
                Compare: comparePrimitives,
            }));
        });
    }))));
}

export function canUsewords(m) {
    if (m.words.tag === 2) {
        return true;
    }
    else {
        return false;
    }
}

export function inwords(m, w) {
    const matchValue = m.words;
    if (matchValue.tag === 2) {
        const ws = matchValue.fields[0];
        return contains(w, ws);
    }
    else {
        return false;
    }
}

export function makeBoard() {
    return toArray(mapIndexed((i, s) => (new word(i, s)), make_board()));
}

export function processWord(s) {
    return s.trim().toLowerCase();
}

export function textFromPick(m, pick) {
    const value = toArray(map_1((i) => item(i, m.board).char.sym, pick));
    return value.join('');
}

export function pointsFromPick(m, pick) {
    return sumBy((i) => item(i, m.board).char.point, pick, {
        GetZero: () => 0,
        Add: (x, y) => (x + y),
    });
}

export function pickScore(m) {
    return pointsFromPick(m, m.chosen);
}

export function resetPick(m) {
    return new Model(m.phase, m.board, empty(), "", m.score, m.timeLeft, m.shakeKey, m.shakeWordKey, m.acceptKey, m.words, m.found, m.used);
}

export function isLocked(m) {
    if (m.phase.tag === 0) {
        return false;
    }
    else {
        return true;
    }
}

export function shakeWholePick(m) {
    const m2 = new Model(new StageOfGame(1, [new Anim(1, [])]), m.board, m.chosen, m.currentText, m.score, m.timeLeft, m.shakeKey + 1, m.shakeWordKey + 1, m.acceptKey, m.words, m.found, m.used);
    return [m2, cmdDelay(250, new Msg(5, []))];
}

export function init() {
    const board_1 = makeBoard();
    return [new Model(new StageOfGame(0, []), board_1, empty(), "", 0, 120, 0, 0, 0, new WordState(1, []), empty(), empty_1({
        Compare: comparePrimitives,
    })), Cmd_batch(ofArray_1([Cmd_OfPromise_perform(loadwords, undefined, (Item) => (new Msg(4, [Item]))), cmdTime_tick]))];
}

export function update(msg, m) {
    let bind$0040_1, bind$0040;
    switch (msg.tag) {
        case 3:
            if (m.phase.tag === 2) {
                return [m, Cmd_none()];
            }
            else {
                const next = (m.timeLeft - 1) | 0;
                if (next <= 0) {
                    const m2 = new Model(new StageOfGame(1, [new Anim(3, [])]), m.board, empty(), "", m.score, 0, m.shakeKey, m.shakeWordKey, m.acceptKey, m.words, m.found, m.used);
                    return [m2, cmdDelay(1000, new Msg(6, []))];
                }
                else {
                    return [new Model(m.phase, m.board, m.chosen, m.currentText, m.score, next, m.shakeKey, m.shakeWordKey, m.acceptKey, m.words, m.found, m.used), cmdTime_tick];
                }
            }
        case 6:
            return [new Model(new StageOfGame(2, []), m.board, m.chosen, m.currentText, m.score, m.timeLeft, m.shakeKey, m.shakeWordKey, m.acceptKey, m.words, m.found, m.used), Cmd_none()];
        case 0: {
            const idx = msg.fields[0] | 0;
            if (isLocked(m)) {
                return [m, Cmd_none()];
            }
            else if (contains_1(idx, m.chosen, {
                Equals: (x, y) => (x === y),
                GetHashCode: numberHash,
            })) {
                return [m, Cmd_none()];
            }
            else {
                let last;
                const matchValue_1 = tryLast(m.chosen);
                if (matchValue_1 == null) {
                    last = -1;
                }
                else {
                    const x_1 = matchValue_1 | 0;
                    last = x_1;
                }
                if (!isSelectionValid(last, idx)) {
                    const m2_1 = new Model(new StageOfGame(1, [new Anim(0, [idx])]), m.board, m.chosen, m.currentText, m.score, m.timeLeft, m.shakeKey + 1, m.shakeWordKey, m.acceptKey, m.words, m.found, m.used);
                    return [m2_1, cmdDelay(320, new Msg(5, []))];
                }
                else {
                    const newPick = append(m.chosen, singleton_1(idx));
                    const newText = textFromPick(m, newPick);
                    return [new Model(m.phase, m.board, newPick, newText, m.score, m.timeLeft, m.shakeKey, m.shakeWordKey, m.acceptKey, m.words, m.found, m.used), Cmd_none()];
                }
            }
        }
        case 1:
            if (isLocked(m)) {
                return [m, Cmd_none()];
            }
            else {
                return [resetPick(m), Cmd_none()];
            }
        case 2:
            if (isLocked(m)) {
                return [m, Cmd_none()];
            }
            else {
                const w = processWord(m.currentText);
                if ((w === "") ? true : isEmpty(m.chosen)) {
                    return [m, Cmd_none()];
                }
                else if (contains(w, m.used)) {
                    return [m, Cmd_none()];
                }
                else if (!canUsewords(m)) {
                    return shakeWholePick(m);
                }
                else if (!inwords(m, w)) {
                    return shakeWholePick(m);
                }
                else {
                    const pts = pickScore(m) | 0;
                    const fw = new finded(w, pts);
                    const m2_2 = new Model(new StageOfGame(1, [new Anim(2, [])]), m.board, m.chosen, m.currentText, m.score + pts, m.timeLeft, m.shakeKey, m.shakeWordKey, m.acceptKey + 1, m.words, cons(fw, m.found), add(w, m.used));
                    return [m2_2, cmdDelay(550, new Msg(5, []))];
                }
            }
        case 5: {
            const matchValue_2 = m.phase;
            if (matchValue_2.tag === 1) {
                switch (matchValue_2.fields[0].tag) {
                    case 1:
                        return [(bind$0040_1 = resetPick(m), new Model(new StageOfGame(0, []), bind$0040_1.board, bind$0040_1.chosen, bind$0040_1.currentText, bind$0040_1.score, bind$0040_1.timeLeft, bind$0040_1.shakeKey, bind$0040_1.shakeWordKey, bind$0040_1.acceptKey, bind$0040_1.words, bind$0040_1.found, bind$0040_1.used)), Cmd_none()];
                    case 0:
                        return [new Model(new StageOfGame(0, []), m.board, m.chosen, m.currentText, m.score, m.timeLeft, m.shakeKey, m.shakeWordKey, m.acceptKey, m.words, m.found, m.used), Cmd_none()];
                    case 3:
                        return [m, Cmd_none()];
                    default:
                        return [(bind$0040 = resetPick(m), new Model(new StageOfGame(0, []), bind$0040.board, bind$0040.chosen, bind$0040.currentText, bind$0040.score, bind$0040.timeLeft, bind$0040.shakeKey, bind$0040.shakeWordKey, bind$0040.acceptKey, bind$0040.words, bind$0040.found, bind$0040.used)), Cmd_none()];
                }
            }
            else {
                return [m, Cmd_none()];
            }
        }
        default: {
            const setWords = msg.fields[0];
            return [new Model(m.phase, m.board, m.chosen, m.currentText, m.score, m.timeLeft, m.shakeKey, m.shakeWordKey, m.acceptKey, new WordState(2, [setWords]), m.found, m.used), Cmd_none()];
        }
    }
}

export function topPanel(m) {
    let elems;
    return createElement("div", createObj(ofArray_1([["className", "top-panel"], (elems = [createElement("div", {
        key: "score-" + int32ToString(m.acceptKey),
        className: equals(m.phase, new StageOfGame(1, [new Anim(2, [])])) ? "score-bump" : "",
        children: `Score: ${m.score}`,
    }), createElement("div", {
        children: `Time: ${m.timeLeft}s`,
    })], ["children", reactApi.Children.toArray(Array.from(elems))])])));
}

export function wordDisplay(m) {
    let elems_1;
    let shakeWord;
    const matchValue = m.phase;
    let matchResult;
    if (matchValue.tag === 1) {
        if (matchValue.fields[0].tag === 1) {
            matchResult = 0;
        }
        else {
            matchResult = 1;
        }
    }
    else {
        matchResult = 1;
    }
    switch (matchResult) {
        case 0: {
            shakeWord = true;
            break;
        }
        default:
            shakeWord = false;
    }
    const pickedCells = map_1((i) => item(i, m.board), m.chosen);
    return createElement("div", createObj(ofArray_1([["key", int32ToString(m.shakeWordKey)], ["className", ("word-display display-glow " + (shakeWord ? "shake" : "")) + (equals(m.phase, new StageOfGame(1, [new Anim(2, [])])) ? " accept-overflow" : "")], (elems_1 = mapIndexed((i_1, c) => createElement("div", createObj(toList(delay(() => append_1(singleton_2(["key", (int32ToString(c.id) + "-") + int32ToString(m.acceptKey)]), delay(() => append_1(singleton_2(["className", "picked-cell " + (equals(m.phase, new StageOfGame(1, [new Anim(2, [])])) ? "fly-to-score" : "")]), delay(() => append_1(equals(m.phase, new StageOfGame(1, [new Anim(2, [])])) ? singleton_2(["style", {
        animationDelay: `${i_1 * 0.07}s`,
    }]) : empty_2(), delay(() => {
        let elems;
        return singleton_2((elems = [createElement("div", {
            className: "picked-cell-points",
            children: int32ToString(c.char.point),
        }), createElement("div", {
            className: "picked-cell-char",
            children: c.char.sym,
        })], ["children", reactApi.Children.toArray(Array.from(elems))]));
    })))))))))), pickedCells), ["children", reactApi.Children.toArray(Array.from(elems_1))])])));
}

export function wordsList(m) {
    let elems_1;
    return createElement("div", createObj(ofArray_1([["className", "words-list"], (elems_1 = toList(delay(() => append_1((m.timeLeft === 0) ? singleton_2(createElement("div", {
        className: "words-title",
        children: "FOUND WORDS",
    })) : empty_2(), delay(() => {
        if (isEmpty(m.found)) {
            return singleton_2(createElement("div", {
                className: "words-empty",
                children: "No words found",
            }));
        }
        else {
            const best = maxBy((x) => x.points, m.found, {
                Compare: comparePrimitives,
            });
            return append_1(singleton_2(createElement("div", {
                className: "words-best",
                children: `Best word: ${best.text} (+${best.points})`,
            })), delay(() => map_1((x_4) => {
                let elems;
                return createElement("div", createObj(ofArray_1([["className", "word-row"], (elems = [createElement("div", {
                    children: x_4.text,
                }), createElement("div", {
                    className: "word-row-points",
                    children: int32ToString(x_4.points),
                })], ["children", reactApi.Children.toArray(Array.from(elems))])])));
            }, sortByDescending((x_2) => x_2.points, m.found, {
                Compare: comparePrimitives,
            }))));
        }
    })))), ["children", reactApi.Children.toArray(Array.from(elems_1))])])));
}

export function cellView(c, m, dispatch) {
    let i;
    const selected = contains_1(c.id, m.chosen, {
        Equals: (x, y) => (x === y),
        GetHashCode: numberHash,
    });
    let shakeOne;
    const matchValue = m.phase;
    let matchResult, i_1;
    if (matchValue.tag === 1) {
        if (matchValue.fields[0].tag === 0) {
            if ((i = (matchValue.fields[0].fields[0] | 0), i === c.id)) {
                matchResult = 0;
                i_1 = matchValue.fields[0].fields[0];
            }
            else {
                matchResult = 1;
            }
        }
        else {
            matchResult = 1;
        }
    }
    else {
        matchResult = 1;
    }
    switch (matchResult) {
        case 0: {
            shakeOne = true;
            break;
        }
        default:
            shakeOne = false;
    }
    let shakeSelected;
    const matchValue_1 = m.phase;
    let matchResult_1;
    if (matchValue_1.tag === 1) {
        if (matchValue_1.fields[0].tag === 1) {
            if (selected) {
                matchResult_1 = 0;
            }
            else {
                matchResult_1 = 1;
            }
        }
        else {
            matchResult_1 = 1;
        }
    }
    else {
        matchResult_1 = 1;
    }
    switch (matchResult_1) {
        case 0: {
            shakeSelected = true;
            break;
        }
        default:
            shakeSelected = false;
    }
    let falling;
    const matchValue_2 = m.phase;
    let matchResult_2;
    if (matchValue_2.tag === 1) {
        if (matchValue_2.fields[0].tag === 3) {
            matchResult_2 = 0;
        }
        else {
            matchResult_2 = 1;
        }
    }
    else {
        matchResult_2 = 1;
    }
    switch (matchResult_2) {
        case 0: {
            falling = true;
            break;
        }
        default:
            falling = false;
    }
    const shake = shakeOne ? true : shakeSelected;
    return createElement("div", createObj(toList(delay(() => append_1(singleton_2(["key", (int32ToString(c.id) + "-") + int32ToString(shake ? m.shakeKey : 0)]), delay(() => append_1(singleton_2(["className", (("cell" + (selected ? " selected" : "")) + (shake ? " shake" : "")) + (falling ? " fall" : "")]), delay(() => append_1(falling ? singleton_2(["style", {
        animationDelay: `${c.id * 0.03}s`,
    }]) : empty_2(), delay(() => append_1(singleton_2(["onClick", (_arg) => {
        if (!isLocked(m)) {
            dispatch(new Msg(0, [c.id]));
        }
    }]), delay(() => {
        let elems;
        return singleton_2((elems = [createElement("div", {
            className: "cell-points",
            children: int32ToString(c.char.point),
        }), createElement("div", {
            className: "cell-char",
            children: c.char.sym,
        })], ["children", reactApi.Children.toArray(Array.from(elems))]));
    }))))))))))));
}

export function board(m, dispatch) {
    let elems;
    return createElement("div", createObj(ofArray_1([["className", "board"], (elems = map_1((c) => cellView(c, m, dispatch), ofArray_1(m.board)), ["children", reactApi.Children.toArray(Array.from(elems))])])));
}

export function buttons(m, dispatch) {
    let elems;
    const locked = isLocked(m);
    return createElement("div", createObj(ofArray_1([["className", "buttons"], (elems = [createElement("button", {
        className: "btn btn-clear",
        children: "❌",
        disabled: locked,
        onClick: (_arg) => {
            if (!locked) {
                dispatch(new Msg(1, []));
            }
        },
    }), createElement("button", {
        className: "btn btn-submit",
        children: "✅",
        disabled: locked,
        onClick: (_arg_1) => {
            if (!locked) {
                dispatch(new Msg(2, []));
            }
        },
    })], ["children", reactApi.Children.toArray(Array.from(elems))])])));
}

export function view(m, dispatch) {
    let elems_1;
    return createElement("div", createObj(ofArray_1([["className", "app-container"], (elems_1 = toList(delay(() => append_1(singleton_2(topPanel(m)), delay(() => append_1((m.timeLeft === 0) ? singleton_2(createElement("div", {
        className: "game-over",
        children: "⏰ GAME OVER",
    })) : singleton_2(defaultOf()), delay(() => append_1(singleton_2(wordDisplay(m)), delay(() => {
        let elems;
        return (m.phase.tag === 2) ? singleton_2(wordsList(m)) : singleton_2(createElement("div", createObj(singleton_1((elems = toList(delay(() => append_1(singleton_2(board(m, dispatch)), delay(() => ((m.timeLeft > 0) ? singleton_2(buttons(m, dispatch)) : singleton_2(defaultOf())))))), ["children", reactApi.Children.toArray(Array.from(elems))])))));
    })))))))), ["children", reactApi.Children.toArray(Array.from(elems_1))])])));
}

ProgramModule_run(Program_withReactSynchronous("app", ProgramModule_mkProgram(init, update, view)));

