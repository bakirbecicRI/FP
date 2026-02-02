import { iterate } from "../../../../../../../../../../../../Downloads/v8s/v8/calc/build/fable_modules/fable-library-js.4.24.0/Seq.js";
import { disposeSafe } from "../../../../../../../../../../../../Downloads/v8s/v8/calc/build/fable_modules/fable-library-js.4.24.0/Util.js";
import { toArray } from "../../../../../../../../../../../../Downloads/v8s/v8/calc/build/fable_modules/fable-library-js.4.24.0/Option.js";

export function optDispose(disposeOption) {
    return {
        Dispose() {
            iterate((d) => {
                let copyOfStruct = d;
                disposeSafe(copyOfStruct);
            }, toArray(disposeOption));
        },
    };
}

