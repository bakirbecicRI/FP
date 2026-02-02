import { Record } from "./fable_modules/fable-library-js.4.24.0/Types.js";
import { record_type, int32_type, char_type } from "./fable_modules/fable-library-js.4.24.0/Reflection.js";
import { cons, append, length, toArray, item, ofArray } from "./fable_modules/fable-library-js.4.24.0/List.js";
import { nonSeeded } from "./fable_modules/fable-library-js.4.24.0/Random.js";
import { singleton, collect, delay, toList } from "./fable_modules/fable-library-js.4.24.0/Seq.js";
import { rangeDouble } from "./fable_modules/fable-library-js.4.24.0/Range.js";
import { setItem, item as item_1 } from "./fable_modules/fable-library-js.4.24.0/Array.js";

export class Slovo extends Record {
    constructor(sym, point) {
        super();
        this.sym = sym;
        this.point = (point | 0);
    }
}

export function Slovo_$reflection() {
    return record_type("BoardModel.Slovo", [], Slovo, () => [["sym", char_type], ["point", int32_type]]);
}

export const vowels = ofArray([new Slovo("A", 1), new Slovo("E", 1), new Slovo("I", 1), new Slovo("O", 1), new Slovo("U", 2)]);

export const rares = ofArray([new Slovo("X", 10), new Slovo("J", 10), new Slovo("Q", 10), new Slovo("Z", 10)]);

export const commons = ofArray([new Slovo("B", 4), new Slovo("C", 4), new Slovo("D", 2), new Slovo("F", 4), new Slovo("G", 3), new Slovo("H", 4), new Slovo("K", 5), new Slovo("L", 1), new Slovo("M", 3), new Slovo("M", 1), new Slovo("P", 4), new Slovo("R", 1), new Slovo("S", 1), new Slovo("T", 1), new Slovo("V", 4), new Slovo("W", 4), new Slovo("Y", 4)]);

export const no_vowels = ofArray(["B", "C", "D", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "T"]);

export function make_vowels() {
    const r = nonSeeded();
    const n_vowels = r.Next2(5, 9) | 0;
    return toList(delay(() => collect((matchValue) => {
        const idx = r.Next1(4) | 0;
        return singleton(item(idx, vowels));
    }, rangeDouble(1, 1, n_vowels))));
}

export function make_commons(n) {
    const r = nonSeeded();
    return toList(delay(() => collect((matchValue) => {
        const idx = r.Next2(0, 17) | 0;
        return singleton(item(idx, commons));
    }, rangeDouble(1, 1, n))));
}

export function maybe_rare() {
    const r = nonSeeded();
    if (r.Next2(0, 15) === 13) {
        const idx = r.Next2(0, 4) | 0;
        return item(idx, rares);
    }
    else {
        return undefined;
    }
}

export function shuffle(xs) {
    const rng = nonSeeded();
    const a = toArray(xs);
    for (let i = a.length - 1; i >= 1; i--) {
        const j = rng.Next1(i + 1) | 0;
        const tmp = item_1(i, a);
        setItem(a, i, item_1(j, a));
        setItem(a, j, tmp);
    }
    return ofArray(a);
}

export function isSelectionValid(lastIdx, newIdx) {
    if (lastIdx === -1) {
        return true;
    }
    else {
        const side = 4;
        const lr = ~~(lastIdx / side) | 0;
        const lc = (lastIdx % side) | 0;
        const nr = ~~(newIdx / side) | 0;
        const nc = (newIdx % side) | 0;
        const dr = Math.abs(lr - nr) | 0;
        const dc = Math.abs(lc - nc) | 0;
        if ((dr <= 1) && (dc <= 1)) {
            if (dr !== 0) {
                return true;
            }
            else {
                return dc !== 0;
            }
        }
        else {
            return false;
        }
    }
}

export function make_board() {
    const vowels_1 = make_vowels();
    const matchValue = maybe_rare();
    const matchValue_1 = maybe_rare();
    if (matchValue == null) {
        if (matchValue_1 == null) {
            const commons_4 = make_commons(16 - length(vowels_1));
            return shuffle(append(vowels_1, commons_4));
        }
        else {
            const r2_1 = matchValue_1;
            const commons_3 = make_commons(15 - length(vowels_1));
            return shuffle(append(vowels_1, cons(r2_1, commons_3)));
        }
    }
    else if (matchValue_1 == null) {
        const r1_1 = matchValue;
        const commons_2 = make_commons(15 - length(vowels_1));
        return shuffle(append(vowels_1, cons(r1_1, commons_2)));
    }
    else {
        const r1 = matchValue;
        const r2 = matchValue_1;
        const commons_1 = make_commons(14 - length(vowels_1));
        return shuffle(cons(r1, append(vowels_1, cons(r2, commons_1))));
    }
}

