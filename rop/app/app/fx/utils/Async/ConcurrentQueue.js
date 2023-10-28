"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractConcurrentQueue = exports.EQueueStatus = void 0;
const Fns_1 = require("./Fns");
const Number_1 = require("../Number");
const Object_1 = require("../Object");
var EQueueStatus;
(function (EQueueStatus) {
    EQueueStatus[EQueueStatus["IDLE"] = 0] = "IDLE";
    EQueueStatus[EQueueStatus["RUNNING"] = 1] = "RUNNING";
    EQueueStatus[EQueueStatus["STOPPING"] = 2] = "STOPPING";
})(EQueueStatus = exports.EQueueStatus || (exports.EQueueStatus = {}));
class AbstractConcurrentQueue {
    constructor() {
        this._pendingQueue = [];
        this._status = EQueueStatus.IDLE;
        this._stopPromise = null;
        this._emptyPromise = null;
        this._maxFibers = 1;
        this.endless = false;
    }
    get maxFibers() {
        return this._maxFibers;
    }
    set maxFibers(v) {
        if (this.status === EQueueStatus.RUNNING) {
            throw new Error('Can not change maximum fibers on running time.');
        }
        this._maxFibers = v;
    }
    get status() {
        return this._status;
    }
    get qty() {
        return this._pendingQueue.length;
    }
    enqueue(data) {
        if (Array.isArray(data)) {
            this._pendingQueue.push(...data);
        }
        else {
            this._pendingQueue.push(data);
        }
    }
    start() {
        switch (this._status) {
            case EQueueStatus.RUNNING:
                return;
            case EQueueStatus.STOPPING:
                throw new Error('Can not start queue while it is being shutting down.');
            case EQueueStatus.IDLE:
                break;
        }
        this._status = EQueueStatus.RUNNING;
        this._stopPromise = new Promise((resolve) => {
            this._resolveStopPromise = resolve;
        });
        setTimeout(() => {
            (0, Fns_1.invokeAsync)(async () => {
                const result = await Promise.allSettled((0, Number_1.range)(0, this.maxFibers - 1)
                    .map((i) => this._fiberBody(i)));
                if (this._stopPromise) {
                    this._status = EQueueStatus.IDLE;
                    this._stopPromise = null;
                    this._resolveStopPromise(result);
                }
            });
        }, 0);
    }
    stop() {
        switch (this._status) {
            case EQueueStatus.IDLE:
                return Promise.resolve(new Array(this.maxFibers).fill(null));
            case EQueueStatus.STOPPING:
                return this._stopPromise;
            case EQueueStatus.RUNNING:
                break;
        }
        this._status = EQueueStatus.STOPPING;
        return this._stopPromise;
    }
    waitStop() {
        switch (this._status) {
            case EQueueStatus.IDLE:
                return Promise.resolve(new Array(this.maxFibers).fill(null));
            case EQueueStatus.RUNNING:
            case EQueueStatus.STOPPING:
                return this._stopPromise;
        }
        return this._stopPromise;
    }
    async _fiberBody(fiberId) {
        while (this._status === EQueueStatus.RUNNING) {
            if (!this._pendingQueue.length) {
                if (!this.endless) {
                    break;
                }
                if (this._emptyPromise !== null) {
                    try {
                        await this._emptyPromise;
                    }
                    catch (e) {
                        console.error(`[Fiber#${fiberId}] Unhandled error in empty event callback:`);
                        console.error(e);
                    }
                }
                else {
                    this._emptyPromise = this._onQueueEmpty(fiberId);
                    try {
                        await this._emptyPromise;
                    }
                    catch (e) {
                        console.error(`[Fiber#${fiberId}] Unhandled error in empty event callback:`);
                        console.error(e);
                    }
                    this._emptyPromise = null;
                }
                continue;
            }
            const item = this._pendingQueue.shift();
            try {
                await this._process(item, fiberId);
            }
            catch (e) {
                console.error(`class ${(0, Object_1.getClassOfObject)(this).name} fiber#${fiberId} process error:`);
                console.error(e);
            }
        }
    }
}
exports.AbstractConcurrentQueue = AbstractConcurrentQueue;
//# sourceMappingURL=ConcurrentQueue.js.map