import { Record } from "../../../../../../../../../../../../Downloads/v8s/v8/calc/build/fable_modules/fable-library-js.4.24.0/Types.js";
import { record_type, string_type } from "../../../../../../../../../../../../Downloads/v8s/v8/calc/build/fable_modules/fable-library-js.4.24.0/Reflection.js";

export class FragmentProps extends Record {
    constructor(key) {
        super();
        this.key = key;
    }
}

export function FragmentProps_$reflection() {
    return record_type("Fable.React.FragmentProps", [], FragmentProps, () => [["key", string_type]]);
}

