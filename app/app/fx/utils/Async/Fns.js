"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hrDuration = exports.duration = exports.invokeAsync = exports.once = exports.retry = exports.sleepWithControl = exports.ESleepControlFlag = exports.sleep = void 0;
const E = __importStar(require("../Errors/Defs"));
const Validation = __importStar(require("../Validation"));
function doSleep(ms, param) {
    return new Promise((resolve) => setTimeout(resolve, ms, param));
}
const sleep = async function sleep(ms, param) {
    let NOW = Date.now();
    const endAt = NOW + ms;
    while (endAt - NOW > 60000) {
        await doSleep(60000);
        NOW = Date.now();
    }
    if (NOW < endAt) {
        return doSleep(endAt - NOW, param);
    }
    return param;
};
exports.sleep = sleep;
var ESleepControlFlag;
(function (ESleepControlFlag) {
    ESleepControlFlag[ESleepControlFlag["RETURN_NOW"] = 0] = "RETURN_NOW";
    ESleepControlFlag[ESleepControlFlag["ABORT"] = 1] = "ABORT";
})(ESleepControlFlag = exports.ESleepControlFlag || (exports.ESleepControlFlag = {}));
function sleepWithControl(opts) {
    let flag = null;
    const ctrl = (f) => {
        flag = f;
    };
    const ACC = opts.accuracy ?? 60000;
    const pr = (async () => {
        let NOW = Date.now();
        const endAt = Date.now() + opts.timeout;
        while (endAt - NOW > ACC) {
            await (0, exports.sleep)(ACC);
            if (flag !== null) {
                switch (flag) {
                    case ESleepControlFlag.ABORT:
                        throw new E.E_SLEEP_ABORTED();
                    case ESleepControlFlag.RETURN_NOW:
                        return opts.context;
                }
            }
            NOW = Date.now();
        }
        if (NOW < endAt) {
            await (0, exports.sleep)(endAt - NOW);
        }
        return opts.context;
    })();
    return [ctrl, pr];
}
exports.sleepWithControl = sleepWithControl;
const WAIT_TIMER_CACHE = {
    'default': (i) => 1000 * Math.abs(i)
};
async function retry(opts) {
    opts = { ...opts };
    let wait = opts.wait ?? WAIT_TIMER_CACHE['default'];
    if (typeof wait === 'number') {
        if (Validation.isNonNegativeInteger(wait)) {
            wait = WAIT_TIMER_CACHE[wait] ?? (WAIT_TIMER_CACHE[wait] = (new Function(`return ${wait}`)));
        }
        else {
            wait = WAIT_TIMER_CACHE['default'];
        }
    }
    if (opts.maxTimes === 0 || !Validation.isInteger(opts.maxTimes)) {
        return opts.callback(0);
    }
    for (let i = 1; i !== opts.maxTimes + 1; ++i) {
        try {
            return await opts.callback(i - 1);
        }
        catch (e) {
            if (!(opts.isRetryable?.(e) ?? true) || i === opts.maxTimes) {
                throw e;
            }
        }
        const t = wait(i);
        await (0, exports.sleep)(Validation.isSafeNonNegativeInteger(t) ? t : WAIT_TIMER_CACHE['default'](i));
    }
    throw new E.E_EXCEEDED_RETRYABLE_TIMES();
}
exports.retry = retry;
function once(fn) {
    let pr = null;
    return function (...args) {
        if (pr === null) {
            try {
                pr = fn(...args);
            }
            catch (e) {
                pr = Promise.reject(e);
            }
        }
        return pr;
    };
}
exports.once = once;
function invokeAsync(asyncFn, ...args) {
    asyncFn(...args).catch(console.error);
}
exports.invokeAsync = invokeAsync;
async function duration(cb) {
    const start = Date.now();
    try {
        const ret = await cb();
        return [Date.now() - start, ret];
    }
    catch (e) {
        if (typeof e === 'object' && e !== null) {
            e.__duration = Date.now() - start;
        }
        throw e;
    }
}
exports.duration = duration;
async function hrDuration(cb) {
    const start = process.hrtime.bigint();
    try {
        const ret = await cb();
        return [Number(process.hrtime.bigint() - start), ret];
    }
    catch (e) {
        if (typeof e === 'object' && e !== null) {
            e.__duration = Number(process.hrtime.bigint() - start);
        }
        throw e;
    }
}
exports.hrDuration = hrDuration;
//# sourceMappingURL=Fns.js.map