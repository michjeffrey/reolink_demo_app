"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFiber = void 0;
var EFiberStatus;
(function (EFiberStatus) {
    EFiberStatus[EFiberStatus["IDLE"] = 0] = "IDLE";
    EFiberStatus[EFiberStatus["RUNNING"] = 1] = "RUNNING";
})(EFiberStatus || (EFiberStatus = {}));
class FiberContext {
    constructor(data, _registerWakeUpHook) {
        this.data = data;
        this._registerWakeUpHook = _registerWakeUpHook;
    }
    hibernate() {
        if (this._hibernatePr) {
            throw new Error('Fiber already hibernated.');
        }
        this._hibernatePr = new Promise((resolve, reject) => {
            this._registerWakeUpHook((v) => {
                delete this._hibernatePr;
                resolve(v);
            }, (e) => {
                delete this._hibernatePr;
                reject(e);
            });
        });
        return this._hibernatePr;
    }
}
class Fiber {
    constructor(_body) {
        this._body = _body;
        this._status = EFiberStatus.IDLE;
    }
    run(args, nextTick = true) {
        if (this._status !== EFiberStatus.IDLE) {
            return false;
        }
        this._status = EFiberStatus.RUNNING;
        if (nextTick) {
            setTimeout(() => { this._doRun(args); }, 0);
        }
        else {
            this._doRun(args);
        }
        return true;
    }
    _doRun(args) {
        this._pr = (async () => {
            try {
                const ret = await this._body(new FiberContext(args, (resolve, reject) => { this._wakeUpHook = { resolve, reject }; }));
                this._status = EFiberStatus.IDLE;
                this.data = undefined;
                return ret;
            }
            catch (e) {
                this._status = EFiberStatus.IDLE;
                this.data = undefined;
                throw e;
            }
        })();
        this.data = args;
    }
    wait() {
        if (this._status === EFiberStatus.IDLE) {
            return Promise.reject(new Error('Fiber is not running.'));
        }
        return this._pr;
    }
    wakeUp(v) {
        if (this._status !== EFiberStatus.RUNNING || !this._wakeUpHook) {
            return false;
        }
        this._wakeUpHook.resolve(v);
        delete this._wakeUpHook;
        return true;
    }
    error(v) {
        if (this._status !== EFiberStatus.RUNNING || !this._wakeUpHook) {
            return false;
        }
        this._wakeUpHook.reject(v);
        delete this._wakeUpHook;
        return true;
    }
}
function createFiber(cb) {
    return new Fiber(cb);
}
exports.createFiber = createFiber;
//# sourceMappingURL=Fibers.js.map