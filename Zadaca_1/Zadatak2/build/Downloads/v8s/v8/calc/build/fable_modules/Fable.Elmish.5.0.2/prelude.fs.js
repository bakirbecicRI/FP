import { some } from "../../../../../../../../../../../../Downloads/v8s/v8/calc/build/fable_modules/fable-library-js.4.24.0/Option.js";
import Timer from "../../../../../../../../../../../../Downloads/v8s/v8/calc/build/fable_modules/fable-library-js.4.24.0/Timer.js";
import { add } from "../../../../../../../../../../../../Downloads/v8s/v8/calc/build/fable_modules/fable-library-js.4.24.0/Observable.js";
import { startImmediate } from "../../../../../../../../../../../../Downloads/v8s/v8/calc/build/fable_modules/fable-library-js.4.24.0/Async.js";

export function Log_onError(text, ex) {
    console.error(some(text), ex);
}

export function Log_toConsole(text, o) {
    console.log(some(text), o);
}

export function Timer_delay(interval, callback) {
    let t;
    let returnVal = new Timer(interval);
    returnVal.AutoReset = false;
    t = returnVal;
    add(callback, t.Elapsed());
    t.Enabled = true;
    t.Start();
}

export function AsyncHelpers_start(x) {
    Timer_delay(1, (_arg) => {
        startImmediate(x);
    });
}

